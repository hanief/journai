import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  style?: ViewStyle;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChangeText,
  onClear,
  style,
  placeholder = 'Search journal entries...',
}: SearchBarProps) {
  return (
    <View style={[styles.container, style]}>
      <FontAwesome name="search" size={16} color="#666" style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        clearButtonMode="never"
      />
      {value !== '' && (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <FontAwesome name="times-circle" size={16} color="#666" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
});
