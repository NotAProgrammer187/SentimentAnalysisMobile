import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react-native';
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

  const getSentimentIcon = () => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return <ThumbsUp size={20} color={getSentimentColor()} />;
      case 'negative':
        return <ThumbsDown size={20} color={getSentimentColor()} />;
      default:
        return <Minus size={20} color={getSentimentColor()} />;
    }
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
      return timestamp; // Return the original timestamp if parsing fails
    }
  };

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderLeftColor: getSentimentColor(),
          borderLeftWidth: 4,
        }
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.username, { color: colors.text }]}>{user}</Text>
        <Text style={[styles.timestamp, { color: `${colors.text}80` }]}> • {formatTimestamp(timestamp)}</Text>
      </View>
      
      <View style={styles.sentimentRow}>
        <View style={[styles.sentimentContainer, { backgroundColor: `${getSentimentColor()}15` }]}>
          {getSentimentIcon()}
          <Text style={[styles.sentiment, { color: getSentimentColor(), fontSize: 16 }]}>
            {sentiment}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.content, { color: `${colors.text}90` }]}>
        {content}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  username: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
  },
  sentimentRow: {
    marginBottom: 12,
  },
  sentimentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 8,
  },
  sentiment: {
    fontWeight: '600',
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default SentimentPost;
