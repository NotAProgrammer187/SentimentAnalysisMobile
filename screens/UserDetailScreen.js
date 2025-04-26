"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ToastAndroid,
  Platform,
  Linking,
} from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { useTheme } from "../context/ThemeContext"
import SentimentAnalytics from "../components/SentimentAnalytics"
import { supabase } from "../utils/supabaseClient"
import * as ImagePicker from "expo-image-picker"
import * as FileSystem from "expo-file-system"
import * as MediaLibrary from "expo-media-library"
import ViewShot from "react-native-view-shot"
import { Filter, ChevronDown, ChevronUp, Check, Image as ImageIcon, Save, X } from "lucide-react-native"

// Import components
import ProfileSection from "../components/ProfileSection"
import FilterSection from "../components/FilterSection"
import PostItem from "../components/PostItem"
import PreviewModal from "../components/PreviewModal"
import PostCapture from "../components/PostCapture"

const UserDetailScreen = () => {
  const { colors } = useTheme()
  const route = useRoute()
  const navigation = useNavigation()
  const { userName } = route.params

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [profileImage, setProfileImage] = useState(null)
  const [savedImagePath, setSavedImagePath] = useState(null)
  const [capturingImage, setCapturingImage] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewImageUri, setPreviewImageUri] = useState(null)

  const [filterSentiment, setFilterSentiment] = useState("all")
  const [filterDateRange, setFilterDateRange] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  // Selection mode state
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedPosts, setSelectedPosts] = useState({})

  // Ref for the ViewShot component
  const viewShotRef = useRef(null)

  // Directory for storing user images and exports
  const userImagesDir = FileSystem.documentDirectory + "user_images/"
  const exportsDir = FileSystem.documentDirectory + "exports/"

  // Check if any filters are active
  const hasActiveFilters = filterSentiment !== "all" || filterDateRange !== "all"

  // Ensure the directories exist
  const setupDirectories = async () => {
    try {
      const imageDirInfo = await FileSystem.getInfoAsync(userImagesDir)
      if (!imageDirInfo.exists) {
        await FileSystem.makeDirectoryAsync(userImagesDir, { intermediates: true })
      }

      const exportsDirInfo = await FileSystem.getInfoAsync(exportsDir)
      if (!exportsDirInfo.exists) {
        await FileSystem.makeDirectoryAsync(exportsDir, { intermediates: true })
      }
      return true
    } catch (error) {
      console.error("Error setting up directories:", error)
      return false
    }
  }

  // Load the user's profile image if it exists
  const loadProfileImage = async () => {
    try {
      await setupDirectories()
      const imagePath = userImagesDir + `${userName}.jpg`
      const imageInfo = await FileSystem.getInfoAsync(imagePath)

      if (imageInfo.exists) {
        setProfileImage(`file://${imagePath}`)
      }
    } catch (error) {
      console.error("Error loading profile image:", error)
    }
  }

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

  // Apply filters to posts
  const getFilteredPosts = useCallback(() => {
    let filteredPosts = [...posts]

    // Apply sentiment filter
    if (filterSentiment !== "all") {
      filteredPosts = filteredPosts.filter((post) => {
        if (filterSentiment === "neutral") {
          // Check for neutral sentiment (not positive or negative)
          const sentiment = post.sentiment?.toLowerCase() || ""
          return sentiment !== "positive" && sentiment !== "negative"
        }
        return post.sentiment?.toLowerCase() === filterSentiment.toLowerCase()
      })
    }

    // Apply date range filter
    const now = new Date()
    if (filterDateRange === "today") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      filteredPosts = filteredPosts.filter((post) => new Date(post.timestamp) >= today)
    } else if (filterDateRange === "week") {
      const lastWeek = new Date(now)
      lastWeek.setDate(lastWeek.getDate() - 7)
      filteredPosts = filteredPosts.filter((post) => new Date(post.timestamp) >= lastWeek)
    } else if (filterDateRange === "month") {
      const lastMonth = new Date(now)
      lastMonth.setMonth(lastMonth.getMonth() - 1)
      filteredPosts = filteredPosts.filter((post) => new Date(post.timestamp) >= lastMonth)
    }

    return filteredPosts
  }, [posts, filterSentiment, filterDateRange])

  useEffect(() => {
    fetchUserPosts()
    loadProfileImage()

    // Set up navigation options for selection mode
    navigation.setOptions({
      headerRight: selectionMode
        ? () => (
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity style={{ marginRight: 15 }} onPress={handleSaveAsImage} disabled={capturingImage}>
                <Save color={colors.text} size={24} />
              </TouchableOpacity>
              <TouchableOpacity style={{ marginRight: 15 }} onPress={exitSelectionMode}>
                <X color={colors.text} size={24} />
              </TouchableOpacity>
            </View>
          )
        : undefined,
      headerTitle: selectionMode ? `${Object.keys(selectedPosts).length} Selected` : userName,
    })
  }, [fetchUserPosts, selectionMode, selectedPosts, capturingImage])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchUserPosts()
    await loadProfileImage()
  }

  // Function to pick an image from the gallery
  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (status !== "granted") {
        Alert.alert("Permission Required", "Please grant camera roll permissions to upload an image.")
        return
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0]
        await saveImage(selectedImage.uri)
      }
    } catch (error) {
      console.error("Error picking image:", error)
      Alert.alert("Error", "Failed to pick image. Please try again.")
    }
  }

  // Function to take a photo with the camera
  const takePhoto = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync()

      if (status !== "granted") {
        Alert.alert("Permission Required", "Please grant camera permissions to take a photo.")
        return
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0]
        await saveImage(selectedImage.uri)
      }
    } catch (error) {
      console.error("Error taking photo:", error)
      Alert.alert("Error", "Failed to take photo. Please try again.")
    }
  }

  // Function to save the image to local storage
  const saveImage = async (imageUri) => {
    try {
      await setupDirectories()
      const fileName = `${userName}.jpg`
      const newPath = userImagesDir + fileName

      await FileSystem.copyAsync({
        from: imageUri,
        to: newPath,
      })

      setProfileImage(`file://${newPath}`)
      Alert.alert("Success", "Profile image updated successfully!")
    } catch (error) {
      console.error("Error saving image:", error)
      Alert.alert("Error", "Failed to save image. Please try again.")
    }
  }

  // Toggle selection mode
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode)
    setSelectedPosts({})
  }

  // Exit selection mode
  const exitSelectionMode = () => {
    setSelectionMode(false)
    setSelectedPosts({})
  }

  // Toggle post selection
  const togglePostSelection = (postId) => {
    setSelectedPosts((prev) => {
      const newSelected = { ...prev }
      if (newSelected[postId]) {
        delete newSelected[postId]
      } else {
        newSelected[postId] = true
      }
      return newSelected
    })
  }

  // Handle long press on a post
  const handleLongPress = (postId) => {
    if (!selectionMode) {
      setSelectionMode(true)
      setSelectedPosts({ [postId]: true })
    }
  }

  // Handle tap on a post
  const handlePostPress = (postId) => {
    if (selectionMode) {
      togglePostSelection(postId)
    }
  }

  // Open the saved image
  const openSavedImage = async () => {
    if (savedImagePath) {
      try {
        // For Android, we can try to open the image directly
        if (Platform.OS === "android") {
          const supported = await Linking.canOpenURL(savedImagePath)
          if (supported) {
            await Linking.openURL(savedImagePath)
          } else {
            // If direct file opening is not supported, show the path
            Alert.alert(
              "Image Location",
              `Your image is saved at:\n${savedImagePath}\n\nYou can access it in your gallery.`,
            )
          }
        } else {
          // For iOS, just show the path since direct file access is limited
          Alert.alert("Image Location", `Your image is saved in your photo library.`)
        }
      } catch (error) {
        console.error("Error opening image:", error)
        Alert.alert("Error", "Could not open the saved image.")
      }
    }
  }

  // Save the preview image to the photo library
  const savePreviewToLibrary = async () => {
    try {
      if (!previewImageUri) {
        Alert.alert("Error", "No image to save.")
        return
      }

      // Request permission to save to photo library
      const { status } = await MediaLibrary.requestPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please grant permission to save images to your photo library.")
        return
      }

      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(previewImageUri)

      // Also save a copy in our app directory for reference
      await setupDirectories()
      const timestamp = new Date().getTime()
      const fileName = `${userName}_posts_${timestamp}.jpg`
      const filePath = exportsDir + fileName

      await FileSystem.copyAsync({
        from: previewImageUri,
        to: filePath,
      })

      // Save the path for later access
      setSavedImagePath(asset.uri)

      // Show success message
      Alert.alert("Image Saved", `Posts have been saved as an image to your photo library.`, [
        { text: "OK", style: "default" },
        {
          text: "View Image",
          onPress: openSavedImage,
          style: "default",
        },
      ])

      // Show toast on Android
      if (Platform.OS === "android") {
        ToastAndroid.show("Image saved to gallery!", ToastAndroid.SHORT)
      }

      // Close preview and exit selection mode
      setShowPreview(false)
      exitSelectionMode()
    } catch (error) {
      console.error("Error saving image to library:", error)
      Alert.alert("Error", "Failed to save image to photo library. Please try again.")
    }
  }

  // Save selected posts as an image
  const handleSaveAsImage = async () => {
    try {
      const selectedPostIds = Object.keys(selectedPosts)

      if (selectedPostIds.length === 0) {
        Alert.alert("No Posts Selected", "Please select at least one post to save as image.")
        return
      }

      // Request permission to save to photo library
      const { status } = await MediaLibrary.requestPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please grant permission to save images to your photo library.")
        return
      }

      // Start capturing process
      setCapturingImage(true)

      // Make sure directories exist
      const dirsSetup = await setupDirectories()
      if (!dirsSetup) {
        throw new Error("Failed to set up directories")
      }

      // Capture the view as an image
      if (viewShotRef.current) {
        try {
          const uri = await viewShotRef.current.capture()

          // Show preview instead of saving directly
          setPreviewImageUri(uri)
          setShowPreview(true)
        } catch (captureError) {
          console.error("Error during ViewShot capture:", captureError)
          throw new Error(`Capture failed: ${captureError.message}`)
        }
      } else {
        throw new Error("ViewShot reference not available")
      }
    } catch (error) {
      console.error("Error saving posts as image:", error)
      Alert.alert("Error", `Failed to save posts as image: ${error.message}`)
    } finally {
      setCapturingImage(false)
    }
  }

  const renderHeader = () => {
    if (posts.length === 0 && !loading) {
      return (
        <View style={styles.profileContainer}>
          <ProfileSection
            userName={userName}
            profileImage={profileImage}
            colors={colors}
            takePhoto={takePhoto}
            pickImage={pickImage}
          />
        </View>
      )
    }

    return (
      <View style={styles.headerContainer}>
        <ProfileSection
          userName={userName}
          profileImage={profileImage}
          colors={colors}
          takePhoto={takePhoto}
          pickImage={pickImage}
        />
        <SentimentAnalytics posts={posts} />
        <View style={styles.postHeaderContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Post History</Text>
          <View style={styles.headerButtonsContainer}>
            {posts.length > 0 && (
              <TouchableOpacity
                onPress={() => setShowFilters(!showFilters)}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: hasActiveFilters ? `${colors.primary}15` : "transparent",
                    borderColor: hasActiveFilters ? colors.primary : colors.border,
                  },
                ]}
              >
                <Filter size={16} color={hasActiveFilters ? colors.primary : colors.text} />
                <Text style={[styles.filterButtonText, { color: hasActiveFilters ? colors.primary : colors.text }]}>
                  Filter
                </Text>
                {showFilters ? (
                  <ChevronUp size={16} color={hasActiveFilters ? colors.primary : colors.text} />
                ) : (
                  <ChevronDown size={16} color={hasActiveFilters ? colors.primary : colors.text} />
                )}
              </TouchableOpacity>
            )}
            {savedImagePath && (
              <TouchableOpacity onPress={openSavedImage} style={[styles.iconButton, { borderColor: colors.border }]}>
                <ImageIcon size={18} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    )
  }

  if (loading && !refreshing) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading data for {userName}...</Text>
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
      {/* Hidden ViewShot component for capturing selected posts */}
      <ViewShot
        ref={viewShotRef}
        options={{
          format: "jpg",
          quality: 0.9,
          result: "file",
        }}
        style={styles.hiddenViewShot}
      >
        {Object.keys(selectedPosts).length > 0 && (
          <PostCapture
            posts={posts}
            selectedPosts={selectedPosts}
            userName={userName}
            profileImage={profileImage}
            colors={colors}
          />
        )}
      </ViewShot>

      <FlatList
        data={getFilteredPosts()}
        renderItem={({ item }) => (
          <PostItem
            item={item}
            isSelected={selectedPosts[item.id] || false}
            colors={colors}
            handleLongPress={handleLongPress}
            handlePostPress={handlePostPress}
            selectionMode={selectionMode}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          <>
            {renderHeader()}
            {showFilters && (
              <FilterSection
                colors={colors}
                filterSentiment={filterSentiment}
                setFilterSentiment={setFilterSentiment}
                filterDateRange={filterDateRange}
                setFilterDateRange={setFilterDateRange}
                hasActiveFilters={hasActiveFilters}
              />
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              {posts.length > 0 ? "No posts match your filters" : "No posts found for this user"}
            </Text>
          </View>
        }
      />

      {/* Floating Action Button for Selection Mode */}
      {posts.length > 0 && !selectionMode && (
        <TouchableOpacity
          style={[styles.floatingActionButton, { backgroundColor: colors.primary }]}
          onPress={toggleSelectionMode}
        >
          <Check size={24} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Preview Modal */}
      <PreviewModal
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        previewImageUri={previewImageUri}
        savePreviewToLibrary={savePreviewToLibrary}
        colors={colors}
      />

      {capturingImage && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingOverlayText}>Creating image...</Text>
        </View>
      )}
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
    marginBottom: 8,
  },
  postHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  headerButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: "500",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
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
  profileContainer: {
    marginBottom: 16,
  },
  // ViewShot styles
  hiddenViewShot: {
    position: "absolute",
    width: 1080, // Higher resolution for better quality
    height: "auto",
    opacity: 0.01, // Almost invisible but still rendered
    top: 0,
    left: 0,
    zIndex: -1,
  },
  // Loading overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingOverlayText: {
    color: "#fff",
    marginTop: 12,
    fontSize: 16,
  },
  floatingActionButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
})

export default UserDetailScreen
