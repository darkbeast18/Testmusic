'use client';

import { useState, useRef, useEffect } from 'react';

import {
  CheckCircle,
  Loader2,
  Music,
  Upload,
  XCircle,
  Mic,
  Square,
} from 'lucide-react';

// You'll need to install this package: npm install lamejs
// Add to your dependencies
// @ts-ignore
import Head from 'next/head';

import { motion } from 'framer-motion';

import component1 from '../app/search1';

import Search1 from '../app/search1';

import Image from '../app/namem2.jpg';

import Animation from '../app/animation';

import Result from '../app/result';

function generateSearchLink(
  platform: string,
  songName: string,
  artistName: string = ''
) {
  const query = encodeURIComponent(`${songName} ${artistName}`);

  switch (platform) {
    case 'gaana':
      return `https://gaana.com/search/${encodeURIComponent(songName)}`;
    case 'amazon':
      return `https://music.amazon.com/search/${query}`;
    case 'apple':
      return `https://music.apple.com/us/search?term=${encodeURIComponent(
        songName
      )}`;
    case 'jiosaavn':
      return `https://www.google.com/search?q=${query}+site:jiosaavn.com`;
    case 'wynk':
      return `https://www.google.com/search?q=${query}+site:wynk.in`;
    default:
      return '#';
  }
}
const platforms = [
  { name: "Spotify", icon: "spotify" },
  { name: "YouTube", icon: "youtube" },
  { name: "Deezer", icon: "deezer" },
  { name: "Apple Music", icon: "apple" },
  { name: "Amazon", icon: "amazon" },
  { name: "Gaana", icon: "gaana" },
  { name: "JioSaavan", icon: "jiosaavan" },
  { name: "Wynk", icon: "wynk" }
];

function SongLinks({
  songName,
  artistName,
}: {
  songName: string;
  artistName: string;
}) {
  const platforms = ['gaana', 'amazon', 'apple', 'jiosaavn', 'wynk'];

  return (
    <div className="flex flex-wrap gap-3 mt-4">
      {platforms.map((platform) => (
        <a
          key={platform}
          href={generateSearchLink(platform, songName, artistName)}
          target="_blank"
          rel="noopener noreferrer"
          className=" bg-black text-white rounded-md capitalize px-4 py-2 hover:bg-blue-900 transition-colors"
        >
          Open in {platform}
        </a>
      ))}
    </div>
  );
}
export default function AudioRecognition() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [conversionStatus, setConversionStatus] = useState('');
  const [isConverting, setIsConverting] = useState(false);

  // Refs for recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load lamejs from CDN as it's not directly importable in browser
  useEffect(() => {
    // This is optional but could be used to load external libraries
    // if you can't use import statements
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setAudioURL(null);
      setError('');
      setSuccess(false);
    }
  };

  // Helper function to write strings to DataView
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // Convert audio blob to WAV format
  const convertToWav = async (audioBlob: Blob): Promise<File> => {
    setIsConverting(true);
    setConversionStatus('Converting audio to WAV format...');

    return new Promise(async (resolve, reject) => {
      try {
        // First, convert blob to array buffer
        const arrayBuffer = await audioBlob.arrayBuffer();

        // Decode the WebM audio
        const audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // WAV file format settings
        const numOfChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const bitsPerSample = 16; // Using 16-bit depth
        const bytesPerSample = bitsPerSample / 8;

        // Calculate sizes for WAV header and data
        const dataLength = audioBuffer.length * numOfChannels * bytesPerSample;
        const bufferLength = 44 + dataLength; // 44 bytes for WAV header

        // Create buffer for the WAV file
        const wavBuffer = new ArrayBuffer(bufferLength);
        const view = new DataView(wavBuffer);

        // Write WAV header
        // "RIFF" chunk descriptor
        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + dataLength, true); // File size - 8
        writeString(view, 8, 'WAVE');

        // "fmt " sub-chunk
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true); // Sub-chunk size (16 for PCM)
        view.setUint16(20, 1, true); // Audio format (1 for PCM)
        view.setUint16(22, numOfChannels, true); // Number of channels
        view.setUint32(24, sampleRate, true); // Sample rate
        view.setUint32(
          28,
          sampleRate * numOfChannels * bytesPerSample,
          true
        ); // Byte rate
        view.setUint16(32, numOfChannels * bytesPerSample, true); // Block align
        view.setUint16(34, bitsPerSample, true); // Bits per sample

        // "data" sub-chunk
        writeString(view, 36, 'data');
        view.setUint32(40, dataLength, true); // Sub-chunk size

        // Write audio data
        let offset = 44; // Start writing after the header

        // Get audio data for each channel
        for (let i = 0; i < audioBuffer.length; i++) {
          for (let channel = 0; channel < numOfChannels; channel++) {
            const sample = Math.max(
              -1,
              Math.min(1, audioBuffer.getChannelData(channel)[i])
            );
            // Convert float to 16-bit PCM
            const value = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
            view.setInt16(offset, value, true);
            offset += bytesPerSample;
          }
        }

        // Create a blob from the WAV data
        const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });

        // Create a file from the blob
        const wavFile = new File([wavBlob], 'recorded-audio.wav', {
          type: 'audio/wav',
          lastModified: Date.now(),
        });

        setConversionStatus('Conversion complete!');
        setIsConverting(false);
        resolve(wavFile);
      } catch (error) {
        console.error('Error converting to WAV:', error);
        setConversionStatus('');
        setIsConverting(false);
        setError(
          'Failed to convert audio to WAV format. Please upload a WAV file instead.'
        );
        reject(error);
      }
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType,
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);

        try {
          // Convert WebM to WAV
          const wavFile = await convertToWav(audioBlob);
          setFile(wavFile);
          console.log('Converted file:', wavFile);
          console.log('File type:', wavFile.type);
          console.log('File size:', wavFile.size);
        } catch (error) {
          console.error('Conversion failed:', error);
        }

        // Stop all tracks from the stream
        stream.getTracks().forEach((track) => track.stop());
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      // Start timer to track recording duration
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Clear the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Please select or record an audio file');
      return;
    }

    console.log('Submitting file:', file);
    console.log('File type:', file.type);
    console.log('File size:', file.size);

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('audioFile', file);

      const response = await fetch(
        'https://shazam-api-audio-recognition-for-songs-music-metadata.p.rapidapi.com/detect_audio_by_post',
        {
          method: 'POST',
          headers: {
            'x-rapidapi-key':
              '2fae8c19fbmshc1c101ed553203fp180b67jsnd96198bf2fe4',
            'x-rapidapi-host':
              'shazam-api-audio-recognition-for-songs-music-metadata.p.rapidapi.com',
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to detect song');
      }

      const data = await response.json();
      setResult(data);
      setSuccess(true);
    } catch (err) {
      setError('Error detecting song. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black h-screen">
      <Search1 />
      <div className="text-white pl-[160px] text-4xl font-bold flex flex-row items-center gap-2">
        <h1 className="text-white text-4xl font-bold pr-[300px]">
          Name Songs in
          <br />
          <span className="mt-1 block">seconds</span>
        </h1>
        <img src={Image.src} alt="Meditation" className="w-[400px] h-[230px]" />
      </div>

      {/* Upload & Record Section */}
      <div className="p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* File Upload Section */}
          <div className="flex-1">
            <div className="border rounded-md p-6 flex flex-col items-center justify-center gap-2 ">
              <label
                htmlFor="audio-upload"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                {file && !isRecording && !audioURL ? (
                  <div className="text-white flex items-center space-x-2">
                    <CheckCircle className="h-6 w-6" />
                    <p className="text-sm">File Selected: {file.name}</p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-white" />
                    <p className="text-sm text-white">
                      Drag and drop an audio file here, or click to select a
                      file
                    </p>
                  </>
                )}
                <input
                  type="file"
                  id="audio-upload"
                  accept="audio/wav,audio/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Record Section */}
          <div className="flex-1">
            <div className="border rounded-md p-4 flex flex-col items-center justify-center gap-2">
              <div className="text-center mb-2">
                <p className="font-medium text-white">
                  Recognise through live audio recording
                </p>
              </div>

              <div className="flex items-center gap-4">
                {isRecording ? (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <Square className="h-6 w-6" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors"
                  >
                    <Mic className="h-6 w-6" />
                  </button>
                )}

                <div className="text-center">
                  {isRecording ? (
                    <div className="flex flex-col items-center">
                      <div className="text-white font-bold animate-pulse">
                        Recording...
                      </div>
                      <div className="text-white">{formatTime(recordingDuration)}</div>
                    </div>
                  ) : audioURL ? (
                    <div className="flex flex-col items-center">
                      <span className="text-white flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" /> Recording saved
                      </span>
                      {conversionStatus && (
                        <span className="text-blue-500 text-sm">
                          {conversionStatus}
                        </span>
                      )}
                      <audio controls src={audioURL} className="mt-2 w-full max-w-xs  " />
                    </div>
                  ) : (
                    <span className="text-white">Click to start recording</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detect Song Button */}
        <form onSubmit={handleSubmit}>
          <button
            type="submit"
            disabled={!file || loading || isConverting}
            className="w-full bg-blue-500 text-white px-4 py-3 rounded-md  disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                {/* <Loader2 className="h-4 w-4 animate-spin" />
                Processing... */}
                <Animation />
              </>
            ) : isConverting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {conversionStatus}
              </>
            ) : (
              <>
                <Music className="h-4 w-4" />
                Detect Song
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error message */}
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <XCircle className="h-6 w-6" />
          </span>
        </div>
      )}

      {/* Detected Song Details */}
      {success && result && result.result && (
  <div className="bg-gray-900 text-gray-100 p-4 h-[100svh] w-[100svw]">
    <div className="max-w-screen-xl mx-auto">
      <div className="flex items-center space-x-2 mb-6 opacity-80">
        <CheckCircle className="h-5 w-5 text-green-400" />
        <p className="text-sm font-medium text-green-400">Song Detected</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          {result.result.images?.coverarthq ? (
            <img
              src={result.result.images.coverarthq}
              alt={result.result.title || "Song cover"}
              className="w-full aspect-square object-cover rounded-md shadow-lg"
            />
          ) : (
            <div className="w-full aspect-square bg-gray-800 rounded-md flex items-center justify-center">
              <span className="text-gray-500">No cover art</span>
            </div>
          )}
        </div>
        
        <div className="md:w-2/3 space-y-6">
          <div>
            <h2 className="text-2xl font-bold">{result.result.title || "Unknown Title"}</h2>
            <p className="text-gray-400 mt-1">{result.result.subtitle || "Unknown Artist"}</p>
          </div>
          
          {result.result.metadata && result.result.metadata.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
              {result.result.metadata.map((meta: any, index: number) => (
                <div key={index} className="bg-gray-800 p-3 rounded border border-gray-700">
                  <h3 className="text-xs font-medium text-gray-400">{meta.title}</h3>
                  <p className="text-sm mt-1">{meta.text}</p>
                </div>
              ))}
            </div>
          )}
          
          {result.result.providers && result.result.providers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {result.result.providers.map((provider: any, index: number) => (
                <a
                  key={index}
                  href={provider.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 hover:bg-gray-700 border border-gray-700 px-3 py-2 rounded text-sm transition-colors"
                >
                  {provider.caption}
                </a>
              ))}
            </div>
          )}
           <SongLinks
            songName={result.result.title || ""}
            artistName={result.result.subtitle || ""}
          />
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

// // Icon components
// const SpotifyIcon = () => (
//   <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
//     <path d="M12,0C5.4,0,0,5.4,0,12s5.4,12,12,12s12-5.4,12-12S18.6,0,12,0z M17.5,17.3c-0.2,0.4-0.7,0.5-1.1,0.3 c-3-1.8-6.7-2.2-11.1-1.2c-0.4,0.1-0.8-0.2-0.9-0.6c-0.1-0.4,0.2-0.8,0.6-0.9c4.8-1.1,9-0.6,12.3,1.4C17.6,16.4,17.7,16.9,17.5,17.3z
//     M19,14c-0.3,0.4-0.8,0.6-1.2,0.3c-3.4-2.1-8.5-2.7-12.5-1.5c-0.5,0.2-1.1-0.1-1.3-0.6c-0.2-0.5,0.1-1.1,0.6-1.3
//     c4.6-1.4,10.3-0.7,14.2,1.7C19.1,13,19.2,13.6,19,14z M19.2,10.6c-4.1-2.4-10.8-2.7-14.7-1.5c-0.6,0.2-1.3-0.1-1.5-0.8
//     c-0.2-0.6,0.1-1.3,0.8-1.5c4.5-1.4,11.9-1.1,16.6,1.7c0.6,0.3,0.8,1.1,0.4,1.7C20.5,10.8,19.8,11,19.2,10.6z" />
//   </svg>
// );

// const YouTubeIcon = () => (
//   <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
//     <path d="M21.6,7.2c-0.2-0.9-0.9-1.6-1.8-1.8C18.2,5,12,5,12,5S5.8,5,4.2,5.4C3.3,5.6,2.6,6.3,2.4,7.2
//     C2,8.8,2,12,2,12s0,3.2,0.4,4.8c0.2,0.9,0.9,1.6,1.8,1.8C5.8,19,12,19,12,19s6.2,0,7.8-0.4c0.9-0.2,1.6-0.9,1.8-1.8
//     C22,15.2,22,12,22,12S22,8.8,21.6,7.2z M10,15V9l5.2,3L10,15z" />
//   </svg>
// );

// const DeezerIcon = () => (
//   <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
//     <path d="M18.81,16.23c0,0.73-0.6,1.33-1.33,1.33h-3.54c-0.73,0-1.33-0.59-1.33-1.33v0c0-0.73,0.6-1.33,1.33-1.33h3.54
//     c0.73,0,1.33,0.59,1.33,1.33V16.23z M18.81,12.54c0,0.73-0.6,1.33-1.33,1.33h-3.54c-0.73,0-1.33-0.6-1.33-1.33v0
//     c0-0.73,0.6-1.33,1.33-1.33h3.54c0.73,0,1.33,0.6,1.33,1.33V12.54z M18.81,8.86c0,0.73-0.6,1.33-1.33,1.33h-3.54
//     c-0.73,0-1.33-0.6-1.33-1.33v0c0-0.73,0.6-1.33,1.33-1.33h3.54c0.73,0,1.33,0.59,1.33,1.33V8.86z M18.81,5.17
//     c0,0.73-0.6,1.33-1.33,1.33h-3.54c-0.73,0-1.33-0.59-1.33-1.33v0c0-0.74,0.6-1.33,1.33-1.33h3.54c0.73,0,1.33,0.59,1.33,1.33V5.17z
//     M11.39,16.23c0,0.73-0.59,1.33-1.33,1.33H6.52c-0.74,0-1.33-0.59-1.33-1.33v0c0-0.73,0.59-1.33,1.33-1.33h3.54
//     c0.74,0,1.33,0.59,1.33,1.33V16.23z M11.39,12.54c0,0.73-0.59,1.33-1.33,1.33H6.52c-0.74,0-1.33-0.6-1.33-1.33v0
//     c0-0.73,0.59-1.33,1.33-1.33h3.54c0.74,0,1.33,0.6,1.33,1.33V12.54z M11.39,8.86c0,0.73-0.59,1.33-1.33,1.33H6.52
//     c-0.74,0-1.33-0.6-1.33-1.33v0c0-0.73,0.59-1.33,1.33-1.33h3.54c0.74,0,1.33,0.59,1.33,1.33V8.86z" />
//   </svg>
// );



// const AppleMusicIcon = () => (
//   <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
//     <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.784-.1 1.18 0 .083-.013.162-.015.24v9.923c.02.536.045 1.074.152 1.6.196.963.638 1.807 1.31 2.513a5.139 5.139 0 002.23 1.35c.5.154 1.018.214 1.536.27.284.028.57.05.856.062.194.01.39.016.586.02h11.572c.016 0 .033-.25.05-.026.303-.02.605-.04.908-.072a8.32 8.32 0 001.812-.338 5.15 5.15 0 001.953-1.07c.73-.66 1.278-1.445 1.52-2.39.12-.476.177-.964.202-1.458.035-.697.02-1.393.036-2.09-.001-3.306 0-6.61 0-9.916h-.013zm-14.422 4.515c.023-1.5 1.264-2.698 2.733-2.697 1.48.004 2.746 1.218 2.727 2.74-.02 1.493-1.24 2.728-2.733 2.726-1.49 0-2.756-1.248-2.728-2.77zm8.8 8.266c-.13.087-.275.157-.42.216-.585.256-1.192.334-1.82.314a4.997 4.997 0 01-1.603-.4c-.155-.07-.31-.15-.437-.274-.48-.447-.44-1.112.09-1.506.332-.245.75-.336 1.164-.33.58.01 1.162.01 1.742 0 .226-.004.453.014.677.043.123.016.245.05.356.098.46.19.706.585.577 1.05a.976.976 0 01-.327.788zm.412-3.07c-.723-.013-1.443.035-2.133-.162a2.47 2.47 0 01-.56-.232c-.453-.26-.75-.706-.743-1.25.003-.522.294-.97.73-1.22.44-.247.933-.29 1.41-.196.3.06.6.146.88.27.626.28 1.024.762 1.12 1.444.1.695-.228 1.26-.8 1.39-.058.012-.114.022-.172.03-.196.026-.394.04-.592.04-.045-.002-.09 0-.135 0v-.116l-.004-.002z"/>
//   </svg>
// );

// const AmazonMusicIcon = () => (
//   <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
//     <path d="M18.29 19.732c-3.405 2.582-8.376 3.953-12.65 3.953-5.98 0-11.377-2.282-15.45-6.073-.324-.29-.038-.686.348-.461 4.386 2.63 9.812 4.218 15.426 4.218 3.783 0 7.942-.809 11.767-2.489.577-.256 1.06.393.559.852m1.647-1.914c-.44-.58-2.887-.273-3.986-.136-.335.038-.385-.26-.085-.48 1.957-1.42 5.16-.998 5.531-.53.372.481-.098 3.78-1.93 5.357-.28.243-.546.113-.422-.206.408-1.05 1.332-3.424.892-4.005"/>
//     <path d="M17.776 2.301V.57c0-.2-.147-.334-.32-.334h-2.311c-.182 0-.324.137-.324.334v1.653c0 .197.166.365.362.365h.303c.19 0 .372-.16.372-.365V1.156h1.19V2.19c0 .194.199.411.392.411h.367c.19 0 .38-.204.38-.397 0-.006-.011-.906-.011-.906"/>
//     <path d="M10.649 2.136h-.348c-.19-.018-.34-.168-.34-.366V.57c0-.198.15-.334.34-.334h.348c.179 0 .326.134.326.334v1.207c0 .198-.145.366-.326.366m4.77.165h-.724c-.203 0-.366-.157-.366-.366v-1.37H13.77c-.204 0-.364-.16-.364-.366V.57c0-.2.16-.334.364-.334h1.89c.19 0 .339.136.339.334V1.93c0 .21-.148.37-.34.37h-.24zm-1.732 0h-.724c-.203 0-.365-.157-.365-.366v-1.37h-.559c-.204 0-.364-.16-.364-.366V.57c0-.2.16-.334.364-.334h1.89c.19 0 .339.136.339.334V1.93c0 .21-.147.37-.34.37h-.24zm-5.944 0h-.723c-.203 0-.366-.157-.366-.366v-1.37H6.095c-.204 0-.364-.16-.364-.366V.57c0-.2.16-.334.364-.334h1.89c.19 0 .339.136.339.334V1.93c0 .21-.148.37-.34.37h-.24zm-1.732 0h-.724c-.203 0-.365-.157-.365-.366v-1.37h-.558c-.204 0-.364-.16-.364-.366V.57c0-.2.16-.334.364-.334h1.89c.189 0 .338.136.338.334V1.93c0 .21-.147.37-.34.37h-.24zm-3.048 0H.483c-.192 0-.357-.165-.357-.366V.603c0-.201.142-.356.357-.356h2.527c.192 0 .357.154.357.356V.85c0 .201-.165.356-.357.356h-1.8v.33h1.8c.192 0 .357.153.357.354v.257c0 .2-.165.355-.357.355"/>
//     <path d="M21.127 12.626c-2.77-2.097-6.79-3.2-10.245-3.2s-7.475 1.103-10.245 3.2c-.207.159-.224.506-.017.663.218.163.495.009.702-.15a18.273 18.273 0 019.56-2.507c3.435 0 6.7.897 9.56 2.507.207.159.483.313.702.15.207-.157.19-.504-.017-.663"/>
//     <path d="M17.766 12.115a.949.949 0 00-.949.948v.634c0 .523.425.948.949.948h.633a.949.949 0 00.949-.948v-.634a.949.949 0 00-.949-.948m-.738.948c0-.407.33-.737.738-.737s.738.33.738.737-.33.738-.738.738-.738-.331-.738-.738m-11.178-.948a.95.95 0 00-.95.948v.634c0 .523.425.948.95.948h.633a.948.948 0 00.949-.948v-.634a.948.948 0 00-.949-.948m-.739.948c0-.407.331-.737.738-.737s.738.33.738.737-.33.738-.738.738-.738-.331-.738-.738"/>
//     <path d="M14.65 14.019c.524 0 .95-.425.95-.949v-.633a.949.949 0 00-.95-.949h-.633a.949.949 0 00-.949.95v.633c0 .523.425.948.949.948m-.95-1.582a.316.316 0 01.317-.316.316.316 0 01.317.316l-.001.633a.317.317 0 01-.316.317.317.317 0 01-.317-.317m-4.27 1.582c.524 0 .95-.425.95-.949v-.633a.949.949 0 00-.95-.949h-.633a.949.949 0 00-.949.95v.633c0 .523.425.948.949.948m-.95-1.582a.316.316 0 01.317-.316.316.316 0 01.317.316l-.001.633a.317.317 0 01-.316.317.317.317 0 01-.317-.317"/>
//   </svg>
// );

// const GaanaIcon = () => (
//   <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
//     <path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12zm0-22.242c5.648 0 10.242 4.594 10.242 10.242S17.648 22.242 12 22.242 1.758 17.648 1.758 12 6.352 1.758 12 1.758zm5.33 5.33a7.515 7.515 0 00-10.66 0 7.516 7.516 0 000 10.66 7.516 7.516 0 0010.66 0 7.516 7.516 0 000-10.66zM12 16.242a4.243 4.243 0 110-8.486 4.243 4.243 0 010 8.486zm0-7.408a3.165 3.165 0 100 6.33 3.165 3.165 0 000-6.33z"/>
//   </svg>
// );

// const JioSaavanIcon = () => (
//   <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
//     <path d="M19.993 10.9c-.012-4.4-3.576-7.96-7.978-7.967-4.073-.007-7.468 3.047-7.945 7.004-.04.336-.07.679-.07 1.026.007 4.4 3.567 7.957 7.964 7.967 4.786.011 8.696-4.64 8.029-9.03zM12 16.85c-2.675 0-4.85-2.179-4.85-4.85 0-2.672 2.175-4.85 4.85-4.85 2.676 0 4.85 2.178 4.85 4.85 0 2.671-2.175 4.85-4.85 4.85zm6.05-4.85c0-3.336-2.714-6.05-6.05-6.05-3.336 0-6.05 2.714-6.05 6.05 0 3.336 2.714 6.05 6.05 6.05 3.336 0 6.05-2.714 6.05-6.05zm-5.032-2.726l-2.932 5.865c-.186.366.093.811.5.811h.001c.393 0 .655-.257.805-.558l2.933-5.864c.187-.366-.093-.81-.5-.81h-.001c-.392 0-.654.256-.806.556z"/>
//   </svg>
// );

// const WyncMusicIcon = () => (
//   <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
//     <path d="M20.895 7.553L16.394 2l-4.386 10.834L7.606 2 3.105 7.553C1.809 9.128 1 11.14 1 13.143 1 18.089 5.038 22 10 22s9-3.911 9-8.857c0-2.003-.809-4.015-2.105-5.59zM7.605 16.714c-.851 0-1.542-.68-1.542-1.518 0-.838.69-1.517 1.542-1.517.851 0 1.541.68 1.541 1.517 0 .839-.69 1.518-1.541 1.518zm4.386 3.036c-.851 0-1.541-.68-1.541-1.518 0-.838.69-1.518 1.541-1.518.852 0 1.542.68 1.542 1.518 0 .838-.69 1.518-1.542 1.518z"/>
//   </svg>
// );