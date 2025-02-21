import { initWhisper } from 'whisper.rn';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MODEL_STORAGE_KEY = '@whisper_model_path';
const MODEL_VERSION = 'ggml-base.en';
const MODEL_URL = `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/${MODEL_VERSION}.bin`
const MODEL_FILENAME = `${MODEL_VERSION}.bin`;

class TranscriptionService {
  private static instance: TranscriptionService;
  private whisperContext: any = null;
  private modelPath: string | null = null;

  private constructor() {}

  public static getInstance(): TranscriptionService {
    if (!TranscriptionService.instance) {
      TranscriptionService.instance = new TranscriptionService();
    }
    return TranscriptionService.instance;
  }

  private async downloadModel(): Promise<string> {
    const modelDir = `${FileSystem.documentDirectory}whisper/`;
    const modelPath = `${modelDir}${MODEL_FILENAME}`;

    try {
      // Create directory if it doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(modelDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(modelDir, { intermediates: true });
      }

      // Check if model already exists
      const modelInfo = await FileSystem.getInfoAsync(modelPath);
      if (!modelInfo.exists) {
        console.log('Downloading Whisper model...');
        await FileSystem.downloadAsync(MODEL_URL, modelPath);
        console.log('Model downloaded successfully');
      }

      return modelPath;
    } catch (error) {
      console.error('Error downloading model:', error);
      throw error;
    }
  }

  public async forceRedownloadModel(): Promise<void> {
    try {
      // Reset whisper context
      this.whisperContext = null;
      
      // Delete existing model if it exists
      if (this.modelPath) {
        const modelInfo = await FileSystem.getInfoAsync(this.modelPath);
        if (modelInfo.exists) {
          await FileSystem.deleteAsync(this.modelPath);
        }
        this.modelPath = null;
        await AsyncStorage.removeItem(MODEL_STORAGE_KEY);
      }

      // Download and initialize new model
      await this.initialize();
    } catch (error) {
      console.error('Error redownloading model:', error);
      throw error;
    }
  }

  public async initialize(): Promise<void> {
    try {
      // Check if we have a cached model path
      this.modelPath = await AsyncStorage.getItem(MODEL_STORAGE_KEY);

      if (!this.modelPath) {
        // Download the model if we don't have it
        this.modelPath = await this.downloadModel();
        await AsyncStorage.setItem(MODEL_STORAGE_KEY, this.modelPath);
      }

      // Initialize Whisper
      this.whisperContext = await initWhisper({
        filePath: this.modelPath,
      });

      console.log('Whisper initialized successfully');
    } catch (error) {
      console.error('Error initializing Whisper:', error);
      throw error;
    }
  }

  public async transcribeAudio(audioPath: string): Promise<string> {
    if (!this.whisperContext) {
      throw new Error('Whisper not initialized');
    }

    try {
      console.log('Starting transcription...');
      const { promise } = this.whisperContext.transcribe(audioPath, {
        language: 'en',
        translate: false,
      });

      const { result } = await promise;
      console.log('Transcription completed');
      return result;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw error;
    }
  }

  public async transcribeRealtime(
    onTranscriptionUpdate: (text: string) => void,
    onError: (error: any) => void
  ): Promise<() => void> {
    if (!this.whisperContext) {
      throw new Error('Whisper not initialized');
    }

    try {
      const { stop, subscribe } = await this.whisperContext.transcribeRealtime({
        language: 'en',
        translate: false,
      });

      subscribe((event: any) => {
        const { isCapturing, data, error } = event;
        if (error) {
          onError(error);
          return;
        }

        if (data?.result) {
          onTranscriptionUpdate(data.result);
        }

        if (!isCapturing) {
          console.log('Realtime transcription finished');
        }
      });

      return stop;
    } catch (error) {
      console.error('Error in realtime transcription:', error);
      throw error;
    }
  }
}

export default TranscriptionService;
