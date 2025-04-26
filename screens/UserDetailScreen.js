import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import SentimentPost from '../components/SentimentPost';
import SentimentAnalytics from '../components/SentimentAnalytics';
import { supabase } from '../utils/supabaseClient';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Camera, Upload } from 'lucide-react-native';

const UserDetailScreen = () => {
  const { colors } = useTheme();
  const route = useRoute();
  const { userName } = route.params;
  
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [filter, setFilter] = useState('All'); // All | Positive | Neutral | Negative

  const userImagesDir = FileSystem.documentDirectory + 'user_images/';

  const setupImageDirectory = async () => {
    const dirInfo = await FileSystem.getInfoAsync(userImagesDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(userImagesDir, { intermediates: true });
    }
  };

  const loadProfileImage = async () => {
    try {
      await setupImageDirectory();
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
      
      if (error) throw error;
      
      setPosts(data);
      setError(null);
      setFilter('All'); // Reset filter on refresh
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
  }, [fetchUserPosts]);

  useEffect(() => {
    if (filter === 'All') {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter(post => post.sentiment === filter));
    }
  }, [filter, posts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserPosts();
    await loadProfileImage();
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload an image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        await saveImage(selectedImage.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera permissions to take a photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        await saveImage(selectedImage.uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const saveImage = async (imageUri) => {
    try {
      await setupImageDirectory();
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

  const renderItem = ({ item }) => (
    <SentimentPost
      user={item.username}
      content={item.content}
      sentiment={item.sentiment}
      timestamp={item.timestamp}
    />
  );

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
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Post History</Text>

        {/* Filter Buttons */}
        <View style={styles.filterButtonsContainer}>
          {['All', 'Positive', 'Neutral', 'Negative'].map((type) => (
            <TouchableOpacity 
              key={type}
              style={[
                styles.filterButton, 
                { 
                  backgroundColor: filter === type ? colors.primary : `${colors.primary}20`,
                  borderColor: colors.primary
                }
              ]}
              onPress={() => setFilter(type)}
            >
              <Text style={{
                color: filter === type ? '#fff' : colors.primary,
                fontWeight: '600'
              }}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
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
      <FlatList
        data={filteredPosts}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 16,
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
  filterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginVertical: 8,
    paddingHorizontal: 10,
    gap: 8,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
  },
});

export default UserDetailScreen;
