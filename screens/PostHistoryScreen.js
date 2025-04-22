"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "../context/ThemeContext"
import { User, ChevronRight } from "lucide-react-native"
import { supabase } from "../utils/supabaseClient"

const PostHistoryScreen = () => {
  const { colors } = useTheme()
  const navigation = useNavigation()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const fetchUsers = async () => {
    try {
      // Fetch unique users from the sentiment_posts table
      const { data, error } = await supabase.from("SentimentResult").select("username, id").order("username")

      if (error) {
        throw error
      }

      // Extract unique users with their post counts
      const userMap = data.reduce((acc, post) => {
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

      const uniqueUsers = Object.values(userMap)
      setUsers(uniqueUsers)
      setError(null)
    } catch (error) {
      console.error("Error fetching users:", error)
      setError("Failed to load users. Please try again later.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchUsers()
  }

  const navigateToUserPosts = (userName) => {
    navigation.navigate("UserPosts", { userName })
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => navigateToUserPosts(item.name)}
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

  if (loading && !refreshing) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading users...</Text>
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
        data={users}
        renderItem={renderItem}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          <Text style={[styles.headerText, { color: colors.text }]}>Select a user to view their post history</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
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
})

export default PostHistoryScreen

