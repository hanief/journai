import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { JournalEntry } from '../types';
import AudioPlayer from './AudioPlayer';
import MoodSelector from './MoodSelector';

interface JournalEntryItemProps {
  entry: JournalEntry;
  onDelete: (id: string) => void;
  onUpdate: (id: string, newText: string, newMood?: 'happy' | 'neutral' | 'sad') => void;
}

export default function JournalEntryItem({
  entry,
  onDelete,
  onUpdate,
}: JournalEntryItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(entry.text);
  const [selectedMood, setSelectedMood] = useState(entry.mood);

  const handleSave = () => {
    if (editedText.trim() === '') {
      Alert.alert('Error', 'Journal entry cannot be empty');
      return;
    }
    onUpdate(entry.id, editedText, selectedMood);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedText(entry.text);
    setSelectedMood(entry.mood);
    setIsEditing(false);
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => onDelete(entry.id), style: 'destructive' },
      ]
    );
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <Text style={styles.date}>{formatDate(entry.createdAt)}</Text>
          {entry.lastModifiedAt !== entry.createdAt && (
            <Text style={styles.editedText}>
              (edited {formatDate(entry.lastModifiedAt)})
            </Text>
          )}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => setIsEditing(!isEditing)}
            style={styles.actionButton}
          >
            <FontAwesome
              name={isEditing ? 'check' : 'pencil'}
              size={20}
              color="#007AFF"
              onPress={isEditing ? handleSave : undefined}
            />
          </TouchableOpacity>
          {isEditing && (
            <TouchableOpacity onPress={handleCancel} style={styles.actionButton}>
              <FontAwesome name="times" size={20} color="#666" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={confirmDelete} style={styles.actionButton}>
            <FontAwesome name="trash-o" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.input}
            value={editedText}
            onChangeText={setEditedText}
            multiline
            autoFocus
          />
          <MoodSelector
            selectedMood={selectedMood}
            onSelectMood={setSelectedMood}
          />
        </View>
      ) : (
        <View>
          <Text style={styles.text}>{entry.text}</Text>
          {entry.mood && (
            <View style={styles.moodContainer}>
              <FontAwesome
                name={
                  entry.mood === 'happy'
                    ? 'smile-o'
                    : entry.mood === 'sad'
                    ? 'frown-o'
                    : 'meh-o'
                }
                size={20}
                color={
                  entry.mood === 'happy'
                    ? '#32C759'
                    : entry.mood === 'sad'
                    ? '#FF3B30'
                    : '#FF9500'
                }
              />
            </View>
          )}
        </View>
      )}

      {entry.audioUri && <AudioPlayer audioUri={entry.audioUri} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateContainer: {
    flex: 1,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  editedText: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  text: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 12,
  },
  editContainer: {
    marginBottom: 12,
  },
  input: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    minHeight: 100,
    marginBottom: 12,
  },
  moodContainer: {
    marginBottom: 12,
  },
});
