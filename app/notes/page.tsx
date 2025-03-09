'use client';

import { useState, useEffect } from 'react';
import { Note } from '@/app/types';
import { getNotes, deleteNote, updateNote } from '@/app/lib/storage';
import CreateNoteModal from '@/app/components/CreateNoteModal';
import AlertModal from '@/app/components/AlertModal';
import { format } from 'date-fns';

export default function NotesPage() {

  const [mounted, setMounted] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [alert, setAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    isConfirmation?: boolean;
    onConfirm?: () => void;
  }>({
    show: false,
    title: '',
    message: '',
    type: 'info'
  });

  useEffect(() => {
    setMounted(true);
    setNotes(getNotes());
  }, []);

  // Don't render anything until mounted to prevent hydration errors
  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="absolute top-16 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl"></div>
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

  const handleSaveNote = () => {
    setNotes(getNotes());
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const handleDeleteNote = (id: string) => {
    setAlert({
      show: true,
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this note?',
      type: 'warning',
      isConfirmation: true,
      onConfirm: () => {
        try {
          deleteNote(id);
          setNotes(getNotes());
        } catch (error) {
          console.error('Error deleting note:', error);
          setAlert({
            show: true,
            title: 'Error',
            message: 'Failed to delete note',
            type: 'error'
          });
        }
      }
    });
  };

  const handlePinNote = (note: Note) => {
    updateNote(note.id, { isPinned: !note.isPinned });
    setNotes(getNotes());
  };

  const categories = Array.from(new Set(notes.map(note => note.category).filter(Boolean)));

  const filteredNotes = notes
    .filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || note.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="absolute top-16 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl"></div>
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 mb-6 transform hover:scale-[1.01] transition-transform border border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Your Notes</h1>
              <p className="text-gray-300 mt-2">Capture your thoughts and ideas</p>
            </div>
            <button
              onClick={() => {
                setSelectedNote(undefined);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Note
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 mb-8 transform hover:scale-[1.01] transition-transform border border-white/10">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`bg-white/5 backdrop-blur-lg rounded-3xl p-6 transform hover:scale-[1.01] transition-all duration-200 border ${
                note.isPinned ? 'border-purple-500/50' : 'border-white/10'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-white">{note.title}</h2>
                <button
                  onClick={() => handlePinNote(note)}
                  className={`p-2 rounded-xl ${
                    note.isPinned ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-gray-400'
                  } hover:scale-110 transition-transform`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.828.722a.5.5 0 01.354 0l7.071 3.536a.5.5 0 01.177.762l-4.243 4.243.707 7.071a.5.5 0 01-.854.353l-3.182-3.182-3.182 3.182a.5.5 0 01-.854-.353l.707-7.071L2.177 5.02a.5.5 0 01.177-.762L9.425.722z" />
                  </svg>
                </button>
              </div>

              {note.category && (
                <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full mb-3">
                  {note.category}
                </span>
              )}

              <p className="text-gray-300 mb-4 whitespace-pre-wrap">{note.content}</p>

              <div className="flex justify-between items-center text-sm text-gray-400 mt-4 pt-4 border-t border-white/10">
                <span>
                  {format(new Date(note.updatedAt), 'MMM d, yyyy')}
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEditNote(note)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNotes.length === 0 && (
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-12 text-center border border-white/10">
            <p className="text-gray-300 text-lg">
              {searchQuery || selectedCategory
                ? 'No notes match your search criteria'
                : 'No notes yet. Create your first note!'}
            </p>
          </div>
        )}

        <CreateNoteModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedNote(undefined);
          }}
          existingNote={selectedNote}
          onSave={handleSaveNote}
        />

        {alert.show && (
          <AlertModal
            title={alert.title}
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert({ ...alert, show: false })}
            isConfirmation={alert.isConfirmation}
            onConfirm={alert.onConfirm}
          />
        )}
      </div>
    </div>
  );
}
