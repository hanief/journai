import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  Animated,
  Easing,
} from 'react-native';
import { Audio } from 'expo-av';
import { FontAwesome } from '@expo/vector-icons';

interface AudioPlayerProps {
  audioUri: string;
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function AudioPlayer({ audioUri }: AudioPlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [position, setPosition] = useState<number | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const progressAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const loadSound = async () => {
    try {
      setIsLoading(true);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
    } catch (error) {
      console.error('Error loading sound:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSound();
  }, [audioUri]);

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis);
      setPosition(status.positionMillis);
      setIsPlaying(status.isPlaying);

      // Animate progress bar
      const progress = status.positionMillis / status.durationMillis;
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 100,
        useNativeDriver: false,
        easing: Easing.linear,
      }).start();

      if (status.didJustFinish) {
        sound?.setPositionAsync(0);
        setIsPlaying(false);
        progressAnim.setValue(0);
      }
    }
  };

  const togglePlayback = async () => {
    try {
      if (!sound) {
        return;
      }

      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.setRateAsync(playbackSpeed, true);
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const changePlaybackSpeed = async () => {
    try {
      if (!sound) return;

      const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackSpeed);
      const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
      const newSpeed = PLAYBACK_SPEEDS[nextIndex];
      
      await sound.setRateAsync(newSpeed, true);
      setPlaybackSpeed(newSpeed);
    } catch (error) {
      console.error('Error changing playback speed:', error);
    }
  };

  const formatTime = (milliseconds: number | null) => {
    if (!milliseconds) return '0:00';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const seekAudio = async (direction: 'forward' | 'backward') => {
    if (!sound || !position) return;
    
    const seekAmount = 10000; // 10 seconds
    const newPosition = direction === 'forward'
      ? Math.min((position + seekAmount), (duration || 0))
      : Math.max((position - seekAmount), 0);
    
    await sound.setPositionAsync(newPosition);
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={() => seekAudio('backward')}
          style={styles.seekButton}
        >
          <FontAwesome name="backward" size={16} color="#007AFF" />
        </TouchableOpacity>

        <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
          {isLoading ? (
            <FontAwesome name="spinner" size={24} color="#007AFF" />
          ) : (
            <FontAwesome
              name={isPlaying ? 'pause' : 'play'}
              size={24}
              color="#007AFF"
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => seekAudio('forward')}
          style={styles.seekButton}
        >
          <FontAwesome name="forward" size={16} color="#007AFF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={changePlaybackSpeed}
          style={styles.speedButton}
        >
          <Text style={styles.speedText}>{playbackSpeed}x</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>
          {formatTime(position)} / {formatTime(duration)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 12,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  seekButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedButton: {
    marginLeft: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E8E8E8',
  },
  speedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  timeContainer: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
});
