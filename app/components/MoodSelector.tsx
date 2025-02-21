import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

type Mood = 'happy' | 'neutral' | 'sad';

interface MoodSelectorProps {
  selectedMood?: Mood;
  onSelectMood: (mood: Mood) => void;
}

const MOOD_ICONS = {
  happy: 'smile-o',
  neutral: 'meh-o',
  sad: 'frown-o',
};

const MOOD_COLORS = {
  happy: '#32C759',
  neutral: '#FF9500',
  sad: '#FF3B30',
};

export default function MoodSelector({
  selectedMood,
  onSelectMood,
}: MoodSelectorProps) {
  return (
    <View style={styles.container}>
      {(Object.keys(MOOD_ICONS) as Mood[]).map((mood) => (
        <TouchableOpacity
          key={mood}
          style={[
            styles.moodButton,
            selectedMood === mood && styles.selectedMoodButton,
            selectedMood === mood && { borderColor: MOOD_COLORS[mood] },
          ]}
          onPress={() => onSelectMood(mood)}
        >
          <FontAwesome
            name={MOOD_ICONS[mood]}
            size={24}
            color={selectedMood === mood ? MOOD_COLORS[mood] : '#666'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  moodButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    backgroundColor: 'white',
  },
  selectedMoodButton: {
    borderWidth: 2,
  },
});
