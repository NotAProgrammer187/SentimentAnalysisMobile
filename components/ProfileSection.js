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
      </View>

      <Text style={[styles.profileName, { color: colors.text }]}>{userName}</Text>

      <View style={styles.imageButtonsContainer}>
        <TouchableOpacity style={[styles.imageButton, { backgroundColor: colors.primary }]} onPress={takePhoto}>
          <Camera size={18} color="#fff" />
          <Text style={styles.imageButtonText}>Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.imageButton, { backgroundColor: colors.primary }]} onPress={pickImage}>
          <Upload size={18} color="#fff" />
          <Text style={styles.imageButtonText}>Gallery</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  profileSection: {
    alignItems: "center",
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
    justifyContent: "center",
    alignItems: "center",
  },
  profileImagePlaceholderText: {
    fontSize: 36,
    fontWeight: "bold",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  imageButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  imageButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  imageButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
})

export default ProfileSection
