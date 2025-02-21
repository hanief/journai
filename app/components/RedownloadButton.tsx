import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import TranscriptionService from '../services/TranscriptionService';

export default function RedownloadButton() {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleRedownload = async () => {
    Alert.alert(
      'Redownload Model',
      'Are you sure you want to redownload the Whisper model? This may take a while.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Redownload',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDownloading(true);
              await TranscriptionService.getInstance().forceRedownloadModel();
              Alert.alert('Success', 'Model redownloaded successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to redownload model');
              console.error('Error redownloading model:', error);
            } finally {
              setIsDownloading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.actions}>
      <TouchableOpacity
        onPress={handleRedownload}
        style={styles.actionButton}
        disabled={isDownloading}
      >
        {isDownloading ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <FontAwesome name="refresh" size={20} color="#007AFF" />
        )}
      </TouchableOpacity>
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
