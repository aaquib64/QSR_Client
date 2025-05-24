import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useEmployee } from '../context/EmployeeContext';

export default function Login() {
  const [employeeId, setEmployeeId] = useState('');
  const router = useRouter();
  const { setEmployeeData } = useEmployee();

  const handleLogin = async () => {
    if (!employeeId.trim()) {
      Alert.alert('Error', 'Employee ID is required');
      return;
    }

    try {
      const res = await axios.post('https://qsr-server.onrender.com/login', { employeeId });
      if (res.data.success) {
        setEmployeeData({ name: res.data.name, id: employeeId });
        // Alert.alert('Success', 'Login Successful!');
        router.push('/menu');
      } else {
        Alert.alert('Invalid ID', 'Employee ID not found');
      }
    } catch (error) {
      Alert.alert('Server Error', 'Something went wrong while validating');
      console.error(error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContainer}
      >
        {Platform.OS !== 'web' ? (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <View style={styles.container}>
              <Image source={require('../assets/images/logo.png')} style={styles.logo} />

              <Text style={styles.header}>Quick Service Restaurant</Text>
              <Text style={styles.subtitle}>
                Discover the best food near you at unbeatable prices!
              </Text>

              <TextInput
                placeholder="Enter Employee ID"
                placeholderTextColor="#999"
                style={styles.input}
                value={employeeId}
                onChangeText={setEmployeeId}
                accessible
                accessibilityLabel="Employee ID Input"
                keyboardType="default"
                autoCorrect={false}
                autoCapitalize="none"
                spellCheck={false}
              />

              <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                accessible
                accessibilityLabel="Login Button"
              >
                <Text style={styles.buttonText}>Proceed</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        ) : (
          <View style={styles.container}>
           <Image source={require('../assets/images/logo.png')} style={styles.logo} />

            <Text style={styles.header}>Quick Service Restaurant</Text>
            <Text style={styles.subtitle}>
              Discover the best food near you at unbeatable prices!
            </Text>

            <TextInput
              placeholder="Enter Employee ID"
              placeholderTextColor="#999"
              style={styles.input}
              value={employeeId}
              onChangeText={setEmployeeId}
              accessible
              accessibilityLabel="Employee ID Input"
              keyboardType="default"
              autoCorrect={false}
              autoCapitalize="none"
              spellCheck={false}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              accessible
              accessibilityLabel="Login Button"
            >
              <Text style={styles.buttonText}>Proceed</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
  flex: 1,
  backgroundColor: '#ffffff',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
  width: '100%',
  maxWidth: 400, // limit width like a mobile screen
  alignSelf: 'center', // center horizontally on web
},
  logo: {
    width: width * 0.5,
    height: width * 0.5,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
 input: {
  width: '100%',
  maxWidth: 350, // prevent stretching
  borderWidth: 1,
  borderColor: '#bdc3c7',
  borderRadius: 10,
  padding: 12,
  fontSize: 16,
  marginBottom: 20,
  backgroundColor: '#fff',
},
  button: {
    backgroundColor: 'red',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});



// import axios from 'axios';
// import { useRouter } from 'expo-router';
// import React, { useState } from 'react';
// import {
//   Alert,
//   Dimensions,
//   Image,
//   Keyboard,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   TouchableWithoutFeedback,
//   View,
// } from 'react-native';
// import logo from '../assets/LoginIcon.png';
// import { useEmployee } from '../context/EmployeeContext'; // custom context

// export default function Login() {
//   const [employeeId, setEmployeeId] = useState('');
//   const router = useRouter();
//   const { setEmployeeData } = useEmployee();

//   const handleLogin = async () => {
//     if (!employeeId.trim()) {
//       Alert.alert('Error', 'Employee ID is required');
//       return;
//     }

//     try {
//       const res = await axios.post('https://qsr-server.onrender.com/login', {
//         employeeId,
//       });

//       if (res.data.success) {
//         const { name } = res.data;
//         setEmployeeData({ name, id: employeeId });
//         Alert.alert('Success', 'Login Successful!');
//         router.push('/menu');
//       } else {
//         Alert.alert('Invalid ID', 'Employee ID not found');
//       }
//     } catch (error) {
//       Alert.alert('Server Error', 'Something went wrong while validating');
//       console.error(error);
//     }
//   };

//   return (
//     <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//       <View style={{ flex: 1 }}>
//         <ScrollView contentContainerStyle={styles.scrollContainer}>
//           <KeyboardAvoidingView
//             behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//             style={{ flex: 1 }}
//           >
//             <View style={styles.container}>
//               <Image source={logo} style={styles.logo} />
//               <Text style={styles.header}>Quick Service Restaurant</Text>
//               <Text style={styles.subtitle}>
//                 Discover the best food near you at unbeatable prices!
//               </Text>

//               <TextInput
//                 placeholder="Enter Employee ID"
//                 placeholderTextColor="#999"
//                 style={styles.input}
//                 value={employeeId}
//                 onChangeText={setEmployeeId}
//                 accessible
//                 accessibilityLabel="Employee ID Input"
//               />

//               <TouchableOpacity
//                 style={styles.button}
//                 onPress={handleLogin}
//                 accessible
//                 accessibilityLabel="Login Button"
//               >
//                 <Text style={styles.buttonText}>Proceed</Text>
//               </TouchableOpacity>
//             </View>
//           </KeyboardAvoidingView>
//         </ScrollView>
//       </View>
//     </TouchableWithoutFeedback>
//   );
// }

// const { width } = Dimensions.get('window');

// const styles = StyleSheet.create({
//   scrollContainer: {
//     flexGrow: 1,
//     justifyContent: 'center',
//   },
//   container: {
//     flex: 1,
//     backgroundColor: '#ffffff',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 24,
//   },
//   logo: {
//     width: width * 0.5,
//     height: width * 0.5,
//     marginBottom: 20,
//     resizeMode: 'contain',
//   },
//   header: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: 'red',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#7f8c8d',
//     textAlign: 'center',
//     marginBottom: 30,
//     paddingHorizontal: 10,
//   },
//   input: {
//     width: '100%',
//     borderWidth: 1,
//     borderColor: '#bdc3c7',
//     borderRadius: 10,
//     padding: 12,
//     fontSize: 16,
//     marginBottom: 20,
//     backgroundColor: '#fff',
//   },
//   button: {
//     backgroundColor: 'red',
//     paddingVertical: 12,
//     paddingHorizontal: 32,
//     borderRadius: 10,
//     elevation: 2,
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: '600',
//   },
// });






//-------------------------------------------------------------------------------------//

// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   Image,
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import axios from 'axios';
// import logo from '../assets/LoginIcon.png';
// import '@/global.css'
// import { useEmployee } from '../context/EmployeeContext'; // custom hook from context
 


// export default function Login() {
//   const [employeeId, setEmployeeId] = useState('');
//   const router = useRouter();
// const { setEmployeeData } = useEmployee();

//   const handleLogin = async () => {
//     if (!employeeId.trim()) {
//       Alert.alert('Error', 'Employee ID is required');
//       return;
//     }

//     try {
//       const res = await axios.post('https://qsr-server.onrender.com/login', {
//         employeeId,
//       });
       

//       if (res.data.success) {
//         const { name } = res.data;
//        setEmployeeData({ name, id: employeeId });
//         console.log("Name set in context:", name);

//         Alert.alert('Success', 'Login Successful!');
//         router.push('/menu');
//       } else {
//         Alert.alert('Invalid ID', 'Employee ID not found');
//       }
//     } catch (error) {
//       Alert.alert('Server Error', 'Something went wrong while validating');
//       console.error(error);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Image source={logo} style={styles.logo} />
//       <Text style={styles.header}>Quick Service Restaurant</Text>
//       <Text style={styles.subtitle}>
//        Discover the best food near you at unbeatable prices!
//       </Text>
//       <TextInput
//         placeholder="Enter Employee ID"
//         placeholderTextColor="#999"
//         style={styles.input}
//         value={employeeId}
//         onChangeText={setEmployeeId}
//       />
//       <TouchableOpacity style={styles.button} onPress={handleLogin}>
//         <Text style={styles.buttonText}>Proceed</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fedd00',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 24,
//   },
//   logo: {
//     width: 200,
//     height: 200,
//     marginBottom: 20,
//   },
//   header: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: 'red',
//     marginBottom: 10,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#7f8c8d',
//     textAlign: 'center',
//     marginBottom: 30,
//     paddingHorizontal: 10,
//   },
//   input: {
//     width: '100%',
//     borderWidth: 1,
//     borderColor: '#bdc3c7',
//     borderRadius: 10,
//     padding: 12,
//     fontSize: 16,
//     marginBottom: 20,
//     backgroundColor: '#fff',
//   },
//   button: {
//     backgroundColor: 'red',
//     paddingVertical: 12,
//     paddingHorizontal: 32,
//     borderRadius: 10,
//     elevation: 2,
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: '600',
//   },
// });
