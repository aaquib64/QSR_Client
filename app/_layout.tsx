// app/_layout.tsx
import { Stack } from 'expo-router';
import { EmployeeProvider } from '../context/EmployeeContext'; // custom hook from context


export default function RootLayout() {
  return (
    <EmployeeProvider>
     <Stack screenOptions={{ headerShown: false }} />
    </EmployeeProvider>
  );
}
