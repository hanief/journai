export interface JournalEntry {
  id: string;
  text: string;
  audioUri?: string;
  createdAt: string;
  lastModifiedAt: string;
  categories: string[];
  mood?: 'happy' | 'neutral' | 'sad';
}

export interface RecordingStats {
  duration: number;
  isRecording: boolean;
  amplitude: number;
}
