import { View, Text, StyleSheet, Modal, SafeAreaView, TouchableOpacity, Image, StatusBar } from "react-native"
import { X, Save } from "lucide-react-native"

const PreviewModal = ({ showPreview, setShowPreview, previewImageUri, savePreviewToLibrary, colors }) => {
  return (
    <Modal visible={showPreview} animationType="slide" transparent={false} onRequestClose={() => setShowPreview(false)}>
      <SafeAreaView style={[styles.previewContainer, { backgroundColor: colors.background }]}>
        <View style={styles.previewHeader}>
          <Text style={[styles.previewTitle, { color: colors.text }]}>Image Preview</Text>
          <TouchableOpacity onPress={() => setShowPreview(false)} style={styles.previewCloseButton}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.previewImageContainer}>
          {previewImageUri ? (
            <Image source={{ uri: previewImageUri }} style={styles.previewImage} resizeMode="contain" />
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
            style={[
              styles.previewButton,
              { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.border },
            ]}
            onPress={() => setShowPreview(false)}
          >
            <X size={20} color={colors.text} />
            <Text style={[styles.previewButtonText, { color: colors.text }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  previewContainer: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  previewCloseButton: {
    padding: 8,
  },
  previewImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  previewActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    gap: 12,
  },
  previewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    gap: 8,
  },
  previewButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 16,
  },
})

export default PreviewModal
