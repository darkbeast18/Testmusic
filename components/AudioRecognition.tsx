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

const SearchResults = ({ result }: { result: any }) => {
  return (
    <div>
      {result && <Result result={result} />}
    </div>
  );
};


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

  useEffect(() => {
    console.log("Fetched Result Data:", result);
}, [result]);

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
      {success && result && result.result && <Result result={result} />}


</div>
 )};