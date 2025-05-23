import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { v4 as uuidv4 } from 'uuid'; // optional if you want longer tokens
import { useLocalSearchParams } from 'expo-router'; // ✅ correct



const paymentMethods = [
  { id: 'upi', label: 'UPI (QR/In-App)', icon: '💳' },
  { id: 'wallet', label: 'Wallet (Cafeteria Balance)', icon: '👛' },
  { id: 'payroll', label: 'Payroll Deduction', icon: '🏢' },
];



const PaymentOption = () => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [pickupToken, setPickupToken] = useState('');
  // const { totalAmount } = useSearchParams();
   const { amount } = useLocalSearchParams();
  

  const generateToken = () => {
    const token = 'ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    return token;
  };

  const handleConfirm = () => {
    if (!selectedMethod) {
      Alert.alert('Select Payment Mode', 'Please choose a payment method');
      return;
    }

    const token = generateToken();
    setPickupToken(token);
    notifyKitchen(token);
    setOrderConfirmed(true);
  };

  const notifyKitchen = (token: string) => {
    // Simulate sending data to kitchen (use actual API call here)
    console.log(`Notify Kitchen: Order ${token} placed via ${selectedMethod}`);
  };

  return (
    <ScrollView className="bg-white flex-1">
      {/* Header Image */}
      <Image
        source={{
          uri: 'https://thumbs.dreamstime.com/b/courier-characters-delivering-food-products-to-customer-bike-express-delivery-service-coronavirus-pandemic-goods-183328784.jpg',
        }}
        className="w-full h-56"
        resizeMode="cover"
      />

      <View className="p-6">
        {/* Total Amount */}
        <View className="mb-6 items-center">
          <Text className="text-xl text-gray-700">Total Payable</Text>
          <Text className="text-3xl font-extrabold text-black">₹{amount}</Text>
        </View>

        {!orderConfirmed ? (
          <>
            <Text className="text-xl font-bold text-gray-800 mb-4 text-center">
              Select Payment Mode
            </Text>

            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                className={`flex-row items-center justify-between p-4 border-2 rounded-xl mb-4 ${
                  selectedMethod === method.id
                    ? 'border-green-500 bg-green-100'
                    : 'border-gray-300'
                }`}
                onPress={() => setSelectedMethod(method.id)}
              >
                <Text className="text-xl">
                  {method.icon} {method.label}
                </Text>
                {selectedMethod === method.id && (
                  <Text className="text-green-600 font-semibold">Selected</Text>
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              className="bg-blue-600 mt-6 py-3 rounded-xl"
              onPress={handleConfirm}
            >
              <Text className="text-white text-center font-bold text-lg">
                Confirm Order
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <View className="items-center mt-8">
          
            <Text className="text-green-600 text-3xl font-semibold mb-2">
              Order Confirmed!
            </Text>
             {/* Estimated Time */}
            <Text className="text-gray-700 text-lg mt-6">Estimated Ready Time:</Text>
            <Text className="text-2xl font-bold text-black mt-1">10 - 15 mins</Text>

            {/* QR Section */}
            <View className="bg-gray-100 rounded-xl p-4 mt-5 items-center">
              <Text className="text-lg text-gray-700 mb-2">Pickup Token:</Text>
              <Text className="text-2xl font-bold text-black mb-4">{pickupToken}</Text>
              <Text className="text-sm text-gray-500  mb-4 text-center">
                Show this QR at the counter to collect your order
              </Text>
              <Text className="text-lg font-semibold text-gray-800 mb-2">Scan This QR</Text>

              <QRCode value={pickupToken} size={160} />
            </View>

           
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default PaymentOption;
