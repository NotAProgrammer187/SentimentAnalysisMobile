import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl,
  TouchableOpacity,
  Image,
  Alert,
  ToastAndroid,
  Platform,
  Linking,
  Modal,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import SentimentPost from '../components/SentimentPost';
import SentimentAnalytics from '../components/SentimentAnalytics';
import { supabase } from '../utils/supabaseClient';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import ViewShot from 'react-native-view-shot';
import { Camera, Upload, Download, X, Check, FolderOpen, Image as ImageIcon, Save } from 'lucide-react-native';

const UserDetailScreen = () => {
  const { colors } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { userName } = route.params;
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [savedImagePath, setSavedImagePath] = useState(null);
  const [capturingImage, setCapturingImage] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewImageUri, setPreviewImageUri] = useState(null);
  
  // Selection mode state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState({});
  
  // Ref for the ViewShot component
  const viewShotRef = useRef(null);
  
  // Directory for storing user images and exports
  const userImagesDir = FileSystem.documentDirectory + 'user_images/';
  const exportsDir = FileSystem.documentDirectory + 'exports/';

  // Ensure the directories exist
  const setupDirectories = async () => {
    try {
      const imageDirInfo = await FileSystem.getInfoAsync(userImagesDir);
      if (!imageDirInfo.exists) {
        await FileSystem.makeDirectoryAsync(userImagesDir, { intermediates: true });
      }
      
      const exportsDirInfo = await FileSystem.getInfoAsync(exportsDir);
      if (!exportsDirInfo.exists) {
        await FileSystem.makeDirectoryAsync(exportsDir, { intermediates: true });
      }
      return true;
    } catch (error) {
      console.error('Error setting up directories:', error);
      return false;
    }
  };

  // Load the user's profile image if it exists
  const loadProfileImage = async () => {
    try {
      await setupDirectories();
      const imagePath = userImagesDir + `${userName}.jpg`;
      const imageInfo = await FileSystem.getInfoAsync(imagePath);
      
      if (imageInfo.exists) {
        setProfileImage(`file://${imagePath}`);
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
    }
  };

  const fetchUserPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('SentimentResult')
        .select('*')
        .eq('username', userName)
        .order('timestamp', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setPosts(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userName]);

  useEffect(() => {
    fetchUserPosts();
    loadProfileImage();
    
    // Set up navigation options for selection mode
    navigation.setOptions({
      headerRight: selectionMode ? () => (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity 
            style={{ marginRight: 15 }}
            onPress={handleSaveAsImage}
            disabled={capturingImage}
          >
            <Save color={colors.text} size={24} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={{ marginRight: 15 }}
            onPress={exitSelectionMode}
          >
            <X color={colors.text} size={24} />
          </TouchableOpacity>
        </View>
      ) : undefined,
      headerTitle: selectionMode ? 
        `${Object.keys(selectedPosts).length} Selected` : 
        userName
    });
  }, [fetchUserPosts, selectionMode, selectedPosts, capturingImage]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserPosts();
    await loadProfileImage();
  };

  // Function to pick an image from the gallery
  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload an image.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        await saveImage(selectedImage.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Function to take a photo with the camera
  const takePhoto = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera permissions to take a photo.');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        await saveImage(selectedImage.uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  // Function to save the image to local storage
  const saveImage = async (imageUri) => {
    try {
      await setupDirectories();
      const fileName = `${userName}.jpg`;
      const newPath = userImagesDir + fileName;
      
      await FileSystem.copyAsync({
        from: imageUri,
        to: newPath
      });
      
      setProfileImage(`file://${newPath}`);
      Alert.alert('Success', 'Profile image updated successfully!');
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('Error', 'Failed to save image. Please try again.');
    }
  };
  
  // Toggle selection mode
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedPosts({});
  };
  
  // Exit selection mode
  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedPosts({});
  };
  
  // Toggle post selection
  const togglePostSelection = (postId) => {
    setSelectedPosts(prev => {
      const newSelected = { ...prev };
      if (newSelected[postId]) {
        delete newSelected[postId];
      } else {
        newSelected[postId] = true;
      }
      return newSelected;
    });
  };
  
  // Handle long press on a post
  const handleLongPress = (postId) => {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedPosts({ [postId]: true });
    }
  };
  
  // Handle tap on a post
  const handlePostPress = (postId) => {
    if (selectionMode) {
      togglePostSelection(postId);
    }
  };
  
  // Open the saved image
  const openSavedImage = async () => {
    if (savedImagePath) {
      try {
        // For Android, we can try to open the image directly
        if (Platform.OS === 'android') {
          const supported = await Linking.canOpenURL(savedImagePath);
          if (supported) {
            await Linking.openURL(savedImagePath);
          } else {
            // If direct file opening is not supported, show the path
            Alert.alert(
              'Image Location',
              `Your image is saved at:\n${savedImagePath}\n\nYou can access it in your gallery.`
            );
          }
        } else {
          // For iOS, just show the path since direct file access is limited
          Alert.alert(
            'Image Location',
            `Your image is saved in your photo library.`
          );
        }
      } catch (error) {
        console.error('Error opening image:', error);
        Alert.alert('Error', 'Could not open the saved image.');
      }
    }
  };
  
  // Save the preview image to the photo library
  const savePreviewToLibrary = async () => {
    try {
      if (!previewImageUri) {
        Alert.alert('Error', 'No image to save.');
        return;
      }
      
      // Request permission to save to photo library
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to save images to your photo library.');
        return;
      }
      
      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(previewImageUri);
      
      // Also save a copy in our app directory for reference
      await setupDirectories();
      const timestamp = new Date().getTime();
      const fileName = `${userName}_posts_${timestamp}.jpg`;
      const filePath = exportsDir + fileName;
      
      await FileSystem.copyAsync({
        from: previewImageUri,
        to: filePath
      });
      
      // Save the path for later access
      setSavedImagePath(asset.uri);
      
      // Show success message
      Alert.alert(
        'Image Saved',
        `Posts have been saved as an image to your photo library.`,
        [
          { text: 'OK', style: 'default' },
          { 
            text: 'View Image', 
            onPress: openSavedImage,
            style: 'default'
          }
        ]
      );
      
      // Show toast on Android
      if (Platform.OS === 'android') {
        ToastAndroid.show('Image saved to gallery!', ToastAndroid.SHORT);
      }
      
      // Close preview and exit selection mode
      setShowPreview(false);
      exitSelectionMode();
      
    } catch (error) {
      console.error('Error saving image to library:', error);
      Alert.alert('Error', 'Failed to save image to photo library. Please try again.');
    }
  };
  
  // Save selected posts as an image
  const handleSaveAsImage = async () => {
    try {
      const selectedPostIds = Object.keys(selectedPosts);
      
      if (selectedPostIds.length === 0) {
        Alert.alert('No Posts Selected', 'Please select at least one post to save as image.');
        return;
      }
      
      // Request permission to save to photo library
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to save images to your photo library.');
        return;
      }
      
      // Start capturing process
      setCapturingImage(true);
      
      console.log('Starting image capture...');
      
      // Make sure directories exist
      const dirsSetup = await setupDirectories();
      if (!dirsSetup) {
        throw new Error('Failed to set up directories');
      }
      
      // Capture the view as an image
      if (viewShotRef.current) {
        console.log('ViewShot ref exists, attempting capture...');
        
        try {
          const uri = await viewShotRef.current.capture();
          console.log('Image captured successfully:', uri);
          
          // Show preview instead of saving directly
          setPreviewImageUri(uri);
          setShowPreview(true);
          
        } catch (captureError) {
          console.error('Error during ViewShot capture:', captureError);
          throw new Error(`Capture failed: ${captureError.message}`);
        }
      } else {
        console.error('ViewShot ref is null');
        throw new Error('ViewShot reference not available');
      }
    } catch (error) {
      console.error('Error saving posts as image:', error);
      Alert.alert('Error', `Failed to save posts as image: ${error.message}`);
    } finally {
      setCapturingImage(false);
    }
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedPosts[item.id] || false;
    
    return (
      <TouchableOpacity
        onLongPress={() => handleLongPress(item.id)}
        onPress={() => handlePostPress(item.id)}
        delayLongPress={300}
        activeOpacity={0.7}
      >
        <View style={[
          styles.postContainer,
          isSelected && { backgroundColor: `${colors.primary}15` }
        ]}>
          {selectionMode && (
            <View style={[
              styles.selectionIndicator,
              isSelected ? 
                { backgroundColor: colors.primary, borderColor: colors.primary } : 
                { borderColor: colors.border }
            ]}>
              {isSelected && <Check size={16} color="#fff" />}
            </View>
          )}
          <SentimentPost
            user={item.username}
            content={item.content}
            sentiment={item.sentiment}
            timestamp={item.timestamp}
          />
        </View>
      </TouchableOpacity>
    );
  };

  // Render the posts that will be captured as an image
  const renderPostsForCapture = () => {
    // Filter the selected posts
    const postsToCapture = posts.filter(post => selectedPosts[post.id]);
    
    return (
      <View style={[styles.captureContainer, { backgroundColor: colors.background }]}>
        <View style={styles.captureHeader}>
          <View style={styles.captureUserInfo}>
            {profileImage ? (
              <Image 
                source={{ uri: profileImage }} 
                style={styles.captureProfileImage} 
              />
            ) : (
              <View style={[styles.captureProfilePlaceholder, { backgroundColor: `${colors.primary}20` }]}>
                <Text style={[styles.captureProfilePlaceholderText, { color: colors.primary }]}>
                  {userName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={[styles.captureUsername, { color: colors.text }]}>{userName}</Text>
          </View>
          <Text style={[styles.captureDate, { color: colors.text }]}>
            {new Date().toLocaleDateString()}
          </Text>
        </View>
        
        <View style={[styles.captureDivider, { backgroundColor: colors.border }]} />
        
        {postsToCapture.map((post) => (
          <View key={post.id} style={styles.capturePost}>
            <Text style={[styles.captureContent, { color: colors.text }]}>
              {post.content}
            </Text>
            <View style={styles.capturePostFooter}>
              <Text style={[
                styles.captureSentiment, 
                { 
                  color: post.sentiment?.toLowerCase() === 'positive' ? colors.positive : 
                         post.sentiment?.toLowerCase() === 'negative' ? colors.negative : 
                         colors.text 
                }
              ]}>
                {post.sentiment}
              </Text>
              <Text style={[styles.captureTimestamp, { color: `${colors.text}80` }]}>
                {new Date(post.timestamp).toLocaleString()}
              </Text>
            </View>
          </View>
        ))}
        
        <View style={styles.captureFooter}>
          <Text style={[styles.captureFooterText, { color: `${colors.text}60` }]}>
            Exported from Sentiment App
          </Text>
        </View>
      </View>
    );
  };

  const renderHeader = () => {
    if (posts.length === 0 && !loading) {
      return (
        <View style={styles.profileContainer}>
          {renderProfileSection()}
        </View>
      );
    }
    
    return (
      <View style={styles.headerContainer}>
        {renderProfileSection()}
        <SentimentAnalytics posts={posts} />
        <View style={styles.postHeaderContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Post History
          </Text>
          <View style={styles.headerButtonsContainer}>
            {savedImagePath && (
              <TouchableOpacity 
                onPress={openSavedImage}
                style={[styles.iconButton, { borderColor: colors.border }]}
              >
                <ImageIcon size={18} color={colors.primary} />
              </TouchableOpacity>
            )}
            {posts.length > 0 && (
              <TouchableOpacity 
                onPress={toggleSelectionMode}
                style={[styles.selectionButton, { borderColor: colors.border }]}
              >
                <Text style={{ color: colors.primary }}>
                  {selectionMode ? 'Cancel' : 'Select'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderProfileSection = () => (
    <View style={styles.profileSection}>
      <View style={styles.profileImageContainer}>
        {profileImage ? (
          <Image 
            source={{ uri: profileImage }} 
            style={styles.profileImage} 
          />
        ) : (
          <View style={[styles.profileImagePlaceholder, { backgroundColor: `${colors.primary}20` }]}>
            <Text style={[styles.profileImagePlaceholderText, { color: colors.primary }]}>
              {userName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      
      <Text style={[styles.profileName, { color: colors.text }]}>{userName}</Text>
      
      <View style={styles.imageButtonsContainer}>
        <TouchableOpacity 
          style={[styles.imageButton, { backgroundColor: colors.primary }]} 
          onPress={takePhoto}
        >
          <Camera size={18} color="#fff" />
          <Text style={styles.imageButtonText}>Camera</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.imageButton, { backgroundColor: colors.primary }]} 
          onPress={pickImage}
        >
          <Upload size={18} color="#fff" />
          <Text style={styles.imageButtonText}>Gallery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Preview Modal
  const renderPreviewModal = () => (
    <Modal
      visible={showPreview}
      animationType="slide"
      transparent={false}
      onRequestClose={() => setShowPreview(false)}
    >
      <SafeAreaView style={[styles.previewContainer, { backgroundColor: colors.background }]}>
        <View style={styles.previewHeader}>
          <Text style={[styles.previewTitle, { color: colors.text }]}>Image Preview</Text>
          <TouchableOpacity 
            onPress={() => setShowPreview(false)}
            style={styles.previewCloseButton}
          >
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.previewImageContainer}>
          {previewImageUri ? (
            <Image 
              source={{ uri: previewImageUri }} 
              style={styles.previewImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={{ color: colors.text }}>No preview available</Text>
          )}
        </View>
        
        <View style={styles.previewActions}>
          <TouchableOpacity 
            style={[styles.previewButton, { backgroundColor: colors.primary }]}
            onPress={savePreviewToLibrary}
          >
            <Save size={20} color="#fff" />
            <Text style={styles.previewButtonText}>Save to Gallery</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.previewButton, { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border }]}
            onPress={() => setShowPreview(false)}
          >
            <X size={20} color={colors.text} />
            <Text style={[styles.previewButtonText, { color: colors.text }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading data for {userName}...
        </Text>
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.negative }]}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hidden ViewShot component for capturing selected posts */}
      <ViewShot
        ref={viewShotRef}
        options={{
          format: 'jpg',
          quality: 0.9,
          result: 'file'
        }}
        style={styles.hiddenViewShot}
      >
        {Object.keys(selectedPosts).length > 0 && renderPostsForCapture()}
      </ViewShot>
      
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No posts found for this user
            </Text>
          </View>
        }
      />
      
      {/* Preview Modal */}
      {renderPreviewModal()}
      
      {capturingImage && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingOverlayText}>Creating image...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContainer: {
    paddingVertical: 12,
  },
  headerContainer: {
    marginBottom: 8,
  },
  postHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  headerButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  selectionButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  profileContainer: {
    marginBottom: 16,
  },
  profileSection: {
    alignItems: 'center',
    padding: 16,
  },
  profileImageContainer: {
    marginBottom: 12,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  imageButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  postContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    position: 'relative',
    paddingLeft: 8,
  },
  selectionIndicator: {
    position: 'absolute',
    left: 8,
    top: '50%',
    marginTop: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  // ViewShot styles
  hiddenViewShot: {
    position: 'absolute',
    width: 1080, // Higher resolution for better quality
    height: 'auto',
    opacity: 0.01, // Almost invisible but still rendered
    top: 0,
    left: 0,
    zIndex: -1,
  },
  // Capture styles for the image
  captureContainer: {
    width: 1080,
    padding: 40,
    borderRadius: 16,
    overflow: 'hidden',
  },
  captureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  captureUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  captureProfileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  captureProfilePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  captureProfilePlaceholderText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  captureUsername: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  captureDate: {
    fontSize: 18,
  },
  captureDivider: {
    height: 2,
    marginBottom: 20,
  },
  capturePost: {
    marginBottom: 30,
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  captureContent: {
    fontSize: 20,
    lineHeight: 28,
    marginBottom: 16,
  },
  capturePostFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  captureSentiment: {
    fontSize: 18,
    fontWeight: '600',
  },
  captureTimestamp: {
    fontSize: 16,
  },
  captureFooter: {
    marginTop: 20,
    alignItems: 'center',
  },
  captureFooterText: {
    fontSize: 16,
  },
  // Loading overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingOverlayText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
  },
  // Preview modal styles
  previewContainer: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  previewCloseButton: {
    padding: 8,
  },
  previewImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    gap: 12,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    gap: 8,
  },
  previewButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
});

export default UserDetailScreen;