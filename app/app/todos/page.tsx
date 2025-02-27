'use client';

import { useState, useEffect } from 'react';
import { Todo } from '@/app/types';
import { getTodos, deleteTodo, toggleTodoComplete } from '@/app/lib/storage';
import CreateTodoModal from '@/app/components/CreateTodoModal';
import AlertModal from '@/app/components/AlertModal';
import { format } from 'date-fns';

export default function TodosPage() {
  const [mounted, setMounted] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [showCompleted, setShowCompleted] = useState(false);
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
    setTodos(getTodos());
  }, []);

  // Don't render anything until mounted to prevent hydration errors
  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl"></div>
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

  const handleSaveTodo = () => {
    setTodos(getTodos());
  };

  const handleEditTodo = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsModalOpen(true);
  };

  const handleDeleteTodo = (id: string) => {
    setAlert({
      show: true,
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this todo?',
      type: 'warning',
      isConfirmation: true,
      onConfirm: () => {
        try {
          deleteTodo(id);
          setTodos(getTodos());
        } catch (error) {
          console.error('Error deleting todo:', error);
          setAlert({
            show: true,
            title: 'Error',
            message: 'Failed to delete todo',
            type: 'error'
          });
        }
      }
    });
  };

  const handleToggleComplete = (todo: Todo) => {
    toggleTodoComplete(todo.id);
    setTodos(getTodos());
  };

  const categories = Array.from(new Set(todos.map(todo => todo.category).filter(Boolean)));

  const filteredTodos = todos
    .filter(todo => {
      const matchesSearch = todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || todo.category === selectedCategory;
      const matchesPriority = !priorityFilter || todo.priority === priorityFilter;
      const matchesCompletion = showCompleted || !todo.completed;
      return matchesSearch && matchesCategory && matchesPriority && matchesCompletion;
    })
    .sort((a, b) => {
      // Sort by completion status
      if (!a.completed && b.completed) return -1;
      if (a.completed && !b.completed) return 1;

      // Then by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by due date if available
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }

      // Finally by creation date
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-400 bg-red-500/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'low':
        return 'text-green-400 bg-green-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl"></div>
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 mb-8 transform hover:scale-[1.01] transition-transform border border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Your Todos</h1>
              <p className="text-gray-300 mt-2">Stay organized and productive</p>
            </div>
            <button
              onClick={() => {
                setSelectedTodo(undefined);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Todo
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 mb-8 transform hover:scale-[1.01] transition-transform border border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search todos..."
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
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className={`px-4 py-2 border rounded-xl transition-colors ${
                showCompleted
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                  : 'bg-white/10 border-white/20 text-gray-300'
              }`}
            >
              {showCompleted ? 'Hide Completed' : 'Show Completed'}
            </button>
          </div>
        </div>

        {/* Todos Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredTodos.map((todo) => (
            <div
              key={todo.id}
              className={`bg-white/5 backdrop-blur-lg rounded-3xl p-6 transform hover:scale-[1.01] transition-all duration-200 border ${
                todo.completed ? 'border-green-500/50' : 'border-white/10'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => handleToggleComplete(todo)}
                    className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      todo.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-400 hover:border-purple-400'
                    }`}
                  >
                    {todo.completed && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1">
                    <h2 className={`text-xl font-semibold text-white ${todo.completed ? 'line-through text-gray-400' : ''}`}>
                      {todo.title}
                    </h2>
                    {todo.description && (
                      <p className={`text-gray-300 mt-1 ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                        {todo.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor(todo.priority)}`}>
                  {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)} Priority
                </span>
                {todo.category && (
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full">
                    {todo.category}
                  </span>
                )}
                {todo.dueDate && (
                  <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                    new Date(todo.dueDate) < new Date() ? 'bg-red-500/20 text-red-400' : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    Due {format(new Date(todo.dueDate), 'MMM d, yyyy')}
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center text-sm text-gray-400 mt-4 pt-4 border-t border-white/10">
                <span>
                  Created {format(new Date(todo.createdAt), 'MMM d, yyyy')}
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEditTodo(todo)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTodos.length === 0 && (
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-12 text-center border border-white/10">
            <p className="text-gray-300 text-lg">
              {searchQuery || selectedCategory || priorityFilter
                ? 'No todos match your search criteria'
                : 'No todos yet. Create your first todo!'}
            </p>
          </div>
        )}

        <CreateTodoModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTodo(undefined);
          }}
          existingTodo={selectedTodo}
          onSave={handleSaveTodo}
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
