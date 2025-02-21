import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface CategorySelectorProps {
  categories: string[];
  selectedCategories: string[];
  onSelectCategory: (category: string) => void;
  onAddCategory?: () => void;
}

const CATEGORY_COLORS: { [key: string]: string } = {
  Personal: '#FF9500',
  Work: '#007AFF',
  Ideas: '#32C759',
  Tasks: '#FF3B30',
  Meeting: '#5856D6',
  default: '#8E8E93',
};

export default function CategorySelector({
  categories,
  selectedCategories,
  onSelectCategory,
  onAddCategory,
}: CategorySelectorProps) {
  const getCategoryColor = (category: string) => {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS.default;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => onSelectCategory(category)}
            style={[
              styles.categoryButton,
              {
                backgroundColor: selectedCategories.includes(category)
                  ? getCategoryColor(category)
                  : 'transparent',
                borderColor: getCategoryColor(category),
              },
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                {
                  color: selectedCategories.includes(category)
                    ? 'white'
                    : getCategoryColor(category),
                },
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
        {onAddCategory && (
          <TouchableOpacity
            onPress={onAddCategory}
            style={[styles.categoryButton, styles.addButton]}
          >
            <FontAwesome name="plus" size={14} color="#666" />
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    borderColor: '#666',
    paddingHorizontal: 12,
  },
});
