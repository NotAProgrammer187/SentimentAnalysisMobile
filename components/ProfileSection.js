import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native"
import { Camera, Upload } from "lucide-react-native"

const ProfileSection = ({ userName, profileImage, colors, takePhoto, pickImage }) => {
  return (
    <View style={styles.profileSection}>
      <View style={styles.profileImageContainer}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <View style={[styles.profileImagePlaceholder, { backgroundColor: `${colors.primary}20` }]}>
            <Text style={[styles.profileImagePlaceholderText, { color: colors.primary }]}>
              {userName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={[styles.profileImageOverlay, { backgroundColor: `${colors.primary}10` }]} />
      </View>

      <Text style={[styles.profileName, { color: colors.text }]}>{userName}</Text>
      <Text style={[styles.profileSubtext, { color: `${colors.text}80` }]}>
        User Profile
      </Text>

      <View style={styles.imageButtonsContainer}>
        <TouchableOpacity 
          style={[styles.imageButton, { backgroundColor: colors.primary }]} 
          onPress={takePhoto}
        >
          <Camera size={20} color="#fff" />
          <Text style={styles.imageButtonText}>Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.imageButton, { backgroundColor: colors.primary }]} 
          onPress={pickImage}
        >
          <Upload size={20} color="#fff" />
          <Text style={styles.imageButtonText}>Gallery</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  profileSection: {
    alignItems: "center",
    padding: 24,
    paddingTop: 32,
  },
  profileImageContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'white',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: 'white',
  },
  profileImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  profileImagePlaceholderText: {
    fontSize: 42,
    fontWeight: "bold",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  profileSubtext: {
    fontSize: 16,
    marginBottom: 24,
  },
  imageButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  imageButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  imageButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
})

export default ProfileSection