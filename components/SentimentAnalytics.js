import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react-native';

const SentimentAnalytics = ({ posts }) => {
  const { colors } = useTheme();

  const analytics = useMemo(() => {
    if (!posts || posts.length === 0) {
      return {
        positive: 0,
        negative: 0,
        neutral: 0,
        total: 0,
      };
    }

    const counts = posts.reduce(
      (acc, post) => {
        const sentiment = post.sentiment.toLowerCase();
        if (sentiment === 'positive') {
          acc.positive += 1;
        } else if (sentiment === 'negative') {
          acc.negative += 1;
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
  }, [posts]);

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>Sentiment Analytics</Text>
      <Text style={[styles.subtitle, { color: `${colors.text}80` }]}>
        Based on {analytics.total} posts
      </Text>

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

      <View style={[styles.summaryContainer, { borderTopColor: colors.border }]}>
        <Text style={[styles.summaryText, { color: colors.text }]}>
          {analytics.positive > analytics.negative && analytics.positive > analytics.neutral
            ? 'Overall sentiment is positive'
            : analytics.negative > analytics.positive && analytics.negative > analytics.neutral
            ? 'Overall sentiment is negative'
            : 'Overall sentiment is neutral'}
        </Text>
      </View>
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
    marginBottom: 4,
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
});

export default SentimentAnalytics;
