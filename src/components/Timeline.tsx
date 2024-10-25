import React, { useRef, useEffect, useState } from 'react';
import { useVideoStore } from '../store';

const SNAP_THRESHOLD_SECONDS = 1; // Snap within 1 second of the playhead

export const Timeline: React.FC = () => {
  const { 
    currentTime, 
    duration, 
    startTime, 
    endTime, 
    isLooping,
    isSnappingEnabled,
    setTimeRange, 
    setCurrentTime 
  } = useVideoStore();
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef<'start' | 'end' | 'playhead' | null>(null);
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [snapIndicator, setSnapIndicator] = useState<'start' | 'end' | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const getTimeFromPosition = (clientX: number) => {
    if (!timelineRef.current) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    const position = (clientX - rect.left) / rect.width;
    return Math.max(0, Math.min(duration, position * duration));
  };

  const checkSnap = (time: number): number => {
    if (!isSnappingEnabled) return time;
    
    const timeDiff = Math.abs(time - currentTime);
    if (timeDiff <= SNAP_THRESHOLD_SECONDS) {
      setSnapIndicator(isDraggingRef.current === 'start' ? 'start' : 'end');
      return currentTime;
    }
    
    setSnapIndicator(null);
    return time;
  };

  useEffect(() => {
    if (duration > 0) {
      const samples = 200;
      const data = Array.from({ length: samples }, () => 
        Math.random() * 0.5 + 0.25
      );
      setWaveformData(data);
    }
  }, [duration]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = '#E5E7EB';

    const barWidth = rect.width / waveformData.length;
    const heightScale = rect.height / 2;

    waveformData.forEach((value, i) => {
      const x = i * barWidth;
      const height = value * heightScale;
      const y = (rect.height - height) / 2;
      ctx.fillRect(x, y, barWidth * 0.8, height);
    });
  }, [waveformData]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) {
        const time = getTimeFromPosition(e.clientX);
        setHoveredTime(time);
        return;
      }

      let newTime = getTimeFromPosition(e.clientX);
      
      if (isDraggingRef.current === 'start') {
        newTime = checkSnap(newTime);
        setTimeRange(Math.min(newTime, endTime - 0.5), endTime);
      } else if (isDraggingRef.current === 'end') {
        newTime = checkSnap(newTime);
        setTimeRange(startTime, Math.max(newTime, startTime + 0.5));
      } else if (isDraggingRef.current === 'playhead') {
        setCurrentTime(newTime);
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = null;
      setSnapIndicator(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [duration, startTime, endTime, currentTime, setTimeRange, setCurrentTime, isSnappingEnabled]);

  const TimeChip: React.FC<{ time: number; type: 'start' | 'end' | 'current' | 'hover' }> = ({ time, type }) => {
    const colors = {
      start: 'bg-blue-500',
      end: 'bg-blue-500',
      current: 'bg-red-500',
      hover: 'bg-gray-700',
    };

    return (
      <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 ${colors[type]} text-white px-2 py-1 rounded text-xs whitespace-nowrap shadow-md`}>
        {formatTime(time)}
      </div>
    );
  };

  const HandleBar: React.FC<{ type: 'start' | 'end'; position: number }> = ({ type, position }) => {
    const handleWidth = 8;
    const isSnapping = snapIndicator === type;
    
    return (
      <div
        className={`absolute h-full cursor-ew-resize transition-all duration-150 group
          ${type === 'end' ? '-translate-x-full' : ''}
          ${isSnapping ? 'bg-green-500 scale-y-110' : 'bg-blue-500 hover:bg-blue-600'}`}
        style={{
          left: `${position * 100}%`,
          width: `${handleWidth}px`,
        }}
        onMouseDown={() => isDraggingRef.current = type}
      >
        <TimeChip time={type === 'start' ? startTime : endTime} type={type} />
      </div>
    );
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div 
        ref={timelineRef}
        className="relative w-full h-24 bg-gray-100 rounded-lg cursor-pointer overflow-hidden"
        onClick={(e) => {
          const newTime = getTimeFromPosition(e.clientX);
          setCurrentTime(newTime);
        }}
        onMouseLeave={() => setHoveredTime(null)}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: 'none' }}
        />

        {isLooping && (
          <div
            className="absolute h-full bg-blue-100/70 border-x border-blue-300 transition-all duration-200"
            style={{
              left: `${(startTime / duration) * 100}%`,
              width: `${((endTime - startTime) / duration) * 100}%`,
            }}
          />
        )}

        <div className="absolute w-full h-6 bottom-0 flex justify-between px-2 text-xs text-gray-500">
          {Array.from({ length: 11 }).map((_, i) => (
            <span key={i} style={{ left: `${i * 10}%` }}>
              {formatTime((duration * i) / 10)}
            </span>
          ))}
        </div>

        {isLooping && (
          <>
            <HandleBar type="start" position={startTime / duration} />
            <HandleBar type="end" position={endTime / duration} />
          </>
        )}

        <div
          className="absolute w-1 h-full bg-red-500 cursor-col-resize z-10 group"
          style={{ left: `${(currentTime / duration) * 100}%` }}
          onMouseDown={() => isDraggingRef.current = 'playhead'}
        >
          <div className="w-4 h-4 bg-red-500 rounded-full -ml-1.5 -mt-2">
            <TimeChip time={currentTime} type="current" />
          </div>
        </div>

        {hoveredTime !== null && !isDraggingRef.current && (
          <div
            className="absolute h-full w-0.5 bg-gray-400/50 pointer-events-none"
            style={{ left: `${(hoveredTime / duration) * 100}%` }}
          >
            <TimeChip time={hoveredTime} type="hover" />
          </div>
        )}
      </div>

      <div className="flex justify-between mt-4 text-sm font-medium">
        {isLooping ? (
          <>
            <div>
              <span className="text-gray-600">Start: </span>
              <span className="text-blue-600">{formatTime(startTime)}</span>
            </div>
            <div>
              <span className="text-gray-600">Current: </span>
              <span className="text-red-600">{formatTime(currentTime)}</span>
            </div>
            <div>
              <span className="text-gray-600">End: </span>
              <span className="text-blue-600">{formatTime(endTime)}</span>
            </div>
          </>
        ) : (
          <div className="mx-auto">
            <span className="text-gray-600">Current: </span>
            <span className="text-red-600">{formatTime(currentTime)}</span>
            <span className="text-gray-600"> / </span>
            <span className="text-gray-600">{formatTime(duration)}</span>
          </div>
        )}
      </div>
    </div>
  );
};