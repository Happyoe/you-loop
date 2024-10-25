import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface SavedLoop {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
}

interface VideoState {
  isPlaying: boolean;
  isLooping: boolean;
  isAudioOnly: boolean;
  isSnappingEnabled: boolean;
  currentTime: number;
  duration: number;
  startTime: number;
  endTime: number;
  playbackSpeed: number;
  savedLoops: SavedLoop[];
  setIsPlaying: (playing: boolean) => void;
  setIsLooping: (looping: boolean) => void;
  setIsAudioOnly: (audioOnly: boolean) => void;
  setIsSnappingEnabled: (enabled: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setTimeRange: (start: number, end: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  saveLoop: (title: string) => void;
  deleteLoop: (id: string) => void;
  loadLoop: (loop: SavedLoop) => void;
}

export const useVideoStore = create<VideoState>()(
  persist(
    (set) => ({
      isPlaying: false,
      isLooping: false,
      isAudioOnly: false,
      isSnappingEnabled: true,
      currentTime: 0,
      duration: 0,
      startTime: 0,
      endTime: 0,
      playbackSpeed: 1,
      savedLoops: [],
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setIsLooping: (looping) => set({ isLooping: looping }),
      setIsAudioOnly: (audioOnly) => set({ isAudioOnly: audioOnly }),
      setIsSnappingEnabled: (enabled) => set({ isSnappingEnabled: enabled }),
      setCurrentTime: (time) => set({ currentTime: time }),
      setDuration: (duration) => set((state) => ({
        duration,
        // Only set endTime if it's 0 (initial load) or less than the new duration
        endTime: state.endTime === 0 || state.endTime > duration ? duration : state.endTime
      })),
      setTimeRange: (start, end) => set((state) => ({
        startTime: start,
        endTime: Math.min(end, state.duration)
      })),
      setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
      saveLoop: (title) =>
        set((state) => ({
          savedLoops: [
            ...state.savedLoops,
            {
              id: crypto.randomUUID(),
              title,
              startTime: state.startTime,
              endTime: state.endTime,
            },
          ],
        })),
      deleteLoop: (id) =>
        set((state) => ({
          savedLoops: state.savedLoops.filter((loop) => loop.id !== id),
        })),
      loadLoop: (loop) =>
        set((state) => ({
          startTime: loop.startTime,
          endTime: Math.min(loop.endTime, state.duration),
          currentTime: loop.startTime,
          isLooping: true,
        })),
    }),
    {
      name: 'video-loops',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        savedLoops: state.savedLoops,
        isLooping: state.isLooping,
        startTime: state.startTime,
        endTime: state.endTime,
        isAudioOnly: state.isAudioOnly,
        isSnappingEnabled: state.isSnappingEnabled,
        playbackSpeed: state.playbackSpeed,
      }),
    }
  )
);