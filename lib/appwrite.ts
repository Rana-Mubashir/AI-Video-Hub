import { Account, Avatars, Client, Databases, ID, ImageGravity, Query, Storage } from 'react-native-appwrite';



export const appwriteConfig = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: "com.faraz.aora",
    projectId: '66c19f260023ad45038f',
    databaseId: '66c1b381000c66583111',
    userCollectionId: '66c1b3be0022bf3d14d5',
    videoCollectionId: '66c1b3f300046b10d88f',
    storageId: '66c1ec7900384f2cc460',
}

const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setPlatform(appwriteConfig.platform)
    ;

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

type CreateUserProps = {
    email: string;
    password: string;
    username: string;
}

export const createUser = async ({ email, password, username }: CreateUserProps) => {
    try {
        const newAccount = await account.create(ID.unique(), email, password, username);
        if (!newAccount) throw Error;
        const avatarUrl = avatars.getInitials(username);

        await signIn({ email, password });

        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                accountId: newAccount.$id,
                email,
                avatar: avatarUrl,
                username
            }
        );
        return newUser;
    } catch (error) {
        console.log(error);
        throw new Error(error instanceof Error ? error.message : String(error));
    }
}


export async function signIn({ email, password }: { email: string, password: string }) {
    try {
        const session = await account.createEmailPasswordSession(email, password);
        return session;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : String(error));
    }
}


// Sign Out
export async function signOut() {
    try {
        const session = await account.deleteSession("current");

        return session;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : String(error));
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();
        if (!currentAccount) throw Error;
        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        );
        if (!currentUser) throw Error;
        return currentUser;
    } catch (error) {
        console.log(error);
    }
}


export const getAllPosts = async () => {
    try {
        const posts = databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.videoCollectionId,
        )
        return posts;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : String(error));
    }
}


// Get video posts created by user
export async function getUserPosts(userId: any) {
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.videoCollectionId,
            [Query.equal("creator", userId)]
        );

        return posts.documents;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : String(error));
    }
}


// Upload File
export async function uploadFile(file: any, type: any) {
    if (!file) return;

    const { mimeType, ...rest } = file;
    const asset = { type: mimeType, ...rest };

    try {
        const uploadedFile = await storage.createFile(
            appwriteConfig.storageId,
            ID.unique(),
            asset
        );

        const fileUrl = await getFilePreview(uploadedFile.$id, type);
        return fileUrl;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : String(error));
    }
}


// Get File Preview
export async function getFilePreview(fileId: any, type: any) {
    let fileUrl;

    try {
        if (type === "video") {
            fileUrl = storage.getFileView(appwriteConfig.storageId, fileId);
        } else if (type === "image") {
            fileUrl = storage.getFilePreview(
                appwriteConfig.storageId,
                fileId,
                2000,
                2000,
                "top" as ImageGravity,
                100
            );
        } else {
            throw new Error("Invalid file type");
        }

        if (!fileUrl) throw Error;

        return fileUrl;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : String(error));
    }
}


// Create Video Post
export async function createVideoPost(form: any) {
    try {
        const [thumbnailUrl, videoUrl] = await Promise.all([
            uploadFile(form.thumbnail, "image"),
            uploadFile(form.video, "video"),
        ]);

        const newPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.videoCollectionId,
            ID.unique(),
            {
                title: form.title,
                thumbnail: thumbnailUrl,
                video: videoUrl,
                prompt: form.prompt,
                creator: form.userId,
            }
        );

        return newPost;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : String(error));
    }
}

// Get video posts that matches search query
export async function searchPosts(query: any) {
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.videoCollectionId,
            [Query.search("title", query)]
        );

        if (!posts) throw new Error("Something went wrong");

        return posts.documents;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : String(error));
    }
}

// Get latest created video posts
export async function getLatestPosts() {
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.videoCollectionId,
            [Query.orderDesc("$createdAt"), Query.limit(7)]
        );

        return posts.documents;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : String(error));
    }
}
