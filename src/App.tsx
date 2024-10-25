import React from 'react';
import { VideoPlayer } from './components/VideoPlayer';
import { Controls } from './components/Controls';
import { Timeline } from './components/Timeline';
import { SavedLoops } from './components/SavedLoops';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center mb-8">Video Loop Creator</h1>
        <VideoPlayer />
        <Controls />
        <Timeline />
        <SavedLoops />
      </div>
    </div>
  );
}

export default App;