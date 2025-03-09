import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'

type CustomComponentProp = {
    title: string;
    handlePress: () => void;
    containerStyles?: string;
    textStyles?: string;
    isLoading?: boolean;
}


const CustomButton: React.FC<CustomComponentProp> = ({ title, handlePress, textStyles, containerStyles, isLoading }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            disabled={isLoading}
            className={`bg-secondary rounded-xl min-h-[62px] justify-center items-center ${containerStyles} ${isLoading ? 'opacity-50' : ''}`}
            onPress={handlePress}
        >
            <Text className={`text-primary font-psemibold text-lg ${textStyles}`} >{title}</Text>
        </TouchableOpacity>
    )
}

export default CustomButton