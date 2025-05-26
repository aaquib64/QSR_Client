import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const statusColors = {
  Pending: '#FBBF24',    // Amber
  Preparing: '#3B82F6',  // Blue
  Ready: '#10B981',      // Green
  Delivered: '#047857',  // Dark Green
};

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [filterItem, setFilterItem] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const fetchOrders = async () => {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      Alert.alert('Unauthorized', 'No token found. Please login again.');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get('https://qsr-server.onrender.com/admin/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = Array.isArray(res.data.data) ? res.data.data : [];
      setOrders(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch orders.');
      console.error('Order fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const employeeMatch = filterEmployee.trim() === '' || 
        (order.name && order.name.toLowerCase().includes(filterEmployee.toLowerCase())) ||
        (order.employeeId && order.employeeId.toLowerCase().includes(filterEmployee.toLowerCase()));

      const paymentMatch = filterPayment.trim() === '' ||
        (order.paymentMode && order.paymentMode.toLowerCase().includes(filterPayment.toLowerCase()));

      const itemMatch = filterItem.trim() === '' || 
        (Array.isArray(order.menuItems) && order.menuItems.some(item => 
          item.toLowerCase().includes(filterItem.toLowerCase())
        ));

      const dateMatch = filterDate.trim() === '' || 
        (order.createdAt && order.createdAt.startsWith(filterDate));

      return employeeMatch && paymentMatch && itemMatch && dateMatch;
    });
  }, [orders, filterEmployee, filterPayment, filterItem, filterDate]);

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <Text style={styles.title}>Order ID: <Text style={styles.orderId}>{item._id}</Text></Text>
      <Text style={styles.text}><Text style={styles.bold}>Employee:</Text> {item.name || item.employeeId || 'N/A'}</Text>
      <Text style={styles.text}>
        <Text style={styles.bold}>Items:</Text>{' '}
        {Array.isArray(item.menuItems) && item.menuItems.length > 0
          ? item.menuItems.join(', ')
          : 'No items info'}
      </Text>
      <View style={styles.statusPaymentRow}>
        <View style={[styles.statusBadge, {backgroundColor: statusColors[item.status] || '#6B7280'}]}>
          <Text style={styles.statusText}>{item.status || 'Pending'}</Text>
        </View>
        <Text style={[styles.text, { marginLeft: 12 }]}><Text style={styles.bold}>Payment:</Text> {item.paymentMode || 'N/A'}</Text>
      </View>
      <Text style={styles.text}><Text style={styles.bold}>Total:</Text> {item.totalAmount ? `₹${item.totalAmount}` : 'N/A'}</Text>
      <Text style={styles.text}><Text style={styles.bold}>Date:</Text> {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}</Text>
    </View>
  );

  const clearFilters = () => {
    setFilterEmployee('');
    setFilterPayment('');
    setFilterItem('');
    setFilterDate('');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Admin Dashboard</Text>

      <ScrollView 
        horizontal 
        style={styles.filtersContainer}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Employee</Text>
          <TextInput
            value={filterEmployee}
            onChangeText={setFilterEmployee}
            placeholder="Search employee"
            style={styles.filterInput}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Payment Mode</Text>
          <TextInput
            value={filterPayment}
            onChangeText={setFilterPayment}
            placeholder="Search payment mode"
            style={styles.filterInput}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Item</Text>
          <TextInput
            value={filterItem}
            onChangeText={setFilterItem}
            placeholder="Search item"
            style={styles.filterInput}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Date (YYYY-MM-DD)</Text>
          <TextInput
            value={filterDate}
            onChangeText={setFilterDate}
            placeholder="e.g. 2025-05-26"
            style={styles.filterInput}
            autoCorrect={false}
            autoCapitalize="none"
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity style={styles.clearButton} onPress={clearFilters} activeOpacity={0.8}>
          <Text style={styles.clearButtonText}>Clear Filters</Text>
        </TouchableOpacity>
      </ScrollView>

      {filteredOrders.length === 0 ? (
        <Text style={styles.noOrdersText}>No orders match the filters.</Text>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrder}
          contentContainerStyle={{ paddingBottom: 24 }}
          style={{width: '100%'}}
        />
      )}
    </SafeAreaView>
  );
};

export default AdminDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAF9F8",
  },
  header: {
    fontSize: 28,
    fontWeight: "800",
    color: "red", // slate-800
    textAlign: "center",
    marginBottom: 20,
    borderBottomWidth: 3,
    borderBottomColor: "#2563EB",
    paddingBottom: 10,
    width: '100%',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 12,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    width: '100%',
    paddingVertical: 6,
    backgroundColor: '#FFF1F2',
    borderRadius: 12,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  filterGroup: {
    marginRight: 14,
    minWidth: 140,
  },
  filterLabel: {
    fontWeight: '700',
    marginBottom: 6,
    color: '#475569', // slate-600
    fontSize: 13,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1', // slate-300
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F1F5F9', // slate-100
    fontSize: 15,
    color: '#334155',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  clearButton: {
    justifyContent: 'center',
    backgroundColor: '#EF4444', // red-500
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: 'center',
    shadowColor: '#EF4444',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  noOrdersText: {
    textAlign: "center",
    marginTop: 60,
    fontSize: 16,
    color: "#64748B", // slate-400
    fontStyle: "italic",
  },
  orderCard: {
    backgroundColor: "#FFF1F2",
    padding: 20,
    marginBottom: 18,
    borderRadius: 18,
    borderLeftWidth: 8,
    borderLeftColor: "#2563EB", // blue-600
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "red", // blue-800
    marginBottom: 8,
  },
  orderId: {
    fontFamily: 'monospace',
    fontWeight: '600',
    color: 'red',
  },
  text: {
    fontSize: 15,
    color: 'red',
    marginBottom: 6,
  },
  bold: {
    fontWeight: '700',
  },
  statusPaymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusBadge: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    
  },
  statusText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});










//------------------------------ without saecrhbar ---------------------------------------

// import React, { useEffect, useState } from 'react';
// import { 
//   View, 
//   Text, 
//   FlatList, 
//   ActivityIndicator, 
//   StyleSheet, 
//   Alert ,SafeAreaView 
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';

// const AdminDashboard = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);

//  const fetchOrders = async () => {
//   const token = await AsyncStorage.getItem('token');

//   if (!token) {
//     Alert.alert('Unauthorized', 'No token found. Please login again.');
//     setLoading(false);
//     return;
//   }

//   try {
//     const res = await axios.get('http://172.20.10.2:5000/admin/orders', {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     console.log('Orders API Raw Response:', JSON.stringify(res.data, null, 2));

//     const data = Array.isArray(res.data.data)
//       ? res.data.data
//       : [];

//     console.log('Parsed Orders:', data);
//     setOrders(data);
//   } catch (error) {
//     Alert.alert('Error', 'Failed to fetch orders.');
//     console.error('Order fetch error:', error);
//   } finally {
//     setLoading(false);
//   }
// };


//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#007BFF" />
//       </View>
//     );
//   }

  

//   const renderOrder = ({ item }) => {
//   return (
//     <View style={styles.orderCard}>
//       <Text style={styles.title}>Order ID: {item._id}</Text>
//       <Text>Employee: {item.name || item.employeeId || 'N/A'}</Text>
//       <Text>
//         Items:{' '}
//         {Array.isArray(item.menuItems) && item.menuItems.length > 0
//           ? item.menuItems.join(', ')
//           : 'No items info'}
//       </Text>

//       <Text>Status: {item.status || 'Pending'}</Text>
//       <Text>Payment: {item.paymentMode || 'N/A'}</Text>
//       <Text>Total: {item.totalAmount ? `₹${item.totalAmount}` : 'N/A'}</Text>
//       <Text>
//         Date:{' '}
//         {item.createdAt
//           ? new Date(item.createdAt).toLocaleString()
//           : 'N/A'}
//       </Text>
//     </View>
//   );
// };


//   return (
//     <SafeAreaView style={styles.container}>

//       <Text style={styles.header}>Admin Dashboard - Live Orders</Text>

//       {orders.length === 0 ? (
//         <Text style={styles.noOrdersText}>No orders available.</Text>
//       ) : (
//         <FlatList
//           data={orders}
//           keyExtractor={(item) => item._id}
//           renderItem={renderOrder}
//           contentContainerStyle={{ paddingBottom: 20 }}
//         />
//       )}
//     </SafeAreaView>
//   )
// };

// export default AdminDashboard;

// const styles = StyleSheet.create({
//    container: {
//     flex: 1,
//     backgroundColor: '#FFF1F2',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 24,
//     width: '100%',
//     maxWidth: 400, // limit width like a mobile screen
//     alignSelf: 'center', // center horizontally on web
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#F9FAFB",
//   },
//   header: {
//     fontSize: 26,
//     fontWeight: "bold",
//     color: "#111827", // dark slate
//     textAlign: "center",
//     marginBottom: 24,
//     borderBottomWidth: 2,
//     borderBottomColor: "#3B82F6",
//     paddingBottom: 8,
//   },
//    noOrdersText: {
//     textAlign: "center",
//     marginTop: 40,
//     fontSize: 16,
//     color: "#6B7280", // gray
//     fontStyle: "italic",
//   },
//   orderCard: {
//     backgroundColor: "#FFFFFF",
//     padding: 18,
//     marginBottom: 16,
//     borderRadius: 16,
//     borderLeftWidth: 5,
//     borderLeftColor: "#3B82F6", // Blue accent
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     elevation: 4,
//   },
//   title: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#2563EB", // Blue-600
//     marginBottom: 8,
//   },
//   orderDetail: {
//     fontSize: 14,
//     color: "#374151", // Slate gray
//     marginBottom: 4,
//     lineHeight: 20,
//   },
//   statusPending: {
//     color: "#D97706", // Amber
//     fontWeight: "600",
//   },
//   statusPreparing: {
//     color: "#2563EB", // Blue
//     fontWeight: "600",
//   },
//   statusReady: {
//     color: "#059669", // Green
//     fontWeight: "600",
//   },
//   statusDelivered: {
//     color: "#10B981", // Emerald
//     fontWeight: "600",
//   },
// });
