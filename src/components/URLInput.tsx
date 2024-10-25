import React, { useState } from 'react';
import { useVideoStore } from '../store';

export const URLInput: React.FC = () => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const { setVideoId } = useVideoStore();

  const extractVideoId = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com')) {
        return urlObj.searchParams.get('v');
      } else if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1);
      }
    } catch {
      // If URL parsing fails, check if it's a direct video ID
      if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
        return url;
      }
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = extractVideoId(url.trim());
    
    if (videoId) {
      setError('');
      setVideoId(videoId);
      setUrl('');
    } else {
      setError('Invalid YouTube URL or video ID');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste YouTube URL or video ID here"
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Load
        </button>
      </div>
      {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
    </form>
  );
};