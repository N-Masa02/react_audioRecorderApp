import React, { useEffect, useState } from 'react';
import { View, Button, Text, PermissionsAndroid, Platform } from 'react-native';
import AudioRecord from 'react-native-audio-record';
import RNFS from 'react-native-fs';
import Sound from 'react-native-sound';

const App = () => {
  const [recording, setRecording] = useState(false);
  const [audioFile, setAudioFile] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Permission to use microphone',
            message: 'We need your permission to use your microphone to record audio',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setPermissionGranted(true);
        } else {
          console.log('Microphone permission denied');
        }
      } else {
        setPermissionGranted(true);
      }
    };

    requestPermission();

    const options = {
      sampleRate: 16000,  // default 44100
      channels: 1,        // 1 or 2, default 1
      bitsPerSample: 16,  // 8 or 16, default 16
      audioSource: 6,     // android only (see below)
      wavFile: 'test.wav' // default 'audio.wav'
    };

    if (permissionGranted) {
      AudioRecord.init(options);
    }

    return () => {
      if (recording) {
        AudioRecord.stop();
      }
    };
  }, [permissionGranted]);

  const startRecording = () => {
    if (permissionGranted) {
      setRecording(true);
      AudioRecord.start();
    } else {
      console.log('Microphone permission not granted');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    let audioFile = await AudioRecord.stop();
    setAudioFile(audioFile);
    setRecording(false);
    console.log('audioFile', audioFile);
  };

  const playRecording = () => {
    if (audioFile) {
      const sound = new Sound(audioFile, '', (error) => {
        if (error) {
          console.log('failed to load the sound', error);
          return;
        }
        sound.play((success) => {
          if (success) {
            console.log('successfully finished playing');
          } else {
            console.log('playback failed due to audio decoding errors');
          }
        });
      });
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Start Recording" onPress={startRecording} disabled={recording} />
      <Button title="Stop Recording" onPress={stopRecording} disabled={!recording} />
      {audioFile ? <Button title="Play Recording" onPress={playRecording} /> : null}
      {audioFile ? <Text>Audio File: {audioFile}</Text> : null}
    </View>
  );
};

export default App;
