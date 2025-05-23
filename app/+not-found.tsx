
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';

export default function NotFound() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-red-500 mb-4">404 - Page Not Found</Text>
      <Pressable
        onPress={() => router.replace('/')}
        className="bg-blue-500 px-4 py-2 rounded"
      >
        <Text className="text-white">Go to Home</Text>
      </Pressable>
    </View>
  );
}
