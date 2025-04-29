import * as FileSystem from "expo-file-system"
import { Alert } from "react-native"

const userImagesDir = FileSystem.documentDirectory + "userImages/"
const exportsDir = FileSystem.documentDirectory + "exports/"

// Ensure the directories exist
const setupDirectories = async () => {
  try {
    // Check and create user images directory
    const imageDirInfo = await FileSystem.getInfoAsync(userImagesDir)
    if (!imageDirInfo.exists) {
      console.log("Creating user images directory...")
      await FileSystem.makeDirectoryAsync(userImagesDir, { intermediates: true })
    }

    // Check and create exports directory
    const exportsDirInfo = await FileSystem.getInfoAsync(exportsDir)
    if (!exportsDirInfo.exists) {
      console.log("Creating exports directory...")
      await FileSystem.makeDirectoryAsync(exportsDir, { intermediates: true })
    }

    return true
  } catch (error) {
    console.error("Error setting up directories:", error)
    Alert.alert("Storage Error", "Failed to set up storage directories. Please check app permissions.")
    return false
  }
}
