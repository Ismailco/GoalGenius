'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood?: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function JournalPage() {
  const [mounted, setMounted] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('');

  useEffect(() => {
    const loadEntries = async () => {
      try {
        setMounted(true);
        // TODO: Replace with actual storage function when implemented
        // const loadedEntries = await getJournalEntries();
        // setEntries(loadedEntries);

        // Temporary mock data for demonstration
        const mockEntries: JournalEntry[] = [
          {
            id: '1',
            title: 'First Journal Entry',
            content: 'Today was a productive day. I worked on my goals and made good progress...',
            mood: 'good',
            tags: ['productivity', 'goals'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '2',
            title: 'Reflections on Learning',
            content: 'I learned something new today about React and Next.js...',
            mood: 'great',
            tags: ['learning', 'coding'],
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ];
        setEntries(mockEntries);
      } catch (error) {
        console.error('Error loading journal entries:', error);
      }
    };

    loadEntries();
  }, []);

  // Don't render anything until mounted to prevent hydration errors
  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="absolute left-0 w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl"></div>
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 mb-8 transform hover:scale-[1.01] transition-transform border border-white/10">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-8 bg-white/10 rounded-xl w-3/4"></div>
                <div className="h-4 bg-white/5 rounded-xl w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleCreateEntry = () => {
    setSelectedEntry(undefined);
    setIsModalOpen(true);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'great':
        return '😄';
      case 'good':
        return '🙂';
      case 'okay':
        return '😐';
      case 'bad':
        return '😔';
      case 'terrible':
        return '😢';
      default:
        return '📝';
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'great':
        return 'text-green-400';
      case 'good':
        return 'text-blue-400';
      case 'okay':
        return 'text-yellow-400';
      case 'bad':
        return 'text-orange-400';
      case 'terrible':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const filteredEntries = entries
    .filter(entry => {
      const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesMood = !selectedMood || entry.mood === selectedMood;
      return matchesSearch && matchesMood;
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="absolute left-0 w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl"></div>
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 mb-6 transform hover:scale-[1.01] transition-transform border border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Your Journal
              </h1>
              <p className="text-gray-300 mt-2">Capture your thoughts, feelings, and experiences</p>
            </div>
            <button
              onClick={handleCreateEntry}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Entry
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 mb-8 transform hover:scale-[1.01] transition-transform border border-white/10">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search journal entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
            <select
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="">All Moods</option>
              <option value="great">Great 😄</option>
              <option value="good">Good 🙂</option>
              <option value="okay">Okay 😐</option>
              <option value="bad">Bad 😔</option>
              <option value="terrible">Terrible 😢</option>
            </select>
          </div>
        </div>

        {/* Journal Entries Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 transform hover:scale-[1.02] transition-all duration-200 border border-white/10 cursor-pointer"
              onClick={() => handleEditEntry(entry)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-white truncate flex-1 mr-2">
                  {entry.title}
                </h3>
                <span className={`text-2xl ${getMoodColor(entry.mood || '')}`}>
                  {getMoodIcon(entry.mood || '')}
                </span>
              </div>

              <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                {entry.content}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {entry.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>{format(new Date(entry.updatedAt), 'MMM dd, yyyy')}</span>
                <span>{format(new Date(entry.updatedAt), 'HH:mm')}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredEntries.length === 0 && (
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-12 text-center border border-white/10">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-white mb-2">No journal entries yet</h3>
            <p className="text-gray-300 mb-6">Start your journaling journey by creating your first entry</p>
            <button
              onClick={handleCreateEntry}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-full text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Entry
            </button>
          </div>
        )}

        {/* TODO: Add Journal Entry Modal Component */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-3xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white/10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {selectedEntry ? 'Edit Journal Entry' : 'New Journal Entry'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="Entry title..."
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    defaultValue={selectedEntry?.title}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content
                  </label>
                  <textarea
                    placeholder="Write your thoughts here..."
                    rows={8}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                    defaultValue={selectedEntry?.content}
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    💡 Tip: You'll be able to use a rich text editor here in the future!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Mood
                    </label>
                    <select
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      defaultValue={selectedEntry?.mood || ''}
                    >
                      <option value="">Select mood...</option>
                      <option value="great">Great 😄</option>
                      <option value="good">Good 🙂</option>
                      <option value="okay">Okay 😐</option>
                      <option value="bad">Bad 😔</option>
                      <option value="terrible">Terrible 😢</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      placeholder="tags, separated, by, commas"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      defaultValue={selectedEntry?.tags?.join(', ')}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-full transition-all duration-200"
                >
                  {selectedEntry ? 'Update Entry' : 'Create Entry'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
