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
      <View style={[
        styles.postContainer, 
        isSelected && { 
          backgroundColor: `${colors.primary}10`,
          borderColor: colors.primary,
          borderWidth: 1,
        }
      ]}>
        {selectionMode && (
          <View
            style={[
              styles.selectionIndicator,
              isSelected
                ? { backgroundColor: colors.primary }
                : { 
                    backgroundColor: colors.card, 
                    borderColor: colors.border,
                    borderWidth: 2,
                  },
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
    borderRadius: 24,
    position: "relative",
    paddingLeft: 8,
  },
  selectionIndicator: {
    position: "absolute",
    left: 8,
    top: "50%",
    marginTop: -14,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
})

export default PostItem