"use client"

import { useState, useEffect, useCallback } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from "react-native" // Import Alert
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "../context/ThemeContext"
import { User, ChevronRight } from "lucide-react-native"
import { supabase } from "../utils/supabaseClient"
import SentimentAnalytics from "../components/SentimentAnalytics"
// Import the initNotifications function
import { initNotifications, sendTestNotification } from '../utils/NotificationService'; // Ensure sendTestNotification is also imported

const UserListScreen = () => {
  const { colors } = useTheme()
  const navigation = useNavigation()
  const [usernames, setUsernames] = useState([])
  const [allPosts, setAllPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  // Add state to track notification permission status
  const [notificationStatus, setNotificationStatus] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      // Fetch all posts for overall analytics
      const { data: postsData, error: postsError } = await supabase
        .from("SentimentResult") // Make sure this table name is correct
        .select("*")
        .order("timestamp", { ascending: false })

      if (postsError) {
        throw postsError
      }

      setAllPosts(postsData)

      // Extract unique usernames with their post counts
      const userMap = postsData.reduce((acc, post) => {
        if (!acc[post.username]) {
          acc[post.username] = {
            name: post.username,
            postCount: 1,
          }
        } else {
          acc[post.username].postCount += 1
        }
        return acc
      }, {})

      const uniqueUsernames = Object.values(userMap)
      setUsernames(uniqueUsernames)
      setError(null)

      // Check notification status after data is fetched
      const { status } = await Notifications.getPermissionsAsync(); //
      setNotificationStatus(status);


    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to load data. Please try again later.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchData()
  }

  // Function to handle permission request on button press
  const handleRequestPermission = async () => {
    const granted = await initNotifications(); // Call the function from NotificationService
    if (granted) {
      Alert.alert('Success', 'Notification permissions granted!');
      setNotificationStatus('granted'); // Update status state
    } else {
      Alert.alert('Permission Denied', 'Please enable notifications in app settings.');
      setNotificationStatus('denied'); // Update status state
    }
  };


  const navigateToUserDetail = (userName) => {
    navigation.navigate("UserDetail", { userName })
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => navigateToUserDetail(item.name)}
    >
      <View style={styles.userInfo}>
        <View style={[styles.avatarContainer, { backgroundColor: `${colors.primary}20` }]}>
          <User size={24} color={colors.primary} />
        </View>
        <View>
          <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.postCount, { color: `${colors.text}80` }]}>
            {item.postCount} {item.postCount === 1 ? "post" : "posts"}
          </Text>
        </View>
      </View>
      <ChevronRight size={20} color={`${colors.text}60`} />
    </TouchableOpacity>
  )

  const renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
        {/* Conditionally render the permission button */}
        {notificationStatus !== 'granted' && (
          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: colors.primary }]}
            onPress={handleRequestPermission}
          >
            <Text style={styles.permissionButtonText}>Allow Notifications</Text>
          </TouchableOpacity>
        )}

        {allPosts.length > 0 && (
             <SentimentAnalytics posts={allPosts} title="Overall Sentiment Analytics" />
        )}

        <Text style={[styles.headerText, { color: colors.text, marginTop: allPosts.length > 0 ? 16 : 0 }]}>
          Select a user to view their sentiment analysis
        </Text>
      </View>
    );
  }


  if (loading && !refreshing) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading dashboard...</Text>
      </View>
    )
  }

  if (error && !refreshing) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.negative }]}>{error}</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={usernames}
        renderItem={renderItem}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
             {/* Conditionally render the permission button in empty state */}
            {notificationStatus !== 'granted' && (
              <TouchableOpacity
                style={[styles.permissionButton, { backgroundColor: colors.primary, marginBottom: 20 }]}
                onPress={handleRequestPermission}
              >
                <Text style={styles.permissionButtonText}>Allow Notifications</Text>
              </TouchableOpacity>
            )}
            <Text style={[styles.emptyText, { color: colors.text }]}>No users found</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  listContainer: {
    padding: 16,
  },
  headerContainer: {
    marginBottom: 8,
  },
  headerText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 2,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  postCount: {
    fontSize: 14,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
  },
  // Styles for the permission button
  permissionButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 20, // Add some margin below the button
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
})

export default UserListScreen