import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface RecordingInterfaceProps {
  stats: {
    isRecording: boolean;
    duration: number;
    amplitude: number;
  };
  onStartRecording: () => void;
  onStopRecording: () => void;
  disabled?: boolean;
}

const NUM_WAVES = 5;
const WAVE_HEIGHT = 40;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function RecordingInterface({
  stats,
  onStartRecording,
  onStopRecording,
  disabled = false,
}: RecordingInterfaceProps) {
  const pulseScale = useSharedValue(1);
  const [formattedDuration, setFormattedDuration] = useState('00:00');
  const waveAnimations = Array.from({ length: NUM_WAVES }, () => useSharedValue(1));

  useEffect(() => {
    if (stats.isRecording) {
      // Start pulse animation
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.2, {
            duration: 500,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, {
            duration: 500,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        true
      );

      // Animate each wave with a different delay
      waveAnimations.forEach((wave, index) => {
        wave.value = withRepeat(
          withSequence(
            withDelay(
              index * 400,
              withTiming(1.4, {
                duration: 1000,
                easing: Easing.inOut(Easing.ease),
              })
            ),
            withTiming(1, {
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
            })
          ),
          -1,
          true
        );
      });
    } else {
      // Reset animations when not recording
      pulseScale.value = withTiming(1);
      waveAnimations.forEach((wave) => {
        wave.value = withTiming(1);
      });
    }
  }, [stats.isRecording]);

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    setFormattedDuration(formatDuration(stats.duration));
  }, [stats.duration]);

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
    };
  });

  return (
    <View style={styles.container}>
      {stats.isRecording && (
        <View style={styles.durationContainer}>
          <Text style={styles.durationText}>{formattedDuration}</Text>
        </View>
      )}
      <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
        <TouchableOpacity
          style={[
            styles.button,
            stats.isRecording ? styles.recordingButton : styles.notRecordingButton,
            disabled && styles.disabledButton,
          ]}
          onPress={stats.isRecording ? onStopRecording : onStartRecording}
          disabled={disabled}
        >
          <FontAwesome
            name={stats.isRecording ? 'stop' : 'microphone'}
            size={32}
            color={disabled ? '#999' : stats.isRecording ? '#FF3B30' : '#007AFF'}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 20,
    height: 150,
    color: 'transparent',
  },
  waveContainer: {
    position: 'absolute',
    top: 60,
    alignItems: 'center',
    justifyContent: 'center',
    width: SCREEN_WIDTH,
    height: WAVE_HEIGHT * 2,
  },
  wave: {
    position: 'absolute',
    width: 4,
    height: WAVE_HEIGHT,
    backgroundColor: '#007AFF',
    borderRadius: 2,
    marginHorizontal: 4,
  },
  buttonContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  notRecordingButton: {
    backgroundColor: '#FFF',
  },
  recordingButton: {
    backgroundColor: '#FFE5E5',
  },
  disabledButton: {
    backgroundColor: '#E5E5E5',
  },
  durationContainer: {
    position: 'absolute',
    top: 20,
    paddingVertical: 8,
  },
  durationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
