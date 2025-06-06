"use client"

import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Animated,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "../context/ThemeContext"
import { User, ChevronRight, MessageCircle, AlertTriangle, EyeOff, Eye, RefreshCw } from "lucide-react-native"
import { supabase } from "../utils/supabaseClient"
import SentimentAnalytics from "../components/SentimentAnalytics"
import * as FileSystem from "expo-file-system"
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler"

const UserListScreen = () => {
  const { colors } = useTheme()
  const navigation = useNavigation()
  const [usernames, setUsernames] = useState([])
  const [allPosts, setAllPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [profileImages, setProfileImages] = useState({})
  const [hiddenUsers, setHiddenUsers] = useState([])
  const [showHidden, setShowHidden] = useState(false)
  const swipeableRefs = {}

  // Directory for storing user images
  const userImagesDir = FileSystem.documentDirectory + "user_images/"

  // Check if the directory exists and create it if it doesn't
  const setupImageDirectory = async () => {
    const dirInfo = await FileSystem.getInfoAsync(userImagesDir)
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(userImagesDir, { intermediates: true })
    }
  }

  // Load profile images for all users
  const loadProfileImages = async (users) => {
    try {
      await setupImageDirectory()

      const imageMap = {}

      // Check for each user if they have a profile image
      for (const user of users) {
        const username = user.name
        const imagePath = userImagesDir + `${username}.jpg`
        const imageInfo = await FileSystem.getInfoAsync(imagePath)

        if (imageInfo.exists) {
          // Add timestamp to prevent caching issues
          imageMap[username] = `file://${imagePath}?t=${new Date().getTime()}`
        }
      }

      setProfileImages(imageMap)
    } catch (error) {
      console.error("Error loading profile images:", error)
    }
  }

  const fetchData = useCallback(async () => {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

      const { data: postsData, error: postsError } = await supabase
        .from("SentimentResult")
        .select("*")
        .order("timestamp", { ascending: false })

      if (postsError) {
        throw postsError
      }

      setAllPosts(postsData)

      const userMap = postsData.reduce((acc, post) => {
        const username = post.username
        const sentiment = post.sentiment?.toLowerCase() || "neutral"
        const isRecent = new Date(post.timestamp) >= new Date(twentyFourHoursAgo)

        if (!acc[username]) {
          acc[username] = {
            name: username,
            postCount: 0,
            positiveCount: 0,
            negativeCount: 0,
            recentSentiment: null,
          }
        }

        acc[username].postCount += 1

        if (isRecent) {
          if (sentiment === "positive") {
            acc[username].positiveCount += 1
            if (!acc[username].recentSentiment) acc[username].recentSentiment = "positive"
          } else if (sentiment === "negative") {
            acc[username].negativeCount += 1
            if (!acc[username].recentSentiment) acc[username].recentSentiment = "negative"
          } else {
            if (!acc[username].recentSentiment) acc[username].recentSentiment = "neutral"
          }
        }

        return acc
      }, {})

      const uniqueUsernames = Object.values(userMap)
      setUsernames(uniqueUsernames)

      // Load profile images for all users
      await loadProfileImages(uniqueUsernames)

      setError(null)
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

  const navigateToUserDetail = (userName) => {
    navigation.navigate("UserDetail", { userName })
  }

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return colors.positive
      case "negative":
        return colors.negative
      default:
        return colors.neutral
    }
  }

  const hideUser = (userName) => {
    setHiddenUsers([...hiddenUsers, userName])
  }

  const restoreUser = (userName) => {
    setHiddenUsers(hiddenUsers.filter(name => name !== userName))
    // Close any open swipeable
    if (swipeableRefs[userName]) {
      swipeableRefs[userName].close()
    }
  }

  const toggleHiddenUsers = () => {
    setShowHidden(!showHidden)
  }

  const renderRightActions = (userName, isHidden) => {
    if (isHidden) {
      return (
        <TouchableOpacity
          style={[styles.restoreAction, { backgroundColor: colors.positive }]}
          onPress={() => restoreUser(userName)}
        >
          <RefreshCw size={20} color="#FFF" />
          <Text style={styles.actionText}>Restore</Text>
        </TouchableOpacity>
      )
    } else {
      return (
        <TouchableOpacity
          style={[styles.hideAction, { backgroundColor: colors.negative }]}
          onPress={() => hideUser(userName)}
        >
          <EyeOff size={20} color="#FFF" />
          <Text style={styles.actionText}>Hide</Text>
        </TouchableOpacity>
      )
    }
  }

  const renderItem = ({ item }) => {
    const isHidden = hiddenUsers.includes(item.name)
    
    // Skip rendering if user is hidden and we're not showing hidden users
    if (isHidden && !showHidden) {
      return null
    }

    return (
      <Swipeable
        ref={ref => swipeableRefs[item.name] = ref}
        renderRightActions={() => renderRightActions(item.name, isHidden)}
        friction={2}
        overshootRight={false}
      >
        <TouchableOpacity
          style={[
            styles.userCard, 
            { backgroundColor: colors.card },
            isHidden && showHidden && styles.hiddenUserCard
          ]}
          onPress={() => navigateToUserDetail(item.name)}
        >
          <View style={styles.userInfo}>
            <View style={[styles.avatarContainer, { backgroundColor: colors.background }]}>
              {profileImages[item.name] ? (
                <Image source={{ uri: profileImages[item.name] }} style={styles.avatarImage} />
              ) : (
                <Text style={[styles.avatarText, { color: colors.subtext }]}>{item.name.charAt(0).toUpperCase()}</Text>
              )}
            </View>
            <View style={styles.textContainer}>
              <View style={styles.nameContainer}>
                <Text style={[styles.userName, { color: colors.text }]}>
                  {item.name}
                </Text>
                {isHidden && showHidden && (
                  <View style={styles.hiddenBadgeContainer}>
                    <Text style={[styles.hiddenBadge, { color: colors.negative }]}>(Hidden)</Text>
                    <TouchableOpacity 
                      style={[styles.restoreButton, { backgroundColor: colors.positive }]}
                      onPress={() => restoreUser(item.name)}
                    >
                      <RefreshCw size={12} color="#FFF" />
                      <Text style={styles.restoreButtonText}>Restore</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <View style={styles.statsContainer}>
                <MessageCircle size={14} color={colors.subtext} />
                <Text style={[styles.postCount, { color: colors.subtext }]}>
                  {item.postCount} {item.postCount === 1 ? "post" : "posts"}
                </Text>
                {item.negativeCount > 0 && (
                  <View style={[styles.warningBadge, { backgroundColor: colors.negative }]}>
                    <AlertTriangle size={12} color="#FFF" />
                    <Text style={styles.warningBadgeText}>
                      {item.negativeCount} negative {item.negativeCount === 1 ? "post" : "posts"} in 24h
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          <View style={styles.rightSection}>
            {item.recentSentiment && (
              <View style={[styles.sentimentIndicator, { backgroundColor: getSentimentColor(item.recentSentiment) }]} />
            )}
            <ChevronRight size={20} color={colors.subtext} />
          </View>
        </TouchableOpacity>
      </Swipeable>
    )
  }

  const renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
        <SentimentAnalytics posts={allPosts} />
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Users</Text>
            {hiddenUsers.length > 0 && (
              <TouchableOpacity 
                style={[styles.toggleHiddenButton, { backgroundColor: showHidden ? colors.primary : colors.card }]} 
                onPress={toggleHiddenUsers}
              >
                {showHidden ? (
                  <>
                    <EyeOff size={16} color="#FFF" />
                    <Text style={styles.toggleHiddenButtonText}>Hide ({hiddenUsers.length})</Text>
                  </>
                ) : (
                  <>
                    <Eye size={16} color={colors.primary} />
                    <Text style={[styles.toggleHiddenButtonText, { color: colors.primary }]}>Show Hidden ({hiddenUsers.length})</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
          <Text style={[styles.sectionSubtitle, { color: colors.subtext }]}>
            {usernames.length - (showHidden ? 0 : hiddenUsers.length)} active user{usernames.length - (showHidden ? 0 : hiddenUsers.length) !== 1 ? 's' : ''}
          </Text>
          {showHidden && hiddenUsers.length > 0 && (
            <TouchableOpacity 
              style={[styles.restoreAllButton, { borderColor: colors.positive }]}
              onPress={() => setHiddenUsers([])}
            >
              <RefreshCw size={14} color={colors.positive} />
              <Text style={[styles.restoreAllButtonText, { color: colors.positive }]}>Restore All Users</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    )
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
    <GestureHandlerRootView style={{ flex: 1 }}>
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
              <View style={[styles.emptyIcon, { backgroundColor: colors.card }]}>
                <User size={32} color={colors.subtext} />
              </View>
              <Text style={[styles.emptyText, { color: colors.text }]}>No customers found</Text>
              <Text style={[styles.emptySubtext, { color: colors.subtext }]}>Pull down to refresh</Text>
            </View>
          }
        />
      </View>
    </GestureHandlerRootView>
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
  sectionHeader: {
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  sectionSubtitle: {
    fontSize: 15,
    marginBottom: 8,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  hiddenUserCard: {
    opacity: 0.7,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#ccc",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    overflow: "hidden",
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "600",
  },
  textContainer: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 4,
  },
  userName: {
    fontSize: 17,
    fontWeight: "600",
  },
  hiddenBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    gap: 8,
  },
  hiddenBadge: {
    fontStyle: "italic",
    fontSize: 14,
  },
  restoreButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  restoreButtonText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  postCount: {
    fontSize: 14,
    marginLeft: 6,
  },
  warningBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  warningBadgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sentimentIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
    padding: 32,
    alignItems: "center",
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
  },
  hideAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  restoreAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  actionText: {
    color: "#FFF",
    fontWeight: "600",
    marginTop: 4,
  },
  toggleHiddenButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  toggleHiddenButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 12,
  },
  restoreAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    gap: 8,
  },
  restoreAllButtonText: {
    fontWeight: "600",
    fontSize: 14,
  },
})

export default UserListScreen