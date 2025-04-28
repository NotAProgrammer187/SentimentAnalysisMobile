import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

const SentimentPost = ({ user, content, sentiment, timestamp }) => {
  const { colors } = useTheme();
  
  const getSentimentColor = () => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return colors.positive;
      case 'negative':
        return colors.negative;
      default:
        return colors.neutral;
    }
  };

  const getSentimentBadge = () => {
    const color = getSentimentColor();
    return (
      <View style={[styles.sentimentBadge, { backgroundColor: `${color}15` }]}>
        <View style={[styles.sentimentDot, { backgroundColor: color }]} />
        <Text style={[styles.sentimentText, { color: color }]}>
          {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
        </Text>
      </View>
    );
  };

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return timestamp;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, { backgroundColor: colors.background }]}>
            <Text style={[styles.avatarText, { color: colors.subtext }]}>
              {user.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={[styles.username, { color: colors.text }]}>{user}</Text>
            <Text style={[styles.timestamp, { color: colors.subtext }]}>
              {formatTimestamp(timestamp)}
            </Text>
          </View>
        </View>
        {getSentimentBadge()}
      </View>
      
      <View style={styles.contentContainer}>
        <MessageCircle size={16} color={colors.subtext} style={styles.contentIcon} />
        <Text style={[styles.content, { color: colors.text }]}>
          {content}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 13,
  },
  sentimentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  sentimentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sentimentText: {
    fontSize: 13,
    fontWeight: '600',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  contentIcon: {
    marginRight: 12,
    marginTop: 3,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
});

export default SentimentPost;