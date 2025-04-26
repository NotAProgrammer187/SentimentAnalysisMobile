import { View, Text, StyleSheet, Image } from "react-native"

const PostCapture = ({ posts, selectedPosts, userName, profileImage, colors }) => {
  // Filter the selected posts
  const postsToCapture = posts.filter((post) => selectedPosts[post.id])

  return (
    <View style={[styles.captureContainer, { backgroundColor: colors.background }]}>
      <View style={styles.captureHeader}>
        <View style={styles.captureUserInfo}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.captureProfileImage} />
          ) : (
            <View style={[styles.captureProfilePlaceholder, { backgroundColor: `${colors.primary}20` }]}>
              <Text style={[styles.captureProfilePlaceholderText, { color: colors.primary }]}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={[styles.captureUsername, { color: colors.text }]}>{userName}</Text>
        </View>
        <Text style={[styles.captureDate, { color: colors.text }]}>{new Date().toLocaleDateString()}</Text>
      </View>

      <View style={[styles.captureDivider, { backgroundColor: colors.border }]} />

      {postsToCapture.map((post) => (
        <View key={post.id} style={styles.capturePost}>
          <Text style={[styles.captureContent, { color: colors.text }]}>{post.content}</Text>
          <View style={styles.capturePostFooter}>
            <Text
              style={[
                styles.captureSentiment,
                {
                  color:
                    post.sentiment?.toLowerCase() === "positive"
                      ? colors.positive
                      : post.sentiment?.toLowerCase() === "negative"
                        ? colors.negative
                        : colors.text,
                },
              ]}
            >
              {post.sentiment}
            </Text>
            <Text style={[styles.captureTimestamp, { color: `${colors.text}80` }]}>
              {new Date(post.timestamp).toLocaleString()}
            </Text>
          </View>
        </View>
      ))}

      <View style={styles.captureFooter}>
        <Text style={[styles.captureFooterText, { color: `${colors.text}60` }]}>Exported from Sentiment App</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  captureContainer: {
    width: 1080,
    padding: 40,
    borderRadius: 16,
    overflow: "hidden",
  },
  captureHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  captureUserInfo: {
    flexDirection: "row",
    alignItems: "center",
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
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  captureProfilePlaceholderText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  captureUsername: {
    fontSize: 24,
    fontWeight: "bold",
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
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  captureContent: {
    fontSize: 20,
    lineHeight: 28,
    marginBottom: 16,
  },
  capturePostFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  captureSentiment: {
    fontSize: 18,
    fontWeight: "600",
  },
  captureTimestamp: {
    fontSize: 16,
  },
  captureFooter: {
    marginTop: 20,
    alignItems: "center",
  },
  captureFooterText: {
    fontSize: 16,
  },
})

export default PostCapture
