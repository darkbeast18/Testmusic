"use client";
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion } from 'framer-motion';
interface ResultData {
  result?: {
    title?: string;
    subtitle?: string;
    album?: string;
    label?: string;
    releaseYear?: string;
    images?: {
      coverarthq?: string;
    };
  };
}


interface SongResultProps {
  result: ResultData | null;
}

export default function SongResult({ result }: SongResultProps) {
  if (!result) return <p>No song data available.</p>;

  const songData = {
    title: result?.result?.title || "Unknown Title",
    artists: result?.result?.subtitle || "Unknown Artist",
    album: result?.result?.album || "Unknown Album",
    label: result?.result?.label || "Unknown Label",
    releaseYear: result?.result?.releaseYear || "Unknown Year",
    coverArt: result?.result?.images?.coverarthq || "/default-cover.jpg",
};
 

  useEffect(() => {
    console.log("Received Result Data in Result Component:", result);
  }, [result]);
  console.log(result);

  return (
    <div className=" absolute z-10 min-h-screen bg-gradient-to-b from-gray-900 to-black text-white font-serif">
      <Head>
        <title>{songData.title} | Music Discovery</title>
        <meta name="description" content={`Song details for ${songData.title} by ${songData.artists}`} />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Montserrat:wght@300;400;500&display=swap" />
      </Head>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
      {/* <motion.div 
   initial={{ opacity: 0 }}
   animate={{ opacity: 1 }}
   transition={{ duration: 0.8 }}
   className="mb-6"
> */}

          <div className="inline-block py-1 px-3 bg-emerald-700 text-emerald-100 rounded-full text-sm mb-8">
            Song Detected!
          </div>
        {/* </motion.div> */}

        <div className="grid md:grid-cols-2 gap-12">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x:  -50, opacity:  0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="aspect-square relative rounded-lg overflow-hidden shadow-2xl"
          >
            {songData && (
    <Image 
        src={songData.coverArt}
        alt={songData.title}
        className="object-cover transform hover:scale-105 transition-transform duration-700"
        width={300}
        height={300}
        priority
    />
)}


         
          </motion.div>

          <motion.div 
   initial={{ x: -50, opacity: 0 }}
   animate={{ x: 0, opacity: 1 }}
   transition={{ duration: 0.6, delay: 0.2 }}
>

            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">
              {songData.title}
            </h1>
            
            <p className="text-lg text-gray-300 mb-8">{songData.artists}</p>
            
            <div className="grid grid-cols-2 gap-6 mb-12">
              <div>
                <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-2">Album</h3>
                <p className="font-medium text-gray-200">{songData.album}</p>
              </div>
              
              <div>
                <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-2">Label</h3>
                <p className="font-medium text-gray-200">{songData.label}</p>
              </div>
              
              <div>
                <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-2">Released</h3>
                <p className="font-medium text-gray-200">{songData.releaseYear}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <button className="px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 rounded-md transition-all duration-300 flex items-center justify-center gap-2 shadow-lg">
                <SpotifyIcon />
                <span className="font-medium">Spotify</span>
              </button>
              
              <button className="px-4 py-3 bg-transparent border border-gray-600 hover:border-gray-400 rounded-md transition-all duration-300 flex items-center justify-center gap-2">
                <YouTubeIcon />
                <span className="font-medium">YouTube</span>
              </button>
              
              <button className="px-4 py-3 bg-transparent border border-gray-600 hover:border-gray-400 rounded-md transition-all duration-300 flex items-center justify-center gap-2">
                <DeezerIcon />
                <span className="font-medium">Deezer</span>
              </button>
              
              <button className="px-4 py-3 bg-transparent border border-gray-600 hover:border-gray-400 rounded-md transition-all duration-300 flex items-center justify-center gap-2">
                <AppleMusicIcon />
                <span className="font-medium">Apple Music</span>
              </button>
              
              <button className="px-4 py-3 bg-transparent border border-gray-600 hover:border-gray-400 rounded-md transition-all duration-300 flex items-center justify-center gap-2">
                <AmazonMusicIcon />
                <span className="font-medium">Amazon</span>
              </button>
              
              <button className="px-4 py-3 bg-transparent border border-gray-600 hover:border-gray-400 rounded-md transition-all duration-300 flex items-center justify-center gap-2">
                <GaanaIcon />
                <span className="font-medium">Gaana</span>
              </button>
              
              <button className="px-4 py-3 bg-transparent border border-gray-600 hover:border-gray-400 rounded-md transition-all duration-300 flex items-center justify-center gap-2">
                <JioSaavanIcon />
                <span className="font-medium">JioSaavan</span>
              </button>
              
              <button className="px-4 py-3 bg-transparent border border-gray-600 hover:border-gray-400 rounded-md transition-all duration-300 flex items-center justify-center gap-2">
                <WyncMusicIcon />
                <span className="font-medium">Wynk</span>
              </button>
            </div>
            
            
          </motion.div>
        </div>
      </main>
    </div>
  );
}

// Icon components
const SpotifyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,0C5.4,0,0,5.4,0,12s5.4,12,12,12s12-5.4,12-12S18.6,0,12,0z M17.5,17.3c-0.2,0.4-0.7,0.5-1.1,0.3
    c-3-1.8-6.7-2.2-11.1-1.2c-0.4,0.1-0.8-0.2-0.9-0.6c-0.1-0.4,0.2-0.8,0.6-0.9c4.8-1.1,9-0.6,12.3,1.4C17.6,16.4,17.7,16.9,17.5,17.3z
    M19,14c-0.3,0.4-0.8,0.6-1.2,0.3c-3.4-2.1-8.5-2.7-12.5-1.5c-0.5,0.2-1.1-0.1-1.3-0.6c-0.2-0.5,0.1-1.1,0.6-1.3
    c4.6-1.4,10.3-0.7,14.2,1.7C19.1,13,19.2,13.6,19,14z M19.2,10.6c-4.1-2.4-10.8-2.7-14.7-1.5c-0.6,0.2-1.3-0.1-1.5-0.8
    c-0.2-0.6,0.1-1.3,0.8-1.5c4.5-1.4,11.9-1.1,16.6,1.7c0.6,0.3,0.8,1.1,0.4,1.7C20.5,10.8,19.8,11,19.2,10.6z"/>
  </svg>
);

const YouTubeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.6,7.2c-0.2-0.9-0.9-1.6-1.8-1.8C18.2,5,12,5,12,5S5.8,5,4.2,5.4C3.3,5.6,2.6,6.3,2.4,7.2
    C2,8.8,2,12,2,12s0,3.2,0.4,4.8c0.2,0.9,0.9,1.6,1.8,1.8C5.8,19,12,19,12,19s6.2,0,7.8-0.4c0.9-0.2,1.6-0.9,1.8-1.8
    C22,15.2,22,12,22,12S22,8.8,21.6,7.2z M10,15V9l5.2,3L10,15z"/>
  </svg>
);

const DeezerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.81,16.23c0,0.73-0.6,1.33-1.33,1.33h-3.54c-0.73,0-1.33-0.59-1.33-1.33v0c0-0.73,0.6-1.33,1.33-1.33h3.54
    c0.73,0,1.33,0.59,1.33,1.33V16.23z M18.81,12.54c0,0.73-0.6,1.33-1.33,1.33h-3.54c-0.73,0-1.33-0.6-1.33-1.33v0
    c0-0.73,0.6-1.33,1.33-1.33h3.54c0.73,0,1.33,0.6,1.33,1.33V12.54z M18.81,8.86c0,0.73-0.6,1.33-1.33,1.33h-3.54
    c-0.73,0-1.33-0.6-1.33-1.33v0c0-0.73,0.6-1.33,1.33-1.33h3.54c0.73,0,1.33,0.59,1.33,1.33V8.86z M18.81,5.17
    c0,0.73-0.6,1.33-1.33,1.33h-3.54c-0.73,0-1.33-0.59-1.33-1.33v0c0-0.74,0.6-1.33,1.33-1.33h3.54c0.73,0,1.33,0.59,1.33,1.33V5.17z
    M11.39,16.23c0,0.73-0.59,1.33-1.33,1.33H6.52c-0.74,0-1.33-0.59-1.33-1.33v0c0-0.73,0.59-1.33,1.33-1.33h3.54
    c0.74,0,1.33,0.59,1.33,1.33V16.23z M11.39,12.54c0,0.73-0.59,1.33-1.33,1.33H6.52c-0.74,0-1.33-0.6-1.33-1.33v0
    c0-0.73,0.59-1.33,1.33-1.33h3.54c0.74,0,1.33,0.6,1.33,1.33V12.54z M11.39,8.86c0,0.73-0.59,1.33-1.33,1.33H6.52
    c-0.74,0-1.33-0.6-1.33-1.33v0c0-0.73,0.59-1.33,1.33-1.33h3.54c0.74,0,1.33,0.59,1.33,1.33V8.86z"/>
  </svg>
);

const AppleMusicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.784-.1 1.18 0 .083-.013.162-.015.24v9.923c.02.536.045 1.074.152 1.6.196.963.638 1.807 1.31 2.513a5.139 5.139 0 002.23 1.35c.5.154 1.018.214 1.536.27.284.028.57.05.856.062.194.01.39.016.586.02h11.572c.016 0 .033-.25.05-.026.303-.02.605-.04.908-.072a8.32 8.32 0 001.812-.338 5.15 5.15 0 001.953-1.07c.73-.66 1.278-1.445 1.52-2.39.12-.476.177-.964.202-1.458.035-.697.02-1.393.036-2.09-.001-3.306 0-6.61 0-9.916h-.013zm-14.422 4.515c.023-1.5 1.264-2.698 2.733-2.697 1.48.004 2.746 1.218 2.727 2.74-.02 1.493-1.24 2.728-2.733 2.726-1.49 0-2.756-1.248-2.728-2.77zm8.8 8.266c-.13.087-.275.157-.42.216-.585.256-1.192.334-1.82.314a4.997 4.997 0 01-1.603-.4c-.155-.07-.31-.15-.437-.274-.48-.447-.44-1.112.09-1.506.332-.245.75-.336 1.164-.33.58.01 1.162.01 1.742 0 .226-.004.453.014.677.043.123.016.245.05.356.098.46.19.706.585.577 1.05a.976.976 0 01-.327.788zm.412-3.07c-.723-.013-1.443.035-2.133-.162a2.47 2.47 0 01-.56-.232c-.453-.26-.75-.706-.743-1.25.003-.522.294-.97.73-1.22.44-.247.933-.29 1.41-.196.3.06.6.146.88.27.626.28 1.024.762 1.12 1.444.1.695-.228 1.26-.8 1.39-.058.012-.114.022-.172.03-.196.026-.394.04-.592.04-.045-.002-.09 0-.135 0v-.116l-.004-.002z"/>
  </svg>
);

const AmazonMusicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.29 19.732c-3.405 2.582-8.376 3.953-12.65 3.953-5.98 0-11.377-2.282-15.45-6.073-.324-.29-.038-.686.348-.461 4.386 2.63 9.812 4.218 15.426 4.218 3.783 0 7.942-.809 11.767-2.489.577-.256 1.06.393.559.852m1.647-1.914c-.44-.58-2.887-.273-3.986-.136-.335.038-.385-.26-.085-.48 1.957-1.42 5.16-.998 5.531-.53.372.481-.098 3.78-1.93 5.357-.28.243-.546.113-.422-.206.408-1.05 1.332-3.424.892-4.005"/>
    <path d="M17.776 2.301V.57c0-.2-.147-.334-.32-.334h-2.311c-.182 0-.324.137-.324.334v1.653c0 .197.166.365.362.365h.303c.19 0 .372-.16.372-.365V1.156h1.19V2.19c0 .194.199.411.392.411h.367c.19 0 .38-.204.38-.397 0-.006-.011-.906-.011-.906"/>
    <path d="M10.649 2.136h-.348c-.19-.018-.34-.168-.34-.366V.57c0-.198.15-.334.34-.334h.348c.179 0 .326.134.326.334v1.207c0 .198-.145.366-.326.366m4.77.165h-.724c-.203 0-.366-.157-.366-.366v-1.37H13.77c-.204 0-.364-.16-.364-.366V.57c0-.2.16-.334.364-.334h1.89c.19 0 .339.136.339.334V1.93c0 .21-.148.37-.34.37h-.24zm-1.732 0h-.724c-.203 0-.365-.157-.365-.366v-1.37h-.559c-.204 0-.364-.16-.364-.366V.57c0-.2.16-.334.364-.334h1.89c.19 0 .339.136.339.334V1.93c0 .21-.147.37-.34.37h-.24zm-5.944 0h-.723c-.203 0-.366-.157-.366-.366v-1.37H6.095c-.204 0-.364-.16-.364-.366V.57c0-.2.16-.334.364-.334h1.89c.19 0 .339.136.339.334V1.93c0 .21-.148.37-.34.37h-.24zm-1.732 0h-.724c-.203 0-.365-.157-.365-.366v-1.37h-.558c-.204 0-.364-.16-.364-.366V.57c0-.2.16-.334.364-.334h1.89c.189 0 .338.136.338.334V1.93c0 .21-.147.37-.34.37h-.24zm-3.048 0H.483c-.192 0-.357-.165-.357-.366V.603c0-.201.142-.356.357-.356h2.527c.192 0 .357.154.357.356V.85c0 .201-.165.356-.357.356h-1.8v.33h1.8c.192 0 .357.153.357.354v.257c0 .2-.165.355-.357.355"/>
    <path d="M21.127 12.626c-2.77-2.097-6.79-3.2-10.245-3.2s-7.475 1.103-10.245 3.2c-.207.159-.224.506-.017.663.218.163.495.009.702-.15a18.273 18.273 0 019.56-2.507c3.435 0 6.7.897 9.56 2.507.207.159.483.313.702.15.207-.157.19-.504-.017-.663"/>
    <path d="M17.766 12.115a.949.949 0 00-.949.948v.634c0 .523.425.948.949.948h.633a.949.949 0 00.949-.948v-.634a.949.949 0 00-.949-.948m-.738.948c0-.407.33-.737.738-.737s.738.33.738.737-.33.738-.738.738-.738-.331-.738-.738m-11.178-.948a.95.95 0 00-.95.948v.634c0 .523.425.948.95.948h.633a.948.948 0 00.949-.948v-.634a.948.948 0 00-.949-.948m-.739.948c0-.407.331-.737.738-.737s.738.33.738.737-.33.738-.738.738-.738-.331-.738-.738"/>
    <path d="M14.65 14.019c.524 0 .95-.425.95-.949v-.633a.949.949 0 00-.95-.949h-.633a.949.949 0 00-.949.95v.633c0 .523.425.948.949.948m-.95-1.582a.316.316 0 01.317-.316.316.316 0 01.317.316l-.001.633a.317.317 0 01-.316.317.317.317 0 01-.317-.317m-4.27 1.582c.524 0 .95-.425.95-.949v-.633a.949.949 0 00-.95-.949h-.633a.949.949 0 00-.949.95v.633c0 .523.425.948.949.948m-.95-1.582a.316.316 0 01.317-.316.316.316 0 01.317.316l-.001.633a.317.317 0 01-.316.317.317.317 0 01-.317-.317"/>
  </svg>
);

const GaanaIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12zm0-22.242c5.648 0 10.242 4.594 10.242 10.242S17.648 22.242 12 22.242 1.758 17.648 1.758 12 6.352 1.758 12 1.758zm5.33 5.33a7.515 7.515 0 00-10.66 0 7.516 7.516 0 000 10.66 7.516 7.516 0 0010.66 0 7.516 7.516 0 000-10.66zM12 16.242a4.243 4.243 0 110-8.486 4.243 4.243 0 010 8.486zm0-7.408a3.165 3.165 0 100 6.33 3.165 3.165 0 000-6.33z"/>
  </svg>
);

const JioSaavanIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.993 10.9c-.012-4.4-3.576-7.96-7.978-7.967-4.073-.007-7.468 3.047-7.945 7.004-.04.336-.07.679-.07 1.026.007 4.4 3.567 7.957 7.964 7.967 4.786.011 8.696-4.64 8.029-9.03zM12 16.85c-2.675 0-4.85-2.179-4.85-4.85 0-2.672 2.175-4.85 4.85-4.85 2.676 0 4.85 2.178 4.85 4.85 0 2.671-2.175 4.85-4.85 4.85zm6.05-4.85c0-3.336-2.714-6.05-6.05-6.05-3.336 0-6.05 2.714-6.05 6.05 0 3.336 2.714 6.05 6.05 6.05 3.336 0 6.05-2.714 6.05-6.05zm-5.032-2.726l-2.932 5.865c-.186.366.093.811.5.811h.001c.393 0 .655-.257.805-.558l2.933-5.864c.187-.366-.093-.81-.5-.81h-.001c-.392 0-.654.256-.806.556z"/>
  </svg>
);

const WyncMusicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.895 7.553L16.394 2l-4.386 10.834L7.606 2 3.105 7.553C1.809 9.128 1 11.14 1 13.143 1 18.089 5.038 22 10 22s9-3.911 9-8.857c0-2.003-.809-4.015-2.105-5.59zM7.605 16.714c-.851 0-1.542-.68-1.542-1.518 0-.838.69-1.517 1.542-1.517.851 0 1.541.68 1.541 1.517 0 .839-.69 1.518-1.541 1.518zm4.386 3.036c-.851 0-1.541-.68-1.541-1.518 0-.838.69-1.518 1.541-1.518.852 0 1.542.68 1.542 1.518 0 .838-.69 1.518-1.542 1.518zm4.387-3.036c-.852 0-1.542-.68-1.542-1.518 0-.838.69-1.517 1.542-1.517.851 0 1.541.68 1.541 1.517 0 .839-.69 1.518-1.541 1.518z"/>
  </svg>
);

