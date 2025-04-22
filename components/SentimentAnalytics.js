import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react-native';

const SentimentAnalytics = ({ posts }) => {
  const { colors } = useTheme();
  const [timeFilter, setTimeFilter] = useState('today'); // 'today', 'week', or 'month'

  const analytics = useMemo(() => {
    if (!posts || posts.length === 0) {
      return {
        positive: 0,
        negative: 0,
        neutral: 0,
        total: 0,
      };
    }

    // Filter posts based on selected time period
    const now = new Date();
    const filteredPosts = posts.filter(post => {
      if (!post.timestamp) return false;
      
      const postDate = new Date(post.timestamp);
      
      if (timeFilter === 'today') {
        // Compare dates without time
        const today = new Date();
        return (
          postDate.getDate() === today.getDate() &&
          postDate.getMonth() === today.getMonth() &&
          postDate.getFullYear() === today.getFullYear()
        );
      } else if (timeFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return postDate >= weekAgo;
      } else if (timeFilter === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return postDate >= monthAgo;
      }
      return true;
    });

    const counts = filteredPosts.reduce(
      (acc, post) => {
        // Check if post and post.sentiment exist and are not null
        if (post && post.sentiment) {
          const sentiment = post.sentiment.toLowerCase();
          if (sentiment === 'positive') {
            acc.positive += 1;
          } else if (sentiment === 'negative') {
            acc.negative += 1;
          } else {
            acc.neutral += 1;
          }
        } else {
          // Handle posts with missing sentiment data
          acc.neutral += 1;
        }
        acc.total += 1;
        return acc;
      },
      { positive: 0, negative: 0, neutral: 0, total: 0 }
    );

    return {
      positive: counts.total > 0 ? Math.round((counts.positive / counts.total) * 100) : 0,
      negative: counts.total > 0 ? Math.round((counts.negative / counts.total) * 100) : 0,
      neutral: counts.total > 0 ? Math.round((counts.neutral / counts.total) * 100) : 0,
      total: counts.total,
    };
  }, [posts, timeFilter]);

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>Sentiment Analytics</Text>
      
      <View style={styles.timeFilterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, timeFilter === 'today' && styles.activeFilterButton]} 
          onPress={() => setTimeFilter('today')}>
          <Text style={[styles.filterText, timeFilter === 'today' && { color: '#fff' }]}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, timeFilter === 'week' && styles.activeFilterButton]} 
          onPress={() => setTimeFilter('week')}>
          <Text style={[styles.filterText, timeFilter === 'week' && { color: '#fff' }]}>Week</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, timeFilter === 'month' && styles.activeFilterButton]} 
          onPress={() => setTimeFilter('month')}>
          <Text style={[styles.filterText, timeFilter === 'month' && { color: '#fff' }]}>Month</Text>
        </TouchableOpacity>
      </View>

      {analytics.total > 0 ? (
        <Text style={[styles.subtitle, { color: `${colors.text}80` }]}>
          Based on {analytics.total} posts
        </Text>
      ) : (
        <Text style={[styles.subtitle, { color: `${colors.text}80` }]}>
          No posts found for this time period
        </Text>
      )}

      {analytics.total > 0 ? (
        <View style={styles.metricsContainer}>
          <View style={styles.metricRow}>
            <View style={styles.labelContainer}>
              <ThumbsUp size={16} color={colors.positive} />
              <Text style={[styles.label, { color: colors.text }]}>Positive</Text>
            </View>
            <View style={styles.progressContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${analytics.positive}%`, backgroundColor: colors.positive }
                ]} 
              />
            </View>
            <Text style={[styles.percentage, { color: colors.positive }]}>
              {analytics.positive}%
            </Text>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.labelContainer}>
              <ThumbsDown size={16} color={colors.negative} />
              <Text style={[styles.label, { color: colors.text }]}>Negative</Text>
            </View>
            <View style={styles.progressContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${analytics.negative}%`, backgroundColor: colors.negative }
                ]} 
              />
            </View>
            <Text style={[styles.percentage, { color: colors.negative }]}>
              {analytics.negative}%
            </Text>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.labelContainer}>
              <Minus size={16} color={colors.neutral} />
              <Text style={[styles.label, { color: colors.text }]}>Neutral</Text>
            </View>
            <View style={styles.progressContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${analytics.neutral}%`, backgroundColor: colors.neutral }
                ]} 
              />
            </View>
            <Text style={[styles.percentage, { color: colors.neutral }]}>
              {analytics.neutral}%
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.emptyStateContainer}>
          <Text style={[styles.emptyStateText, { color: colors.text }]}>
            No sentiment data to display for this time period.
          </Text>
          <Text style={[styles.emptyStateSubText, { color: `${colors.text}80` }]}>
            Try selecting a different time range.
          </Text>
        </View>
      )}

      {analytics.total > 0 && (
        <View style={[styles.summaryContainer, { borderTopColor: colors.border }]}>
          <Text style={[styles.summaryText, { color: colors.text }]}>
            {analytics.positive > analytics.negative && analytics.positive > analytics.neutral
              ? 'Overall sentiment is positive'
              : analytics.negative > analytics.positive && analytics.negative > analytics.neutral
              ? 'Overall sentiment is negative'
              : 'Overall sentiment is neutral'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  timeFilterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#3b82f6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  metricsContainer: {
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 90,
    gap: 6,
  },
  label: {
    fontSize: 14,
  },
  progressContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  percentage: {
    width: 40,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  summaryContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyStateContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default SentimentAnalytics;
