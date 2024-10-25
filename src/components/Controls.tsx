import React from 'react';
import { useVideoStore } from '../store';
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Volume2, VideoOff, Magnet } from 'lucide-react';
import { Tooltip } from './Tooltip';

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export const Controls: React.FC = () => {
  const { 
    isPlaying, 
    isLooping,
    isAudioOnly,
    isSnappingEnabled,
    currentTime,
    startTime,
    endTime,
    playbackSpeed,
    setCurrentTime,
    setIsPlaying, 
    setIsLooping,
    setIsAudioOnly,
    setIsSnappingEnabled,
    setPlaybackSpeed
  } = useVideoStore();

  const handleRestart = () => {
    const startPosition = isLooping ? startTime : 0;
    setCurrentTime(startPosition);
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  const handleSkipBack = () => {
    const newTime = Math.max(currentTime - 5, isLooping ? startTime : 0);
    setCurrentTime(newTime);
  };

  const handleSkipForward = () => {
    const newTime = Math.min(currentTime + 5, isLooping ? endTime : Infinity);
    setCurrentTime(newTime);
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
    if (!isLooping) {
      if (currentTime < startTime || currentTime > endTime) {
        setCurrentTime(startTime);
      }
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm space-y-4">
      <div className="flex items-center justify-center gap-6">
        <Tooltip content={`Switch to ${isAudioOnly ? 'video' : 'audio'} mode`}>
          <button
            onClick={() => setIsAudioOnly(!isAudioOnly)}
            className={`p-3 rounded-full hover:bg-gray-100 transition-colors ${
              isAudioOnly ? 'text-purple-500 bg-purple-50' : ''
            }`}
          >
            {isAudioOnly ? <VideoOff size={24} /> : <Volume2 size={24} />}
          </button>
        </Tooltip>

        <Tooltip content={`${isLooping ? 'Disable' : 'Enable'} loop`}>
          <button
            onClick={toggleLoop}
            className={`p-3 rounded-full hover:bg-gray-100 transition-colors ${
              isLooping ? 'text-blue-500 bg-blue-50' : ''
            }`}
          >
            <RotateCcw size={24} />
          </button>
        </Tooltip>

        <Tooltip content={`${isSnappingEnabled ? 'Disable' : 'Enable'} magnetic snap`}>
          <button
            onClick={() => setIsSnappingEnabled(!isSnappingEnabled)}
            className={`p-3 rounded-full hover:bg-gray-100 transition-colors ${
              isSnappingEnabled ? 'text-green-500 bg-green-50' : ''
            }`}
          >
            <Magnet size={24} />
          </button>
        </Tooltip>

        <Tooltip content="Back 5 seconds">
          <button
            onClick={handleSkipBack}
            className="p-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            <SkipBack size={24} />
          </button>
        </Tooltip>

        <Tooltip content={isPlaying ? 'Pause' : 'Play'}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-4 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
          >
            {isPlaying ? <Pause size={32} /> : <Play size={32} />}
          </button>
        </Tooltip>

        <Tooltip content="Forward 5 seconds">
          <button
            onClick={handleSkipForward}
            className="p-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            <SkipForward size={24} />
          </button>
        </Tooltip>

        <Tooltip content="Restart from beginning">
          <button
            onClick={handleRestart}
            className="p-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            <SkipBack size={24} className="text-blue-500" />
          </button>
        </Tooltip>
      </div>

      <div className="flex items-center justify-center gap-4">
        <span className="text-sm font-medium text-gray-600">Speed:</span>
        <select
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
          className="px-3 py-1 border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {PLAYBACK_SPEEDS.map((speed) => (
            <option key={speed} value={speed}>
              {speed}x
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};