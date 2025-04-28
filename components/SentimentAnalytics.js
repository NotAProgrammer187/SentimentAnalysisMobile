import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ThumbsUp, ThumbsDown, Minus, ChevronDown, ChevronUp } from 'lucide-react-native';

const SentimentAnalytics = ({ posts }) => {
  const { colors, isDarkMode } = useTheme();
  const [timeFilter, setTimeFilter] = useState('today');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const analytics = useMemo(() => {
    if (!posts || posts.length === 0) {
      return { positive: 0, negative: 0, neutral: 0, total: 0 };
    }

    const now = new Date();
    const filteredPosts = posts.filter(post => {
      if (!post.timestamp) return false;
      const postDate = new Date(post.timestamp);

      if (timeFilter === 'today') {
        return (
          postDate.getDate() === now.getDate() &&
          postDate.getMonth() === now.getMonth() &&
          postDate.getFullYear() === now.getFullYear()
        );
      } else if (timeFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return postDate >= weekAgo;
      } else if (timeFilter === 'month') {
        return (
          postDate.getMonth() === selectedMonth &&
          postDate.getFullYear() === now.getFullYear()
        );
      }

      return true;
    });

    const counts = filteredPosts.reduce(
      (acc, post) => {
        if (post && post.sentiment) {
          const sentiment = post.sentiment.toLowerCase();
          if (sentiment === 'positive') acc.positive += 1;
          else if (sentiment === 'negative') acc.negative += 1;
          else acc.neutral += 1;
        } else {
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
  }, [posts, timeFilter, selectedMonth]);

  return (
    <View>
      <TouchableOpacity
        style={[styles.toggleButton, { backgroundColor: colors.primary }]}
        onPress={() => setShowAnalytics(prev => !prev)}
      >
        <Text style={styles.toggleButtonText}>
          {showAnalytics ? 'Hide Sentiment Analytics' : 'Show Sentiment Analytics'}
        </Text>
        {showAnalytics ? (
          <ChevronUp size={20} color="#fff" />
        ) : (
          <ChevronDown size={20} color="#fff" />
        )}
      </TouchableOpacity>

      {showAnalytics && (
        <View style={[styles.container, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Sentiment Analytics</Text>
            <Text style={[styles.subtitle, { color: `${colors.text}80` }]}>
              {analytics.total > 0 
                ? `Based on ${analytics.total} posts`
                : 'No posts found for this time period'
              }
            </Text>
          </View>

          <View style={styles.timeFilterContainer}>
            {['today', 'week', 'month'].map((filter) => (
              <TouchableOpacity 
                key={filter}
                style={[
                  styles.filterButton, 
                  timeFilter === filter && { 
                    backgroundColor: colors.primary,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  }
                ]} 
                onPress={() => setTimeFilter(filter)}
              >
                <Text style={[
                  styles.filterText, 
                  { color: timeFilter === filter ? '#fff' : colors.text }
                ]}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {timeFilter === 'month' && (
            <View style={styles.monthSelector}>
              <Text style={[styles.monthSelectorTitle, { color: colors.text }]}>
                Select Month:
              </Text>
              <View style={styles.monthGrid}>
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((monthName, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.monthButton,
                      { 
                        backgroundColor: selectedMonth === index ? colors.primary : colors.card,
                        borderColor: selectedMonth === index ? colors.primary : colors.border,
                      }
                    ]}
                    onPress={() => setSelectedMonth(index)}
                  >
                    <Text style={[
                      styles.monthButtonText, 
                      { color: selectedMonth === index ? '#fff' : colors.text }
                    ]}>
                      {monthName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {analytics.total > 0 ? (
            <View style={styles.metricsContainer}>
              {[
                { type: 'positive', icon: ThumbsUp, value: analytics.positive },
                { type: 'negative', icon: ThumbsDown, value: analytics.negative },
                { type: 'neutral', icon: Minus, value: analytics.neutral }
              ].map(({ type, icon: Icon, value }) => (
                <View key={type} style={styles.metricCard}>
                  <View style={[styles.metricIconContainer, { backgroundColor: `${colors[type]}20` }]}>
                    <Icon size={24} color={colors[type]} />
                  </View>
                  <Text style={[styles.metricValue, { color: colors.text }]}>
                    {value}%
                  </Text>
                  <Text style={[styles.metricLabel, { color: `${colors.text}80` }]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                  <View style={[styles.progressBarContainer, { backgroundColor: `${colors[type]}10` }]}>
                    <View 
                      style={[
                        styles.progressBar, 
                        { width: `${value}%`, backgroundColor: colors[type] }
                      ]} 
                    />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={[styles.emptyStateText, { color: colors.text }]}>
                No sentiment data to display
              </Text>
              <Text style={[styles.emptyStateSubText, { color: `${colors.text}60` }]}>
                Try selecting a different time range.
              </Text>
            </View>
          )}

          {analytics.total > 0 && (
            <View style={[styles.summaryContainer, { backgroundColor: `${colors.primary}10` }]}>
              <Text style={[styles.summaryText, { color: colors.primary }]}>
                {analytics.positive > analytics.negative && analytics.positive > analytics.neutral
                  ? 'Overall sentiment is positive'
                  : analytics.negative > analytics.positive && analytics.negative > analytics.neutral
                  ? 'Overall sentiment is negative'
                  : 'Overall sentiment is neutral'}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  toggleButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  toggleButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  timeFilterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  monthSelector: {
    marginBottom: 20,
  },
  monthSelectorTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  monthButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  monthButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  summaryContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyStateContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 14,
  },
});

export default SentimentAnalytics;