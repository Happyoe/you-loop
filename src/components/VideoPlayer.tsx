import React, { useRef, useEffect } from 'react';
import { useVideoStore } from '../store';
import { Volume2 } from 'lucide-react';

export const VideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const {
    isPlaying,
    isAudioOnly,
    currentTime,
    isLooping,
    startTime,
    endTime,
    playbackSpeed,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    setTimeRange,
  } = useVideoStore();

  const videoUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = async () => {
      try {
        video.currentTime = currentTime;
        await video.play();
      } catch (error) {
        setIsPlaying(false);
        console.error('Playback failed:', error);
      }
    };

    if (isPlaying) {
      handlePlay();
    } else {
      video.pause();
    }
  }, [isPlaying, currentTime, setIsPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (isLooping && video.currentTime >= endTime) {
        video.currentTime = startTime;
        setCurrentTime(startTime);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [isLooping, startTime, endTime, setCurrentTime]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      // Only set the end time if we're not already looping
      if (!isLooping) {
        setTimeRange(0, video.duration);
      }
      setDuration(video.duration);
      video.currentTime = currentTime;
    }
  };

  if (isAudioOnly) {
    return (
      <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg bg-gray-900 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <Volume2 size={48} className="mx-auto mb-4" />
          <p className="text-lg font-medium">Audio Only Mode</p>
          <p className="text-sm">Video playback is hidden</p>
        </div>
        <video
          ref={videoRef}
          className="hidden"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg bg-black">
      <video
        ref={videoRef}
        className="w-full h-full"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};