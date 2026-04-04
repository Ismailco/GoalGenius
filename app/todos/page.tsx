'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { CalendarClock, Plus, Search, SquarePen, Trash2 } from 'lucide-react';
import { Todo } from '@/app/types';
import { AppPage, AppPageHeader } from '@/components/app/shared/AppPage';
import CreateTodoModal from '@/components/app/todos/CreateTodoModal';
import AlertModal from '@/components/common/AlertModal';
import {
  readAppSettings,
  subscribeToAppSettings,
} from '@/lib/app-settings';
import { deleteTodo, getTodos, toggleTodoComplete } from '@/lib/storage';

export default function TodosPage() {
  const [mounted, setMounted] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
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
    type: 'info',
  });

  useEffect(() => {
    const loadTodos = async () => {
      try {
        setShowCompleted(readAppSettings().showCompletedTodosByDefault);
        setMounted(true);
        const loadedTodos = await getTodos();
        setTodos(loadedTodos);
      } catch (error) {
        console.error('Error loading todos:', error);
        setAlert({
          show: true,
          title: 'Error',
          message: 'Failed to load todos',
          type: 'error',
        });
      }
    };

    loadTodos();

    const unsubscribe = subscribeToAppSettings(() => {
      setShowCompleted(readAppSettings().showCompletedTodosByDefault);
    });

    return unsubscribe;
  }, []);

  async function handleSaveTodo() {
    try {
      const updatedTodos = await getTodos();
      setTodos(updatedTodos);
    } catch (error) {
      console.error('Error loading todos:', error);
      setAlert({
        show: true,
        title: 'Error',
        message: 'Failed to refresh todos',
        type: 'error',
      });
    }
  }

  function handleEditTodo(todo: Todo) {
    setSelectedTodo(todo);
    setIsModalOpen(true);
  }

  function handleDeleteTodo(id: string) {
    setAlert({
      show: true,
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this todo?',
      type: 'warning',
      isConfirmation: true,
      onConfirm: async () => {
        try {
          await deleteTodo(id);
          const updatedTodos = await getTodos();
          setTodos(updatedTodos);
        } catch (error) {
          console.error('Error deleting todo:', error);
          setAlert({
            show: true,
            title: 'Error',
            message: 'Failed to delete todo',
            type: 'error',
          });
        }
      },
    });
  }

  async function handleToggleComplete(todo: Todo) {
    try {
      await toggleTodoComplete(todo.id);
      const updatedTodos = await getTodos();
      setTodos(updatedTodos);
    } catch (error) {
      console.error('Error toggling todo completion:', error);
      setAlert({
        show: true,
        title: 'Error',
        message: 'Failed to update todo status',
        type: 'error',
      });
    }
  }

  const categories = Array.from(new Set(todos.map((todo) => todo.category).filter(Boolean)));

  const filteredTodos = todos
    .filter((todo) => {
      const matchesSearch =
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || todo.category === selectedCategory;
      const matchesPriority = !priorityFilter || todo.priority === priorityFilter;
      const matchesCompletion = showCompleted || !todo.completed;
      return matchesSearch && matchesCategory && matchesPriority && matchesCompletion;
    })
    .sort((a, b) => {
      if (!a.completed && b.completed) return -1;
      if (a.completed && !b.completed) return 1;

      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const overdueCount = todos.filter((todo) => {
    if (!todo.dueDate || todo.completed) {
      return false;
    }

    return new Date(todo.dueDate) < new Date();
  }).length;
  const completedCount = todos.filter((todo) => todo.completed).length;
  const activeCount = todos.length - completedCount;

  function getPriorityClasses(priority: string) {
    switch (priority) {
      case 'high':
        return 'app-pill app-pill-danger';
      case 'medium':
        return 'app-pill app-pill-warning';
      case 'low':
        return 'app-pill app-pill-success';
      default:
        return 'app-pill app-pill-blue';
    }
  }

  if (!mounted) {
    return (
      <AppPage>
        <div className="page-skeleton animate-pulse p-6">
          <div className="h-3 w-24 rounded-full bg-white/10" />
          <div className="mt-4 h-10 w-2/5 rounded-2xl bg-white/10" />
          <div className="mt-3 h-4 w-1/3 rounded-full bg-white/5" />
        </div>
      </AppPage>
    );
  }

  return (
    <AppPage>
      <AppPageHeader
        eyebrow="Todos"
        title="A cleaner daily queue"
        description="Track what matters, keep completed work available when you need it, and reduce noise across the rest of the workspace."
        meta={
          <>
            <span className="app-pill app-pill-blue">{activeCount} active</span>
            <span className="app-pill app-pill-success">{completedCount} done</span>
            <span className="app-pill app-pill-danger">{overdueCount} overdue</span>
          </>
        }
        action={
          <button
            type="button"
            onClick={() => {
              setSelectedTodo(undefined);
              setIsModalOpen(true);
            }}
            className="app-button"
          >
            <Plus className="h-4 w-4" />
            Create Todo
          </button>
        }
      />

      <section className="surface-panel p-5 md:p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,0.72fr))]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search todos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="app-field pr-11"
            />
            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[var(--text-muted)]">
              <Search className="h-4 w-4" />
            </div>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="app-select"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="app-select"
          >
            <option value="">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <button type="button" onClick={() => setShowCompleted(!showCompleted)} className="app-button-secondary">
            {showCompleted ? 'Hide Completed' : 'Show Completed'}
          </button>
        </div>
      </section>

      <section className="surface-panel overflow-hidden">
        {filteredTodos.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="surface-empty mx-auto max-w-xl px-6 py-10">
              <p className="text-lg">
                {searchQuery || selectedCategory || priorityFilter
                  ? 'No todos match your current filters.'
                  : 'No todos yet. Create your first task to start building momentum.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredTodos.map((todo) => {
              const isOverdue =
                !!todo.dueDate &&
                !todo.completed &&
                new Date(todo.dueDate) < new Date();

              return (
                <article
                  key={todo.id}
                  className={`px-5 py-5 md:px-6 ${
                    todo.completed ? 'bg-[rgba(54,201,152,0.04)]' : ''
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 gap-4">
                      <button
                        type="button"
                        onClick={() => handleToggleComplete(todo)}
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                          todo.completed
                            ? 'border-[rgba(54,201,152,0.32)] bg-[rgba(54,201,152,0.16)] text-[#dbfff3]'
                            : 'border-white/20 text-transparent hover:border-[rgba(93,166,255,0.4)]'
                        }`}
                        aria-label={
                          todo.completed
                            ? `Mark ${todo.title} as incomplete`
                            : `Mark ${todo.title} as complete`
                        }
                      >
                        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                      </button>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-sm font-semibold ${
                              todo.completed
                                ? 'text-[var(--text-muted)] line-through'
                                : 'text-white'
                            }`}
                          >
                            {todo.title}
                          </span>
                          <span className={getPriorityClasses(todo.priority)}>
                            {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                          </span>
                          {todo.category ? (
                            <span className="app-pill app-pill-blue">{todo.category}</span>
                          ) : null}
                          {todo.dueDate ? (
                            <span className={isOverdue ? 'app-pill app-pill-danger' : 'app-pill app-pill-blue'}>
                              <CalendarClock className="h-3.5 w-3.5" />
                              Due {format(new Date(todo.dueDate), 'MMM d')}
                            </span>
                          ) : null}
                        </div>

                        {todo.description ? (
                          <p
                            className={`mt-2 text-sm leading-6 ${
                              todo.completed
                                ? 'text-[var(--text-muted)] line-through'
                                : 'text-[var(--text-secondary)]'
                            }`}
                          >
                            {todo.description}
                          </p>
                        ) : null}

                        <p className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
                          Created {format(new Date(todo.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end lg:self-auto">
                      <button
                        type="button"
                        onClick={() => handleEditTodo(todo)}
                        className="app-button-secondary !px-4"
                      >
                        <SquarePen className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="app-button-danger !px-4"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

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
    </AppPage>
  );
}
