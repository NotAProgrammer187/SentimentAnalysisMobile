import { View, StyleSheet, TouchableOpacity } from "react-native"
import { Check } from "lucide-react-native"
import SentimentPost from "./SentimentPost"

const PostItem = ({ item, isSelected, colors, handleLongPress, handlePostPress, selectionMode }) => {
  return (
    <TouchableOpacity
      onLongPress={() => handleLongPress(item.id)}
      onPress={() => handlePostPress(item.id)}
      delayLongPress={300}
      activeOpacity={0.7}
    >
      <View style={[styles.postContainer, isSelected && { backgroundColor: `${colors.primary}15` }]}>
        {selectionMode && (
          <View
            style={[
              styles.selectionIndicator,
              isSelected
                ? { backgroundColor: colors.primary, borderColor: colors.primary }
                : { borderColor: colors.border },
            ]}
          >
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
  )
}

const styles = StyleSheet.create({
  postContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    position: "relative",
    paddingLeft: 8,
  },
  selectionIndicator: {
    position: "absolute",
    left: 8,
    top: "50%",
    marginTop: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
})

export default PostItem
