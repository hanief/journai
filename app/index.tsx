import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, Stack } from 'expo-router';
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
  Text,
  TouchableOpacity,
  Switch,
  TextInput,
} from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { JournalEntry, RecordingStats } from './types';
import { FontAwesome } from '@expo/vector-icons';
import LoadingSpinner from './components/LoadingSpinner';
import JournalEntryItem from './components/JournalEntryItem';
import SearchBar from './components/SearchBar';
import CategorySelector from './components/CategorySelector';
import RecordingInterface from './components/RecordingInterface';
import TranscriptionService from './services/TranscriptionService';
import RedownloadButton from './components/RedownloadButton';

const DEFAULT_CATEGORIES = ['Personal', 'Work', 'Ideas', 'Tasks', 'Meeting'];

export default function Index() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingStats, setRecordingStats] = useState<RecordingStats>({
    duration: 0,
    isRecording: false,
    amplitude: 0,
  });
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [autoTranscribe, setAutoTranscribe] = useState(true);
  const [highQualityAudio, setHighQualityAudio] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const recordingInterval = useRef<NodeJS.Timeout>();
  const amplitudeInterval = useRef<NodeJS.Timeout>();
  const [isTranscribing, setIsTranscribing] = useState(false);
  const transcriptionService = useRef<TranscriptionService>(TranscriptionService.getInstance());

  useEffect(() => {
    loadEntries();
    loadSettings();
    const initializeTranscription = async () => {
      try {
        await transcriptionService.current.initialize();
      } catch (error) {
        console.error('Failed to initialize transcription service:', error);
      }
    };

    initializeTranscription();
    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
      if (amplitudeInterval.current) {
        clearInterval(amplitudeInterval.current);
      }
    };
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('settings');
      if (settings) {
        const { autoTranscribe, highQualityAudio, categories: savedCategories } = JSON.parse(settings);
        setAutoTranscribe(autoTranscribe);
        setHighQualityAudio(highQualityAudio);
        if (savedCategories) {
          setCategories(savedCategories);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem(
        'settings',
        JSON.stringify({ autoTranscribe, highQualityAudio, categories })
      );
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const loadEntries = async () => {
    setIsLoading(true);
    try {
      const storedEntries = await AsyncStorage.getItem('journalEntries');
      if (storedEntries) {
        setEntries(JSON.parse(storedEntries));
      }
    } catch (error) {
      console.error('Error loading entries:', error);
      Alert.alert('Error', 'Failed to load journal entries');
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        highQualityAudio
          ? Audio.RecordingOptionsPresets.HIGH_QUALITY
          : Audio.RecordingOptionsPresets.LOW_QUALITY
      );
      setRecording(recording);
      setRecordingStats(prev => ({ ...prev, isRecording: true }));

      // Track recording duration
      let startTime = Date.now();
      recordingInterval.current = setInterval(() => {
        const duration = Date.now() - startTime;
        setRecordingStats(prev => ({ ...prev, duration }));
      }, 100);

      // Simulate amplitude changes (in a real app, you'd get this from the recording)
      amplitudeInterval.current = setInterval(() => {
        setRecordingStats(prev => ({
          ...prev,
          amplitude: Math.random(),
        }));
      }, 100);

    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsProcessing(true);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setRecordingStats({
        duration: 0,
        isRecording: false,
        amplitude: 0,
      });

      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
      if (amplitudeInterval.current) {
        clearInterval(amplitudeInterval.current);
      }

      if (uri) {
        setIsTranscribing(true);
        const transcription = await transcriptionService.current.transcribeAudio(uri);
        
        const newEntry: JournalEntry = {
          id: Date.now().toString(),
          text: transcription, //"This is testing transcription",
          audioUri: uri,
          createdAt: new Date().toISOString(),
          lastModifiedAt: new Date().toISOString(),
          categories: selectedCategories,
        };

        setEntries((prevEntries) => [newEntry, ...prevEntries]);
        await AsyncStorage.setItem('journalEntries', JSON.stringify([newEntry, ...entries]));
        setIsTranscribing(false);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    } finally {
      setIsProcessing(false);
    }
  };

  const updateEntry = async (id: string, newText: string) => {
    try {
      const updatedEntries = entries.map(entry =>
        entry.id === id
          ? { ...entry, text: newText, lastModifiedAt: new Date().toISOString() }
          : entry
      );
      setEntries(updatedEntries);
      await AsyncStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
    } catch (error) {
      console.error('Error updating entry:', error);
      Alert.alert('Error', 'Failed to update entry');
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const entryToDelete = entries.find(entry => entry.id === id);
      if (entryToDelete?.audioUri) {
        await FileSystem.deleteAsync(entryToDelete.audioUri);
      }

      const updatedEntries = entries.filter(entry => entry.id !== id);
      setEntries(updatedEntries);
      await AsyncStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
    } catch (error) {
      console.error('Error deleting entry:', error);
      Alert.alert('Error', 'Failed to delete entry');
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim() === '') {
      Alert.alert('Error', 'Category name cannot be empty');
      return;
    }
    if (categories.includes(newCategory.trim())) {
      Alert.alert('Error', 'Category already exists');
      return;
    }
    const updatedCategories = [...categories, newCategory.trim()];
    setCategories(updatedCategories);
    saveSettings();
    setNewCategory('');
    setShowAddCategory(false);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.text
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategories =
      selectedCategories.length === 0 ||
      selectedCategories.some(cat => entry.categories.includes(cat));
    return matchesSearch && matchesCategories;
  });

  const renderItem = useCallback(
    ({ item }: { item: JournalEntry }) => (
      <JournalEntryItem
        entry={item}
        onDelete={deleteEntry}
        onUpdate={updateEntry}
      />
    ),
    [deleteEntry, updateEntry]
  );

  const AddCategoryModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showAddCategory}
      onRequestClose={() => setShowAddCategory(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Category</Text>
          <TextInput
            style={styles.input}
            value={newCategory}
            onChangeText={setNewCategory}
            placeholder="Enter category name"
            autoFocus
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              onPress={() => setShowAddCategory(false)}
              style={[styles.modalButton, styles.cancelButton]}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAddCategory}
              style={[styles.modalButton, styles.addButton]}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const SettingsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showSettings}
      onRequestClose={() => setShowSettings(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Settings</Text>
            <TouchableOpacity
              onPress={() => setShowSettings(false)}
              style={styles.closeButton}
            >
              <FontAwesome name="times" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Auto-transcribe recordings</Text>
            <Switch
              value={autoTranscribe}
              onValueChange={(value) => {
                setAutoTranscribe(value);
                saveSettings();
              }}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>High-quality audio</Text>
            <Switch
              value={highQualityAudio}
              onValueChange={(value) => {
                setHighQualityAudio(value);
                saveSettings();
              }}
            />
          </View>

          <Text style={styles.settingDescription}>
            High-quality audio recordings use more storage space but provide better
            transcription results.
          </Text>
        </View>
      </View>
    </Modal>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'JournAI',
          headerStyle: { backgroundColor: '#FFE5E5' },
          headerTintColor: '#000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerRight: () => (
            <RedownloadButton />
          ),
        }}
      />
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          onClear={() => setSearchQuery('')}
        />
      </View>
      {isTranscribing && (
        <View style={styles.transcribingContainer}>
          <Text style={styles.transcribingText}>Transcribing audio...</Text>
        </View>
      )}
      <FlatList
        data={filteredEntries}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          isLoading ? (
            <LoadingSpinner />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No journal entries yet</Text>
            </View>
          )
        }
      />
      <RecordingInterface
        stats={{
          isRecording: recordingStats.isRecording,
          duration: recordingStats.duration,
          amplitude: 0,
        }}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        disabled={isTranscribing || isProcessing || isLoading}
      />
      
      <SettingsModal />
      <AddCategoryModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 8,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginVertical: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#E5E5E5',
  },
  addButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  transcribingContainer: {
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 8,
  },
  transcribingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
