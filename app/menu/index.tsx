import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useEmployee } from "../../context/EmployeeContext"; // your custom hook



// Greeting component
const Greeting = ({ employeeName }: { employeeName: string }) => (
  <Text style={styles.greetingText}>
    Welcome, <Text style={styles.employeeName}>{employeeName}</Text>
  </Text>
);

// MenuItem component
const MenuItem = ({ item, onAddToCart }: any) => {
  const [quantity, setQuantity] = useState("1");

  const handleAdd = () => {
    const q = parseInt(quantity);
    if (!isNaN(q) && q > 0) {
      onAddToCart(item, q);
      setQuantity("1");
    } else {
      Alert.alert("Invalid quantity", "Please enter a valid quantity (1 or more).");
    }
  };

  return (
    <View style={styles.menuItem}>
      <Image source={{ uri: item.image }} style={styles.menuItemImage} />
      <Text style={styles.menuItemName}>{item.name}</Text>
      <Text style={styles.menuItemPrice}>₹{item.price.toFixed(2)}</Text>
      <TextInput
        keyboardType="number-pad"
        value={quantity}
        onChangeText={setQuantity}
        style={styles.quantityInput}
        maxLength={3}
        placeholder="1"
        placeholderTextColor="#9CA3AF"
      />
      <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>
    </View>
  );
};

// MenuSection component
const MenuSection = ({ category, items, onAddToCart }: any) => (
  <View style={styles.menuSection}>
    <Text style={styles.menuSectionTitle}>{category}</Text>

    <FlatList
      horizontal
      data={items}
      keyExtractor={(item, index) =>  item._id ? `${item._id}` : `item-${index}`}
      renderItem={({ item }) => <MenuItem item={item} onAddToCart={onAddToCart} />}
      showsHorizontalScrollIndicator={false}
      // contentContainerStyle={{ paddingLeft:  }}
    />
  </View>
);

// CartSummary component
const CartSummary = ({ cartItems }: any) => {
  const totalItems = cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce((acc: number, item: any) => acc + item.quantity * item.price, 0);

  return (
    <View style={styles.cartSummary}>
      <Text style={styles.cartSummaryTitle}>Cart Summary</Text>
      {cartItems.length === 0 ? (
        <Text style={styles.cartEmpty}>Your cart is empty</Text>
      ) : (
        <>
          {cartItems.map((item: any, index: number) => (
            <Text key={item.id ?? item._id ?? index} style={styles.cartItemText}>
              {item.name} x {item.quantity} = ₹{(item.quantity * item.price).toFixed(2)}
            </Text>
          ))}
          <Text style={styles.cartTotal}>Total Items: {totalItems}</Text>
          <Text style={styles.cartTotal}>Total Price: ₹{totalPrice.toFixed(2)}</Text>
        </>
      )}
    </View>
  );
};

export default function Menu() {
  const [menuData, setMenuData] = useState({});
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
   const [menuLoading, setMenuLoading] = useState(true);
  const router = useRouter();
  const { employeeName, employeeId } = useEmployee();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axios.get("https://qsr-server.onrender.com/menu");
        setMenuData(res.data);
        console.log("Fetched Menu:", res.data);

      } catch (err) {
        console.error("Failed to fetch menu:", err);
        Alert.alert("Error", "Unable to load menu. Please try again later.");
      } finally {
        setMenuLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const handleAddToCart = (item: any, quantity: number) => {
    setCart((prev) => {
      const index = prev.findIndex((i) => i.id === item.id);
      if (index !== -1) {
        const updated = [...prev];
        updated[index].quantity += quantity;
        return updated;
      } else {
        return [...prev, { ...item, quantity }];
      }
    });
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert("Cart Empty", "Please add items to cart before proceeding.");
      return;
    }
    if (!employeeId || !employeeName) {
      Alert.alert("Missing Info", "Employee ID or Name missing. Please login again.");
      return;
    }

    try {
      setLoading(true);

      const totalAmount = cart.reduce((acc, item) => acc + item.quantity * item.price, 0);

      await axios.post("https://qsr-server.onrender.com/orders", {
        employeeId,
        totalAmount,
        paymentMode: "UPI",
      });

      // Alert.alert("Order Placed", "Your order was placed successfully!");
      // setCart([]);

      router.push({
        pathname: "/menu/payment",
        params: { amount: totalAmount.toString() },
      });
    } catch (error: any) {
      console.error(error);
      Alert.alert("Order Failed", error.response?.data?.error || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Greeting employeeName={employeeName || "Employee"} />
          {menuLoading ? (
            <ActivityIndicator size="large" color="#2563EB" />
          ) : (
            Object.entries(menuData || {}).map(([category, items]: any) => (
              <MenuSection key={category} category={category} items={items} onAddToCart={handleAddToCart} />
            ))
            
          )}
          <View style={{ height: 140 }} />
        </ScrollView>

        <View style={styles.footer}>
          <CartSummary cartItems={cart} />
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#059669" />
              <Text style={styles.loadingText}>Processing your order...</Text>
            </View>
          ) : (
            cart.length > 0 && (
              <TouchableOpacity onPress={handleCheckout} style={styles.checkoutButton}>
                <Text style={styles.checkoutText}>Proceed to Pay</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ===== STYLES =====
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
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
  scrollContent: {
    paddingBottom: 180,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 18,
    textAlign: "center",
  },
  employeeName: {
    color: "#DC2626",
    fontFamily: "cursive",
  },
  menuSection: {
    marginBottom: 24,
  },
  menuSectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
    marginLeft: 12,
    marginBottom: 8,
  },
  menuItem: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 8,
    alignItems: "center",
    width: 170,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  menuItemImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  menuItemName: {
    marginTop: 10,
    fontWeight: "600",
    fontSize: 16,
    color: "#111827",
  },
  menuItemPrice: {
    marginTop: 4,
    color: "#6B7280",
  },
  quantityInput: {
  marginTop: 8,
  borderWidth: 1,
  borderColor: "#D1D5DB",
  borderRadius: 10,
  width: 50, // ✅ This is good
  height: 38,
  textAlign: "center",
  fontSize: 16,
  color: "#111827",
},
  addButton: {
    marginTop: 10,
    backgroundColor: "red",
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: 22,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  cartSummary: {
    backgroundColor: "#FEE2E2",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cartSummaryTitle: {
    fontWeight: "700",
    fontSize: 18,
    color: "#B91C1C",
    marginBottom: 6,
  },
  cartEmpty: {
    color: "#B91C1C",
    fontStyle: "italic",
  },
  cartItemText: {
    color: "#B91C1C",
  },
  cartTotal: {
    fontWeight: "700",
    marginTop: 4,
    color: "#B91C1C",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#F3F4F6",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 12,
  },
  checkoutButton: {
    backgroundColor: "red",
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
    marginTop: 8,
  },
  checkoutText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  loadingText: {
    marginLeft: 12,
    color: "#059669",
    fontSize: 16,
    fontWeight: "600",
  },
});






//----------------------------------- With App Format & data from Client---------------------------------//

// import axios from "axios";
// import { useRouter } from "expo-router";
// import React, { useState, useEffect } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   FlatList,
//   Image,
//   KeyboardAvoidingView,
//   Platform,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { useEmployee } from "../../context/EmployeeContext"; // your custom hook

// // Sample Menu Data
// const menuData = {
//   Beverages: [
//     {
//       id: 1,
//       name: "Coffee",
//       price: 60,
//       image:
//         "http://3.bp.blogspot.com/-U2uqPh7hw0U/UHNEoLahrPI/AAAAAAAAAv8/buuzujhKZkY/s1600/coffee.jpg",
//     },
//     {
//       id: 2,
//       name: "Tea",
//       price: 40,
//       image: "https://images5.alphacoders.com/381/381599.jpg",
//     },
//   ],
//   Snacks: [
//     {
//       id: 3,
//       name: "Chips",
//       price: 30,
//       image:
//         "https://tse2.mm.bing.net/th?id=OIP.0yAPT_W3Qw3NEsP2Kq7zCAHaHa&pid=Api&P=0&h=180",
//     },
//     {
//       id: 4,
//       name: "Cookies",
//       price: 50,
//       image:
//         "https://www.shugarysweets.com/wp-content/uploads/2020/05/chocolate-chip-cookies-recipe.jpg",
//     },
//   ],
//   Combos: [
//     {
//       id: 5,
//       name: "Burger + Fries",
//       price: 150,
//       image:
//         "https://cdn.pixabay.com/photo/2023/04/14/18/53/ai-generated-7925719_1280.jpg",
//     },
//     {
//       id: 6,
//       name: "Pizza + Drink",
//       price: 180,
//       image:
//         "https://www.saharapizzablackdiamond.com/wp-content/uploads/2019/04/Best-Drinks-to-Enjoy-with-Pizza.jpg",
//     },
//   ],
//   Meals: [
//     {
//       id: 7,
//       name: "Chicken Meal",
//       price: 220,
//       image:
//         "https://img.freepik.com/premium-photo/close-up-delicious-chicken-meal_947814-60038.jpg?w=2000",
//     },
//     {
//       id: 8,
//       name: "Veg Thali",
//       price: 180,
//       image:
//         "https://media.architecturaldigest.in/wp-content/uploads/2020/02/vegetarian-thali-mumbai-restautants_2.jpg",
//     },
//   ],
// };

// // Greeting component
// const Greeting = ({ employeeName }: { employeeName: string }) => (
//   <Text style={styles.greetingText}>
//     Welcome, <Text style={styles.employeeName}>{employeeName}</Text>
//   </Text>
// );

// // MenuItem component
// const MenuItem = ({ item, onAddToCart }: any) => {
//   const [quantity, setQuantity] = useState("1");

//   const handleAdd = () => {
//     const q = parseInt(quantity);
//     if (!isNaN(q) && q > 0) {
//       onAddToCart(item, q);
//       setQuantity("1");
//     } else {
//       Alert.alert("Invalid quantity", "Please enter a valid quantity (1 or more).");
//     }
//   };

//   return (
//     <View style={styles.menuItem}>
//       <Image source={{ uri: item.image }} style={styles.menuItemImage} />
//       <Text style={styles.menuItemName}>{item.name}</Text>
//       <Text style={styles.menuItemPrice}>₹{item.price.toFixed(2)}</Text>
//       <TextInput
//         keyboardType="number-pad"
//         value={quantity}
//         onChangeText={setQuantity}
//         style={styles.quantityInput}
//         maxLength={3}
//         placeholder="1"
//         placeholderTextColor="#9CA3AF"
//       />
//       <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
//         <Text style={styles.addButtonText}>Add</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// // MenuSection component
// const MenuSection = ({ category, items, onAddToCart }: any) => (
//   <View style={styles.menuSection}>
//     <Text style={styles.menuSectionTitle}>{category}</Text>
//     <FlatList
//       horizontal
//       data={items}
//       keyExtractor={(item) => item.id.toString()}
//       renderItem={({ item }) => <MenuItem item={item} onAddToCart={onAddToCart} />}
//       showsHorizontalScrollIndicator={false}
//       contentContainerStyle={{ paddingLeft: 12 }}
//     />
//   </View>
// );

// // CartSummary component
// const CartSummary = ({ cartItems }: any) => {
//   const totalItems = cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
//   const totalPrice = cartItems.reduce((acc: number, item: any) => acc + item.quantity * item.price, 0);

//   return (
//     <View style={styles.cartSummary}>
//       <Text style={styles.cartSummaryTitle}>Cart Summary</Text>
//       {cartItems.length === 0 ? (
//         <Text style={styles.cartEmpty}>Your cart is empty</Text>
//       ) : (
//         <>
//           {cartItems.map((item: any) => (
//             <Text key={item.id} style={styles.cartItemText}>
//               {item.name} x {item.quantity} = ₹{(item.quantity * item.price).toFixed(2)}
//             </Text>
//           ))}
//           <Text style={styles.cartTotal}>Total Items: {totalItems}</Text>
//           <Text style={styles.cartTotal}>Total Price: ₹{totalPrice.toFixed(2)}</Text>
//         </>
//       )}
//     </View>
//   );
// };

// export default function Menu() {
//   const [cart, setCart] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();
//   const { employeeName, employeeId } = useEmployee();

//   const handleAddToCart = (item: any, quantity: number) => {
//     setCart((prev) => {
//       const index = prev.findIndex((i) => i.id === item.id);
//       if (index !== -1) {
//         const updated = [...prev];
//         updated[index].quantity += quantity;
//         return updated;
//       } else {
//         return [...prev, { ...item, quantity }];
//       }
//     });
//   };

//   const handleCheckout = async () => {
//     if (cart.length === 0) {
//       Alert.alert("Cart Empty", "Please add items to cart before proceeding.");
//       return;
//     }
//     if (!employeeId || !employeeName) {
//       Alert.alert("Missing Info", "Employee ID or Name missing. Please login again.");
//       return;
//     }

//     try {
//       setLoading(true);

//       const totalAmount = cart.reduce((acc, item) => acc + item.quantity * item.price, 0);

//       await axios.post("https://qsr-server.onrender.com/orders", {
//         employeeId,
//         totalAmount,
//         paymentMode: "UPI",
//       });

//       Alert.alert("Order Placed", "Your order was placed successfully!");
//       setCart([]);

//       router.push({
//         pathname: "/menu/payment",
//         params: { amount: totalAmount.toString() },
//       });
//     } catch (error: any) {
//       console.error(error);
//       Alert.alert("Order Failed", error.response?.data?.error || "Unknown error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : undefined}
//         style={styles.container}
//       >
//         <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
//           <Greeting employeeName={employeeName || "Employee"} />
//           {Object.entries(menuData).map(([category, items]) => (
//             <MenuSection key={category} category={category} items={items} onAddToCart={handleAddToCart} />
//           ))}
//           <View style={{ height: 140 }} />
//         </ScrollView>

//         <View style={styles.footer}>
//           <CartSummary cartItems={cart} />
//           {loading ? (
//             <View style={styles.loadingContainer}>
//               <ActivityIndicator size="large" color="#059669" />
//               <Text style={styles.loadingText}>Processing your order...</Text>
//             </View>
//           ) : (
//             cart.length > 0 && (
//               <TouchableOpacity onPress={handleCheckout} style={styles.checkoutButton}>
//                 <Text style={styles.checkoutText}>Proceed to Pay</Text>
//               </TouchableOpacity>
//             )
//           )}
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// // ===== STYLES =====
// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: "#F9FAFB",
//   },
//   container: {
//   flex: 1,
//   backgroundColor: '#ffffff',
//   alignItems: 'center',
//   justifyContent: 'center',
//   padding: 24,
//   width: '100%',
//   maxWidth: 400, // limit width like a mobile screen
//   alignSelf: 'center', // center horizontally on web
// },
//   scrollContent: {
//     paddingBottom: 180,
//   },
//   greetingText: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#1E40AF",
//     marginBottom: 18,
//     textAlign: "center",
//   },
//   employeeName: {
//     color: "#DC2626",
//   },
//   menuSection: {
//     marginBottom: 24,
//   },
//   menuSectionTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#374151",
//     marginLeft: 12,
//     marginBottom: 8,
//   },
//   menuItem: {
//     backgroundColor: "#fff",
//     padding: 14,
//     borderRadius: 12,
//     marginHorizontal: 8,
//     alignItems: "center",
//     width: 170,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     elevation: 3,
//   },
//   menuItemImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 12,
//   },
//   menuItemName: {
//     marginTop: 10,
//     fontWeight: "600",
//     fontSize: 16,
//     color: "#111827",
//   },
//   menuItemPrice: {
//     marginTop: 4,
//     color: "#6B7280",
//   },
//   quantityInput: {
//   marginTop: 8,
//   borderWidth: 1,
//   borderColor: "#D1D5DB",
//   borderRadius: 10,
//   width: 50, // ✅ This is good
//   height: 38,
//   textAlign: "center",
//   fontSize: 16,
//   color: "#111827",
// },
//   addButton: {
//     marginTop: 10,
//     backgroundColor: "#2563EB",
//     paddingVertical: 8,
//     paddingHorizontal: 22,
//     borderRadius: 22,
//   },
//   addButtonText: {
//     color: "#fff",
//     fontWeight: "700",
//   },
//   cartSummary: {
//     backgroundColor: "#D1FAE5",
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 12,
//   },
//   cartSummaryTitle: {
//     fontWeight: "700",
//     fontSize: 18,
//     color: "#065F46",
//     marginBottom: 6,
//   },
//   cartEmpty: {
//     color: "#4B5563",
//     fontStyle: "italic",
//   },
//   cartItemText: {
//     color: "#065F46",
//   },
//   cartTotal: {
//     fontWeight: "700",
//     marginTop: 4,
//     color: "#065F46",
//   },
//   footer: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     paddingHorizontal: 20,
//     paddingVertical: 14,
//     backgroundColor: "#F3F4F6",
//     borderTopLeftRadius: 16,
//     borderTopRightRadius: 16,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//     elevation: 12,
//   },
//   checkoutButton: {
//     backgroundColor: "#059669",
//     paddingVertical: 14,
//     borderRadius: 28,
//     alignItems: "center",
//     marginTop: 8,
//   },
//   checkoutText: {
//     color: "#FFFFFF",
//     fontSize: 18,
//     fontWeight: "700",
//   },
//   loadingContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 10,
//   },
//   loadingText: {
//     marginLeft: 12,
//     color: "#059669",
//     fontSize: 16,
//     fontWeight: "600",
//   },
// });





//-------------------------- Without App Format-------------------------------//

// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   Image,
//   TextInput,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   FlatList,
// } from "react-native";
// import { useRouter } from 'expo-router';
// import axios from 'axios';
// import { useEmployee } from '../../context/EmployeeContext'; // custom hook from context




// const menuData = {
//   Beverages: [
//     {
//       id: 1,
//       name: "Coffee",
//       price: 60,
//       image: "http://3.bp.blogspot.com/-U2uqPh7hw0U/UHNEoLahrPI/AAAAAAAAAv8/buuzujhKZkY/s1600/coffee.jpg", // Coffee in a cup
//     },
//     {
//       id: 2,
//       name: "Tea",
//       price: 40,
//       image: "https://images5.alphacoders.com/381/381599.jpg", // Tea in a cup
//     },
//   ],
//   Snacks: [
//     {
//       id: 3,
//       name: "Chips",
//       price: 30,
//       image: "https://tse2.mm.bing.net/th?id=OIP.0yAPT_W3Qw3NEsP2Kq7zCAHaHa&pid=Api&P=0&h=180"
//     },
//     {
//       id: 4,
//       name: "Cookies",
//       price: 50,
//       image: "https://www.shugarysweets.com/wp-content/uploads/2020/05/chocolate-chip-cookies-recipe.jpg", // Cookies
//     },
//   ],
//   Combos: [
//     {
//       id: 5,
//       name: "Burger + Fries",
//       price: 150,
//       image: "https://cdn.pixabay.com/photo/2023/04/14/18/53/ai-generated-7925719_1280.jpg", // Burger + Fries
//     },
//     {
//       id: 6,
//       name: "Pizza + Drink",
//       price: 180,
//       image: "https://www.saharapizzablackdiamond.com/wp-content/uploads/2019/04/Best-Drinks-to-Enjoy-with-Pizza.jpg", // Pizza + Drink
//     },
//   ],
//   Meals: [
//     {
//       id: 7,
//       name: "Chicken Meal",
//       price: 220,
//       image: "https://img.freepik.com/premium-photo/close-up-delicious-chicken-meal_947814-60038.jpg?w=2000", // Chicken meal
//     },
//     {
//       id: 8,
//       name: "Veg Thali",
//       price: 180,
//       image: "https://media.architecturaldigest.in/wp-content/uploads/2020/02/vegetarian-thali-mumbai-restautants_2.jpg", // Veg Thali
//     },
//   ],
// };



// const Greeting = ({ employeeName }: { employeeName: string }) => (
//   <Text className="text-xl font-bold text-gray-800 m-4">
//     <Text className="text-blue-700">Welcome, <Text style={styles.name}>{employeeName}</Text>

//     </Text>
    
//   </Text>
// );

// const MenuItem = ({ item, onAddToCart }: any) => {
//   const [quantity, setQuantity] = useState("1");

//   const handleAdd = () => {
//     const q = parseInt(quantity);
//     if (!isNaN(q) && q > 0) {
//       onAddToCart(item, q);
//       setQuantity("1");
//     }
//   };

//   return (
//    <View className="bg-white p-4 rounded-xl w-44 mx-2 items-center justify-center">
//   <Image
//     source={{ uri: item.image }}
//     className="w-28 h-28 rounded-md mb-2"
//     resizeMode="cover"
//   />
//   <Text className="font-semibold text-gray-700 text-center">{item.name}</Text>
//   <Text className="text-sm text-gray-500 mb-2 text-center">
//     ₹{item.price.toFixed(2)}
//   </Text>
//   <TextInput
//     className="border border-gray-300 w-12 h-10 text-center rounded-md mb-2"
//     keyboardType="number-pad"
//     value={quantity}
//     onChangeText={setQuantity}
//   />
//   <TouchableOpacity
//     className="bg-blue-500 px-4 py-2 rounded-full"
//     onPress={handleAdd}
//   >
//     <Text className="text-white text-sm font-medium">Add to Cart</Text>
//   </TouchableOpacity>
// </View>

//   );
// };

// const MenuSection = ({ category, items, onAddToCart }: any) => (
//   <View className="mb-6">
//     <Text className="text-lg font-semibold text-gray-800 mx-4 mb-2"> {category}</Text>
//     <FlatList
//       data={items}
//       keyExtractor={(item) => item.id.toString()}
//       renderItem={({ item }) => <MenuItem item={item} onAddToCart={onAddToCart} />}
//       horizontal
//       showsHorizontalScrollIndicator={false}
//     />
//   </View>
// );

// const CartSummary = ({ cartItems }: any) => {
//   const totalItems = cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
//   const totalPrice = cartItems.reduce((acc: number, item: any) => acc + item.quantity * item.price, 0);

//   return (
//     <View className="bg-green-100 p-4 rounded-xl mt-6">
//       <Text className="text-lg font-bold text-green-800 mb-2">Cart Summary</Text>
//       {cartItems.length === 0 ? (
//         <Text className="text-gray-500">Your cart is empty</Text>
//       ) : (
//         <>
//           {cartItems.map((item: any) => (
//             <Text key={item.id} className="text-gray-700">
//               {item.name} x {item.quantity} =₹{(item.quantity * item.price).toFixed(2)}
//             </Text>
//           ))}
//           <Text className="mt-2 font-semibold text-gray-800">
//             Total Items: {totalItems}
//           </Text>
//           <Text className="font-semibold text-gray-800">
//             Total Price: ₹{totalPrice.toFixed(2)}
//           </Text>
//         </>
//       )}
//     </View>
//   );
// };

// export default function Menu() {
//   const [cart, setCart] = useState<any[]>([]);
//    const router = useRouter();
//    const { employeeName, employeeId } = useEmployee();
   
//    console.log("Employee ID:", employeeId);


//     console.log("Name in Menu Screen:", employeeName);

//   const handleAddToCart = (item: any, quantity: number) => {
//     setCart((prev) => {
//       const index = prev.findIndex((i) => i.id === item.id);
//       if (index !== -1) {
//         const updated = [...prev];
//         updated[index].quantity += quantity;
//         return updated;
//       } else {
//         return [...prev, { ...item, quantity }];
//       }
//     });
//   };

//   return (
//     <View style={styles.container}>
//       <ScrollView contentContainerStyle={styles.scrollContainer}>
//        <Greeting employeeName={employeeName|| 'Employee'} />
//         {Object.entries(menuData).map(([category, items]) => (
//           <MenuSection
//             key={category}
//             category={category}
//             items={items}
//             onAddToCart={handleAddToCart}
//           />
//         ))}
//         <View style={{ height: 120 }} /> {/* Spacer for footer */}
//       </ScrollView>

//       <View style={styles.footer}>
//         <CartSummary cartItems={cart} />
//         {cart.length > 0 && (
//              <TouchableOpacity
//             style={styles.checkoutButton}
//             onPress={async () => {
//               try {
//                 // const employeeId = "EMP025"; 
//                 const totalAmount = cart.reduce((acc, item) => acc + item.quantity * item.price, 0);

//                 if (!employeeId || !employeeName) {
//                     alert("Employee ID or name is missing.");
//                     return;
//                   }

//               await axios.post('https://qsr-server.onrender.com/orders', {
//                 employeeId,         // e.g., "EMP001"
//                 totalAmount,        // e.g., 230
//                 paymentMode: "UPI", // or "Cash", etc.
                
//               }); 

                   
//                 // alert("Order placed successfully!");
//                 // setCart([]); // clear cart after order

//                 router.push({
//                     pathname: '/menu/payment',
//                     params: { amount: totalAmount.toString() },
//                   });
//               } catch (error) {
//                   console.error("Order failed:", error.response?.data || error.message);
//                   alert("Order failed: " + (error.response?.data?.error || "Unknown error"));
//                 }
//             }}
//           >
//             <Text style={styles.checkoutText}>Proceed to Pay</Text>
//             </TouchableOpacity>

//         )}
//       </View>
//     </View>
//   );
// }



// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f3f4f6',
//   padding: 20
//   },
//   scrollContainer: {
//     paddingBottom: 140, // Space for the footer
//   },
//   footer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: '#ffffff',
//     padding: 12,
//     borderTopWidth: 1,
//     borderColor: '#e0e0e0',
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 5,
//   },
//   checkoutButton: {
//     backgroundColor: '#f44336',
//     paddingVertical: 12,
//     borderRadius: 10,
//     marginTop: 10,
//     alignItems: 'center',
//   },
//   checkoutText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   name: {
//   color: '#ff0000', // text-blue-700
// },
// });
