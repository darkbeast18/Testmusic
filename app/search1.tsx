"use client";

import { useState } from "react";
import { Music, Search } from "lucide-react";
import Image from "next/image";

const Search1 = () => {
  const [query, setQuery] = useState<string>('');
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const apiUrl = "https://shazam-api-audio-recognition-for-songs-music-metadata.p.rapidapi.com/search_track";
      const apiKey = '2fae8c19fbmshc1c101ed553203fp180b67jsnd96198bf2fe4';

      if (!apiKey) {
        throw new Error("API key is missing. Set NEXT_PUBLIC_SHAZAM_API_KEY in .env.local");
      }

      const response = await fetch(
        `${apiUrl}?term=${encodeURIComponent(query)}&locale=en-US&limit=10`,
        {
          method: "GET",
          headers: {
            "X-RapidAPI-Key": '2fae8c19fbmshc1c101ed553203fp180b67jsnd96198bf2fe4',
            "X-RapidAPI-Host": "shazam-api-audio-recognition-for-songs-music-metadata.p.rapidapi.com",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const tracks = data.tracks?.hits?.map((hit: any) => hit.track) || [];
      setSongs(tracks);
    } catch (err: any) {
      setError(err.message || "An error occurred while searching. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="bg-black w-full">
      <nav className="bg-black w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center space-x-2">
                <Music className="text-white w-10 h-10 pr-2" />
                <a href="/" className="text-white text-3xl font-semibold">
                  Music Recognition
                </a>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center space-x-4">
                <a href="/" className="text-white hover:bg-blue-500 hover:text-black rounded-lg p-2">Home</a>
                <a href="/" className="text-white hover:bg-blue-500 hover:text-black rounded-lg p-2">Search</a>
                <a href="/" className="text-white hover:bg-blue-500 hover:text-black rounded-lg p-2">Top Tracks Across Globe</a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* <div className="bg-black py-6 w-full">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSearch} className="flex flex-col items-center">
            <div className="w-full max-w-2xl relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a song..."
                className="w-full p-4 pl-12 pr-4 rounded-xl text-xl text-black border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-4 top-4 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-2 bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div> */}
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {!loading && !error && songs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {songs.map((song) => (
              <div key={song.key} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 w-full">
                  {song.images?.coverart ? (
                    <Image
                      src={song.images.coverart}
                      alt={song.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-200">
                      <Music className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg truncate">{song.title}</h3>
                  <p className="text-gray-600 truncate">{song.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && query && songs.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">No songs found for "{query}". Try another search term.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Search1;
