import React, { useState } from 'react';
import { useVideoStore, SavedLoop } from '../store';
import { Trash2, Play, Bookmark } from 'lucide-react';

export const SavedLoops: React.FC = () => {
  const { savedLoops, saveLoop, deleteLoop, loadLoop } = useVideoStore();
  const [newLoopTitle, setNewLoopTitle] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLoopTitle.trim()) {
      saveLoop(newLoopTitle.trim());
      setNewLoopTitle('');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <form onSubmit={handleSave} className="mb-4 flex gap-2">
        <input
          type="text"
          value={newLoopTitle}
          onChange={(e) => setNewLoopTitle(e.target.value)}
          placeholder="Enter loop title"
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!newLoopTitle.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Loop
        </button>
      </form>

      {savedLoops.length === 0 ? (
        <div className="text-center py-12 px-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <Bookmark size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Saved Loops</h3>
          <p className="text-gray-500 mb-4">
            Create and save your first loop to access it quickly later
          </p>
          <div className="text-sm text-gray-400">
            Set loop points using the timeline above, then give it a title and click "Save Loop"
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {savedLoops.map((loop: SavedLoop) => (
            <div
              key={loop.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-gray-700">{loop.title}</span>
              <div className="flex gap-3">
                <button
                  onClick={() => loadLoop(loop)}
                  className="p-2 hover:text-blue-500 transition-colors"
                  aria-label="Load loop"
                >
                  <Play size={20} />
                </button>
                <button
                  onClick={() => deleteLoop(loop.id)}
                  className="p-2 hover:text-red-500 transition-colors"
                  aria-label="Delete loop"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};