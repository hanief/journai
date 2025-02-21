# JournAI: Voice Journal with AI Transcription

JournAI is a modern mobile application that transforms your voice recordings into searchable journal entries using advanced AI transcription. Built with React Native and Expo, it offers a seamless journaling experience with features like real-time audio visualization, mood tracking, and category organization.

## 🌟 Features

- **Voice Recording**: High-quality audio recording with visual feedback and duration tracking
- **AI Transcription**: Powered by Whisper.cpp for accurate speech-to-text conversion
- **Rich Journal Entries**: 
  - Audio playback with speed control
  - Text editing capabilities
  - Mood tracking (Happy, Neutral, Sad)
  - Category tagging
- **Smart Organization**:
  - Search through entries
  - Filter by categories
  - Sort by date
- **Modern UI/UX**:
  - Real-time audio visualization
  - Smooth animations
  - Intuitive controls

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (for development)
- Xcode (for iOS development)
- Android Studio (for Android development)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/journai.git
   cd journai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install iOS dependencies:
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. Start the development server:
   ```bash
   npm start
   ```

### Running the App

- For iOS:
  ```bash
  npm run ios
  ```

- For Android:
  ```bash
  npm run android
  ```

## 🛠 Technical Details

### Architecture

The app is built using:
- React Native with Expo
- React Native Reanimated for smooth animations
- Expo AV for audio recording and playback
- AsyncStorage for local data persistence
- Whisper.cpp for AI transcription

### Key Components

- **RecordingInterface**: Handles audio recording with visual feedback
- **AudioPlayer**: Custom audio player with playback speed control
- **JournalEntryItem**: Displays and manages individual journal entries
- **TranscriptionService**: Manages Whisper model and transcription

### File Structure

```
journai/
├── app/
│   ├── components/
│   │   ├── AudioPlayer.tsx
│   │   ├── JournalEntryItem.tsx
│   │   ├── RecordingInterface.tsx
│   │   └── ...
│   ├── services/
│   │   └── TranscriptionService.ts
│   ├── types.ts
│   └── index.tsx
├── assets/
└── ...
```

## 🔧 Troubleshooting

### Common Issues

1. **Whisper Model Download Fails**
   - Check your internet connection
   - Try using the redownload button in the app header
   - Verify device storage has enough space

2. **Audio Recording Issues**
   - Ensure microphone permissions are granted
   - Check audio settings in device settings
   - Try closing other apps using the microphone

3. **App Performance**
   - Clear app cache if experiencing slowdown
   - Ensure device has sufficient free storage
   - Consider removing old journal entries if needed

### Error Messages

- "Failed to initialize transcription service":
  1. Check internet connection
  2. Verify storage permissions
  3. Try redownloading the Whisper model

- "Error recording audio":
  1. Check microphone permissions
  2. Restart the app
  3. Verify no other apps are using the microphone

## 📱 Device Compatibility

- iOS: Version 13.0 or later
- Android: API Level 21 (Android 5.0) or later

## 🔐 Privacy

- All audio processing is done on-device
- No data is sent to external servers
- Journal entries are stored locally on your device

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting guide above
2. Open an issue on GitHub
3. Contact the development team

## 🙏 Acknowledgments

- [Whisper.cpp](https://github.com/ggerganov/whisper.cpp) for the transcription model
- [React Native](https://reactnative.dev/) and [Expo](https://expo.dev/) teams
- All contributors and users