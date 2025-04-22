"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, FlatList, RefreshControl, Text, ActivityIndicator } from "react-native"
import { useTheme } from "../context/ThemeContext"
import SentimentPost from "../components/SentimentPost"
import SentimentAnalytics from "../components/SentimentAnalytics"
import { supabase } from "../utils/supabaseClient"

const SentimentReportsScreen = () => {
  const { colors } = useTheme()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const fetchPosts = async () => {
    try {
      // Adjust the table name and query to match your Supabase setup
      const { data, error } = await supabase
        .from("SentimentResult")
        .select("*")
        .order("timestamp", { ascending: false })

      if (error) {
        throw error
      }

      setPosts(data)
      setError(null)
    } catch (error) {
      console.error("Error fetching posts:", error)
      setError("Failed to load sentiment analysis. Please try again later.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchPosts()
  }

  const renderItem = ({ item }) => (
    <SentimentPost user={item.username} content={item.content} sentiment={item.sentiment} timestamp={item.timestamp} />
  )

  const renderHeader = () => {
    if (posts.length === 0 && !loading) {
      return null
    }

    return <SentimentAnalytics posts={posts} />
  }

  if (loading && !refreshing) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading sentiment analysis...</Text>
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
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text }]}>No sentiment analysis results found</Text>
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

export default SentimentReportsScreen

