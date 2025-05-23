import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const paymentMethods = [
  { id: 'upi', label: 'UPI (QR/In-App)', icon: '💳' },
  { id: 'wallet', label: 'Wallet (Cafeteria Balance)', icon: '👛' },
  { id: 'payroll', label: 'Payroll Deduction', icon: '🏢' },
];

const PaymentOption = () => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [pickupToken, setPickupToken] = useState('');
  const [loading, setLoading] = useState(false);
  const { amount } = useLocalSearchParams();

  const generateToken = () => {
    return 'ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleConfirm = () => {
    if (!selectedMethod) {
      Alert.alert('Select Payment Mode', 'Please choose a payment method');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const token = generateToken();
      setPickupToken(token);
      notifyKitchen(token);
      setOrderConfirmed(true);
      setLoading(false);
    }, 1200); // simulate delay
  };

  const notifyKitchen = (token: string) => {
    console.log(`Notify Kitchen: Order ${token} placed via ${selectedMethod}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={{
            uri:
              'https://thumbs.dreamstime.com/b/courier-characters-delivering-food-products-to-customer-bike-express-delivery-service-coronavirus-pandemic-goods-183328784.jpg',
          }}
          style={styles.headerImage}
          resizeMode="cover"
        />

        <View style={styles.container}>
          <View style={styles.amountBox}>
            <Text style={styles.label}>Total Payable</Text>
            <Text style={styles.amount}>₹{amount}</Text>
          </View>

          {!orderConfirmed ? (
            <>
              <Text style={styles.title}>Select Payment Mode</Text>

              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  activeOpacity={0.7}
                  style={[
                    styles.paymentMethod,
                    selectedMethod === method.id && styles.paymentMethodSelected,
                  ]}
                  onPress={() => setSelectedMethod(method.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: selectedMethod === method.id }}
                >
                  <Text style={styles.paymentText}>
                    {method.icon} {method.label}
                  </Text>
                  {selectedMethod === method.id && (
                    <Text style={styles.selectedText}>Selected</Text>
                  )}
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                disabled={loading}
                activeOpacity={0.8}
                style={[
                  styles.confirmButton,
                  loading && styles.confirmButtonDisabled,
                ]}
                onPress={handleConfirm}
                accessibilityRole="button"
                accessibilityLabel="Confirm Order"
              >
                {loading ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={styles.confirmButtonTextLoading}>Processing...</Text>
                  </View>
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm Order</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.confirmedBox}>
              <Text style={styles.orderConfirmed}>Order Confirmed!</Text>

              <Text style={styles.estimatedLabel}>Estimated Ready Time:</Text>
              <Text style={styles.estimatedTime}>10 - 15 mins</Text>

              <View style={styles.qrContainer}>
                <Text style={styles.pickupTokenLabel}>Pickup Token:</Text>
                <Text style={styles.pickupToken}>{pickupToken}</Text>
                <Text style={styles.qrInfoText}>
                  Show this QR at the counter to collect your order
                </Text>
                <Text style={styles.scanText}>Scan This QR</Text>
                <QRCode value={pickupToken} size={160} />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerImage: {
    width: '100%',
    height: 220,
  },
 container: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 24,
  width: '100%',
  maxWidth: 400,
  alignSelf: 'center',
},

amountBox: {
  marginBottom: 24,
  alignItems: 'center',
  backgroundColor: '#F9FAFB',
  padding: 16,
  borderRadius: 16,
  width: '100%',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 4,
},

  label: {
    fontSize: 18,
    color: '#4B5563', // gray-700
  },
  amount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#000000',
    marginTop: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937', // gray-800
    marginBottom: 16,
    textAlign: 'center',
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#D1D5DB', // gray-300
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  paymentMethodSelected: {
    borderColor: '#22C55E', // green-500
    backgroundColor: '#DCFCE7', // green-100
  },
  paymentText: {
    fontSize: 18,
  },
  selectedText: {
    color: '#16A34A', // green-600
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#2563EB', // blue-600
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#93C5FD', // blue-300
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
  },
  confirmButtonTextLoading: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
    marginLeft: 8,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmedBox: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 8,
  },
  orderConfirmed: {
    fontSize: 28,
    fontWeight: '700',
    color: '#16A34A', // green-600
    marginBottom: 12,
    textAlign: 'center',
  },
  estimatedLabel: {
    color: '#4B5563', // gray-700
    fontSize: 16,
    marginTop: 24,
    textAlign: 'center',
  },
  estimatedTime: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginTop: 4,
    textAlign: 'center',
  },
  qrContainer: {
    backgroundColor: '#F3F4F6', // gray-100
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginTop: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  pickupTokenLabel: {
    fontSize: 18,
    color: '#4B5563',
    marginBottom: 4,
  },
  pickupToken: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  qrInfoText: {
    fontSize: 14,
    color: '#6B7280', // gray-500
    marginBottom: 20,
    textAlign: 'center',
  },
  scanText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
});

export default PaymentOption;







//----------------------------------------------------------------------------------------//

// import React, { useState, useEffect } from 'react';
// import { View, Text, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
// import QRCode from 'react-native-qrcode-svg';
// import { v4 as uuidv4 } from 'uuid'; // optional if you want longer tokens
// import { useLocalSearchParams } from 'expo-router'; // ✅ correct



// const paymentMethods = [
//   { id: 'upi', label: 'UPI (QR/In-App)', icon: '💳' },
//   { id: 'wallet', label: 'Wallet (Cafeteria Balance)', icon: '👛' },
//   { id: 'payroll', label: 'Payroll Deduction', icon: '🏢' },
// ];



// const PaymentOption = () => {
//   const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
//   const [orderConfirmed, setOrderConfirmed] = useState(false);
//   const [pickupToken, setPickupToken] = useState('');
//   // const { totalAmount } = useSearchParams();
//    const { amount } = useLocalSearchParams();
  

//   const generateToken = () => {
//     const token = 'ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
//     return token;
//   };

//   const handleConfirm = () => {
//     if (!selectedMethod) {
//       Alert.alert('Select Payment Mode', 'Please choose a payment method');
//       return;
//     }

//     const token = generateToken();
//     setPickupToken(token);
//     notifyKitchen(token);
//     setOrderConfirmed(true);
//   };

//   const notifyKitchen = (token: string) => {
//     // Simulate sending data to kitchen (use actual API call here)
//     console.log(`Notify Kitchen: Order ${token} placed via ${selectedMethod}`);
//   };

//   return (
//     <ScrollView className="bg-white flex-1">
//       {/* Header Image */}
//       <Image
//         source={{
//           uri: 'https://thumbs.dreamstime.com/b/courier-characters-delivering-food-products-to-customer-bike-express-delivery-service-coronavirus-pandemic-goods-183328784.jpg',
//         }}
//         className="w-full h-56"
//         resizeMode="cover"
//       />

//       <View className="p-6">
//         {/* Total Amount */}
//         <View className="mb-6 items-center">
//           <Text className="text-xl text-gray-700">Total Payable</Text>
//           <Text className="text-3xl font-extrabold text-black">₹{amount}</Text>
//         </View>

//         {!orderConfirmed ? (
//           <>
//             <Text className="text-xl font-bold text-gray-800 mb-4 text-center">
//               Select Payment Mode
//             </Text>

//             {paymentMethods.map((method) => (
//               <TouchableOpacity
//                 key={method.id}
//                 className={`flex-row items-center justify-between p-4 border-2 rounded-xl mb-4 ${
//                   selectedMethod === method.id
//                     ? 'border-green-500 bg-green-100'
//                     : 'border-gray-300'
//                 }`}
//                 onPress={() => setSelectedMethod(method.id)}
//               >
//                 <Text className="text-xl">
//                   {method.icon} {method.label}
//                 </Text>
//                 {selectedMethod === method.id && (
//                   <Text className="text-green-600 font-semibold">Selected</Text>
//                 )}
//               </TouchableOpacity>
//             ))}

//             <TouchableOpacity
//               className="bg-blue-600 mt-6 py-3 rounded-xl"
//               onPress={handleConfirm}
//             >
//               <Text className="text-white text-center font-bold text-lg">
//                 Confirm Order
//               </Text>
//             </TouchableOpacity>
//           </>
//         ) : (
//           <View className="items-center mt-8">
          
//             <Text className="text-green-600 text-3xl font-semibold mb-2">
//               Order Confirmed!
//             </Text>
//              {/* Estimated Time */}
//             <Text className="text-gray-700 text-lg mt-6">Estimated Ready Time:</Text>
//             <Text className="text-2xl font-bold text-black mt-1">10 - 15 mins</Text>

//             {/* QR Section */}
//             <View className="bg-gray-100 rounded-xl p-4 mt-5 items-center">
//               <Text className="text-lg text-gray-700 mb-2">Pickup Token:</Text>
//               <Text className="text-2xl font-bold text-black mb-4">{pickupToken}</Text>
//               <Text className="text-sm text-gray-500  mb-4 text-center">
//                 Show this QR at the counter to collect your order
//               </Text>
//               <Text className="text-lg font-semibold text-gray-800 mb-2">Scan This QR</Text>

//               <QRCode value={pickupToken} size={160} />
//             </View>

           
//           </View>
//         )}
//       </View>
//     </ScrollView>
//   );
// };

// export default PaymentOption;
