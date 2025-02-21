import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface HeaderProps {
  title: string;
  onSettingsPress?: () => void;
}

export default function Header({ title, onSettingsPress }: HeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {onSettingsPress && (
        <TouchableOpacity onPress={onSettingsPress} style={styles.button}>
          <FontAwesome name="cog" size={24} color="#333" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  button: {
    padding: 8,
  },
});
