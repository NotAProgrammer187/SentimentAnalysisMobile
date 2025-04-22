"use client"

import { useState, useEffect, useCallback } from "react"
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from "react-native"
import { useRoute } from "@react-navigation/native"
import { useTheme } from "../context/ThemeContext"
import SentimentPost from "../components/SentimentPost"
import { supabase } from "../utils/supabaseClient"

const UserPostsScreen = () => {
  const { colors } = useTheme()
  const route = useRoute()
  const { userName } = route.params

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const fetchUserPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("SentimentResult")
        .select("*")
        .eq("username", userName)
        .order("timestamp", { ascending: false })

      if (error) {
        throw error
      }

      setPosts(data)
      setError(null)
    } catch (error) {
      console.error("Error fetching user posts:", error)
      setError("Failed to load posts. Please try again later.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [userName])

  useEffect(() => {
    fetchUserPosts()
  }, [fetchUserPosts])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchUserPosts()
  }

  const renderItem = ({ item }) => (
    <SentimentPost user={item.username} content={item.content} sentiment={item.sentiment} timestamp={item.timestamp} />
  )

  if (loading && !refreshing) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading posts for {userName}...</Text>
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
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={[styles.headerText, { color: colors.text }]}>
              {posts.length} {posts.length === 1 ? "post" : "posts"} from {userName}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text }]}>No posts found for this user</Text>
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
    paddingVertical: 12,
  },
  headerContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "500",
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

export default UserPostsScreen

