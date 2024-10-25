export interface Loop {
  id: string;
  title: string;
  videoId: string;
  startTime: number;
  endTime: number;
}

export interface VideoState {
  videoId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLooping: boolean;
  startTime: number;
  endTime: number;
}