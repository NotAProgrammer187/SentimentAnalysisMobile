import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { X } from "lucide-react-native"

const FilterSection = ({
  colors,
  filterSentiment,
  setFilterSentiment,
  filterDateRange,
  setFilterDateRange,
  hasActiveFilters,
}) => {
  return (
    <View style={[styles.filtersContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <View style={styles.filterTabs}>
        <View style={styles.filterTabSection}>
          <Text style={[styles.filterLabel, { color: colors.text }]}>Sentiment</Text>
          <View style={[styles.filterTabOptions, { borderColor: colors.border }]}>
            <TouchableOpacity
              style={[
                styles.filterTab,
                { borderColor: colors.border },
                filterSentiment === "all" && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => setFilterSentiment("all")}
            >
              <Text style={[styles.filterTabText, { color: filterSentiment === "all" ? "#fff" : colors.text }]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterTab,
                { borderColor: colors.border },
                filterSentiment === "positive" && {
                  backgroundColor: colors.positive,
                  borderColor: colors.positive,
                },
              ]}
              onPress={() => setFilterSentiment("positive")}
            >
              <Text style={[styles.filterTabText, { color: filterSentiment === "positive" ? "#fff" : colors.text }]}>
                Positive
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterTab,
                { borderColor: colors.border },
                filterSentiment === "neutral" && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => setFilterSentiment("neutral")}
            >
              <Text style={[styles.filterTabText, { color: filterSentiment === "neutral" ? "#fff" : colors.text }]}>
                Neutral
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterTab,
                { borderColor: colors.border },
                filterSentiment === "negative" && {
                  backgroundColor: colors.negative,
                  borderColor: colors.negative,
                },
              ]}
              onPress={() => setFilterSentiment("negative")}
            >
              <Text style={[styles.filterTabText, { color: filterSentiment === "negative" ? "#fff" : colors.text }]}>
                Negative
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.filterTabSection}>
          <Text style={[styles.filterLabel, { color: colors.text }]}>Time Period</Text>
          <View style={[styles.filterTabOptions, { borderColor: colors.border }]}>
            <TouchableOpacity
              style={[
                styles.filterTab,
                { borderColor: colors.border },
                filterDateRange === "all" && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => setFilterDateRange("all")}
            >
              <Text style={[styles.filterTabText, { color: filterDateRange === "all" ? "#fff" : colors.text }]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterTab,
                { borderColor: colors.border },
                filterDateRange === "today" && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => setFilterDateRange("today")}
            >
              <Text style={[styles.filterTabText, { color: filterDateRange === "today" ? "#fff" : colors.text }]}>
                Today
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterTab,
                { borderColor: colors.border },
                filterDateRange === "week" && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => setFilterDateRange("week")}
            >
              <Text style={[styles.filterTabText, { color: filterDateRange === "week" ? "#fff" : colors.text }]}>
                Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterTab,
                { borderColor: colors.border },
                filterDateRange === "month" && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => setFilterDateRange("month")}
            >
              <Text style={[styles.filterTabText, { color: filterDateRange === "month" ? "#fff" : colors.text }]}>
                Month
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {hasActiveFilters && (
        <TouchableOpacity
          style={[styles.clearFiltersButton, { borderColor: colors.border }]}
          onPress={() => {
            setFilterSentiment("all")
            setFilterDateRange("all")
          }}
        >
          <X size={14} color={colors.text} />
          <Text style={[styles.clearFiltersText, { color: colors.text }]}>Clear Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  filtersContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  filterTabs: {
    gap: 12,
  },
  filterTabSection: {
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    opacity: 0.8,
  },
  filterTabOptions: {
    flexDirection: "row",
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: "500",
  },
  clearFiltersButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
    gap: 4,
  },
  clearFiltersText: {
    fontSize: 12,
    fontWeight: "500",
  },
})

export default FilterSection
