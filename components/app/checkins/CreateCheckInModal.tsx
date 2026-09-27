'use client';

import { useState, useEffect, useRef } from 'react';
import { CheckIn, Goal } from '@/app/types';
import { createCheckIn, updateCheckIn } from '@/lib/storage';
import { validateAndSanitizeInput, ValidationResult, unescapeForDisplay } from '@/lib/validation';
import { handleAsyncOperation, getUserFriendlyErrorMessage } from '@/lib/error';
import { LoadingOverlay } from '@/components/common/LoadingSpinner';
import { todayDateOnly } from '@/lib/domain/date-only';
import AppModal from '@/components/app/shared/AppModal';

interface CreateCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingCheckIn?: CheckIn;
  onSave?: (checkIn: CheckIn) => void;
  defaultDate?: string;
  goalId?: string | null;
  availableGoals?: Goal[];
  allowGoalSelection?: boolean;
}

const EMPTY_GOALS: Goal[] = [];

interface FormErrors {
  date?: string;
  accomplishments?: (string | undefined)[];
  challenges?: (string | undefined)[];
  goals?: (string | undefined)[];
  notes?: string;
}

export default function CreateCheckInModal({
  isOpen,
  onClose,
  existingCheckIn,
  onSave,
  defaultDate,
  goalId = null,
  availableGoals = EMPTY_GOALS,
  allowGoalSelection = false,
}: CreateCheckInModalProps) {
  const [date, setDate] = useState(defaultDate || todayDateOnly());
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(goalId);
  const [mood, setMood] = useState<'great' | 'good' | 'okay' | 'bad' | 'terrible'>('good');
  const [energy, setEnergy] = useState<'high' | 'medium' | 'low'>('medium');
  const [accomplishments, setAccomplishments] = useState<string[]>(['']);
  const [challenges, setChallenges] = useState<string[]>(['']);
  const [goals, setGoals] = useState<string[]>(['']);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    modalRef.current?.querySelector<HTMLElement>('input, textarea, select, button')?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    try {
      if (existingCheckIn) {
        setDate(existingCheckIn.date);
        setMood(existingCheckIn.mood);
        setEnergy(existingCheckIn.energy);
        setSelectedGoalId(existingCheckIn.goalId ?? goalId ?? null);

        const parseArrayField = (field: string[] | string): string[] => {
          if (Array.isArray(field)) return field;
          try {
            const parsed = JSON.parse(field);
            return Array.isArray(parsed) ? parsed : [''];
          } catch {
            return [''];
          }
        };

        const accomplishmentsArray = parseArrayField(existingCheckIn.accomplishments);
        const challengesArray = parseArrayField(existingCheckIn.challenges);
        const goalsArray = parseArrayField(existingCheckIn.goals);

        setAccomplishments(accomplishmentsArray.map(a => unescapeForDisplay(a)));
        setChallenges(challengesArray.map(c => unescapeForDisplay(c)));
        setGoals(goalsArray.map(g => unescapeForDisplay(g)));
        setNotes(existingCheckIn.notes ? unescapeForDisplay(existingCheckIn.notes) : '');
      } else {
        setDate(defaultDate || todayDateOnly());
        setMood('good');
        setEnergy('medium');
        setSelectedGoalId(goalId ?? null);
        setAccomplishments(['']);
        setChallenges(['']);
        setGoals(['']);
        setNotes('');
      }
      setErrors({});
    } catch {
      setAccomplishments(['']);
      setChallenges(['']);
      setGoals(['']);
    }
  }, [defaultDate, existingCheckIn, goalId, isOpen]);

  if (!isOpen) return null;

  const validateField = (name: string, value: string): ValidationResult => {
    switch (name) {
      case 'date':
        return validateAndSanitizeInput(value, 'date', true);
      case 'accomplishment':
      case 'challenge':
      case 'goal':
        return validateAndSanitizeInput(value, 'title', false);
      case 'notes':
        return validateAndSanitizeInput(value, 'description', false);
      default:
        return { isValid: true, sanitizedValue: value };
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const validationResult = validateField(name, value);

    // Update the form data with sanitized value
    switch (name) {
      case 'date':
        setDate(validationResult.sanitizedValue);
        break;
      case 'notes':
        setNotes(validationResult.sanitizedValue);
        break;
    }

    // Update errors
    setErrors(prev => ({
      ...prev,
      [name]: validationResult.error
    }));
  };

  const handleArrayInput = (
    index: number,
    value: string,
    array: string[],
    setArray: (value: string[]) => void,
    type: 'accomplishment' | 'challenge' | 'goal'
  ) => {
    const validationResult = validateField(type, value);
    const newArray = [...array];
    newArray[index] = validationResult.sanitizedValue;

    // Add new empty field if typing in the last field
    if (index === array.length - 1 && validationResult.sanitizedValue !== '') {
      newArray.push('');
    }

    // Remove empty fields except the last one
    if (validationResult.sanitizedValue === '' && index !== array.length - 1) {
      newArray.splice(index, 1);
    }

    setArray(newArray);

    // Update errors for array fields
    setErrors(prev => {
      const currentErrors = prev[type + 's' as keyof FormErrors] as (string | undefined)[] | undefined;
      const newErrors = currentErrors ? [...currentErrors] : [];
      newErrors[index] = validationResult.error;
      return {
        ...prev,
        [type + 's']: newErrors
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submission
    const dateValidation = validateField('date', date);
    const notesValidation = validateField('notes', notes);

    const newErrors: FormErrors = {};
    if (!dateValidation.isValid) {
      newErrors.date = dateValidation.error;
    }
    if (!notesValidation.isValid) {
      newErrors.notes = notesValidation.error;
    }

    // Validate array fields
    const accomplishmentErrors: (string | undefined)[] = [];
    const challengeErrors: (string | undefined)[] = [];
    const goalErrors: (string | undefined)[] = [];

    accomplishments.forEach((acc, index) => {
      const validation = validateField('accomplishment', acc);
      accomplishmentErrors[index] = !validation.isValid ? validation.error : undefined;
    });

    challenges.forEach((challenge, index) => {
      const validation = validateField('challenge', challenge);
      challengeErrors[index] = !validation.isValid ? validation.error : undefined;
    });

    goals.forEach((goal, index) => {
      const validation = validateField('goal', goal);
      goalErrors[index] = !validation.isValid ? validation.error : undefined;
    });

    if (accomplishmentErrors.some(error => error !== undefined)) newErrors.accomplishments = accomplishmentErrors;
    if (challengeErrors.some(error => error !== undefined)) newErrors.challenges = challengeErrors;
    if (goalErrors.some(error => error !== undefined)) newErrors.goals = goalErrors;

    // If there are any errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await handleAsyncOperation(
      async () => {
        const checkInData = {
          goalId: allowGoalSelection ? selectedGoalId : goalId ?? existingCheckIn?.goalId ?? null,
          date: dateValidation.sanitizedValue,
          mood: mood as CheckIn['mood'],
          energy: energy as CheckIn['energy'],
          accomplishments: accomplishments.filter(Boolean).map(acc => validateField('accomplishment', acc).sanitizedValue),
          challenges: challenges.filter(Boolean).map(challenge => validateField('challenge', challenge).sanitizedValue),
          goals: goals.filter(Boolean).map(goal => validateField('goal', goal).sanitizedValue),
          notes: notesValidation.sanitizedValue || undefined,
        };

        const savedCheckIn = await (existingCheckIn
          ? updateCheckIn(existingCheckIn.id, checkInData)
          : createCheckIn(checkInData));

        onSave?.(savedCheckIn);
        onClose();
      },
      setIsLoading,
      (error) => {
        window.addNotification?.({
          title: 'Error',
          message: getUserFriendlyErrorMessage(error),
          type: 'error'
        });
      }
    );
  };

  return (
    <AppModal title={existingCheckIn ? 'Edit Check-in' : 'Daily Check-in'} onClose={onClose} size="lg" closeDisabled={isLoading}>
      <div ref={modalRef} className="relative">
        {isLoading && <LoadingOverlay role="status" aria-label="Saving check-in..." />}
          <form onSubmit={handleSubmit} aria-label={existingCheckIn ? 'Edit check-in form' : 'Create check-in form'}>
            <div className="space-y-6">
              <div>
                <label htmlFor="date" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={date}
                  onChange={handleChange}
                  className={`app-field ${errors.date ? 'border-red-500' : ''}`}
                  required
                  aria-invalid={!!errors.date}
                  aria-describedby={errors.date ? "date-error" : undefined}
                />
                {errors.date && (
                  <p id="date-error" className="app-form-error mt-1" role="alert">
                    {errors.date}
                  </p>
                )}
              </div>

              {allowGoalSelection ? (
                <div>
                  <label htmlFor="check-in-goal" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                    Goal (optional)
                  </label>
                  <select
                    id="check-in-goal"
                    value={selectedGoalId ?? ''}
                    onChange={(event) => setSelectedGoalId(event.target.value || null)}
                    className="app-select"
                  >
                    <option value="">Standalone check-in</option>
                    {availableGoals.map((goal) => <option key={goal.id} value={goal.id}>{goal.title}</option>)}
                  </select>
                </div>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                    Mood
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5" role="radiogroup" aria-label="Mood selection">
                    {(['great', 'good', 'okay', 'bad', 'terrible'] as const).map((moodOption) => (
                      <button
                        key={moodOption}
                        type="button"
                        onClick={() => setMood(moodOption)}
                        className={`min-h-10 rounded-[var(--radius-control)] border px-3 py-2 text-sm font-semibold capitalize transition-colors ${
                          mood === moodOption
                            ? 'border-[var(--brand-border)] bg-[var(--brand-subtle)] text-white'
                            : 'border-[var(--border-default)] bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
                        }`}
                        role="radio"
                        aria-checked={mood === moodOption}
                        aria-label={`Mood: ${moodOption}`}
                      >
                        <span>{moodOption}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                    Energy
                  </label>
                  <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Energy level selection">
                    {(['high', 'medium', 'low'] as const).map((energyOption) => (
                      <button
                        key={energyOption}
                        type="button"
                        onClick={() => setEnergy(energyOption)}
                        className={`min-h-10 rounded-[var(--radius-control)] border px-3 py-2 text-sm font-semibold capitalize transition-colors ${
                          energy === energyOption
                            ? 'border-[var(--brand-border)] bg-[var(--brand-subtle)] text-white'
                            : 'border-[var(--border-default)] bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
                        }`}
                        role="radio"
                        aria-checked={energy === energyOption}
                        aria-label={`Energy level: ${energyOption}`}
                      >
                        <span>{energyOption}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                  Progress
                </label>
                <div className="space-y-2">
                  {accomplishments.map((accomplishment, index) => (
                    <div key={index}>
                      <input
                        type="text"
                        value={accomplishment}
                        onChange={(e) => handleArrayInput(index, e.target.value, accomplishments, setAccomplishments, 'accomplishment')}
                        placeholder={index === 0 ? "Enter an accomplishment" : "Add another accomplishment (optional)"}
                        className={`app-field ${errors.accomplishments?.[index] ? 'border-red-500' : ''}`}
                        aria-label={`Accomplishment ${index + 1}`}
                        aria-invalid={!!errors.accomplishments?.[index]}
                        aria-describedby={errors.accomplishments?.[index] ? `accomplishment-error-${index}` : undefined}
                      />
                      {errors.accomplishments?.[index] && (
                        <p id={`accomplishment-error-${index}`} className="app-form-error mt-1" role="alert">
                          {errors.accomplishments[index]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                  What challenges did you face?
                </label>
                <div className="space-y-2">
                  {challenges.map((challenge, index) => (
                    <div key={index}>
                      <input
                        type="text"
                        value={challenge}
                        onChange={(e) => handleArrayInput(index, e.target.value, challenges, setChallenges, 'challenge')}
                        placeholder={index === 0 ? "Enter a challenge" : "Add another challenge (optional)"}
                        className={`app-field ${errors.challenges?.[index] ? 'border-red-500' : ''}`}
                        aria-label={`Challenge ${index + 1}`}
                        aria-invalid={!!errors.challenges?.[index]}
                        aria-describedby={errors.challenges?.[index] ? `challenge-error-${index}` : undefined}
                      />
                      {errors.challenges?.[index] && (
                        <p id={`challenge-error-${index}`} className="app-form-error mt-1" role="alert">
                          {errors.challenges[index]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                  Next
                </label>
                <div className="space-y-2">
                  {goals.map((goal, index) => (
                    <div key={index}>
                      <input
                        type="text"
                        value={goal}
                        onChange={(e) => handleArrayInput(index, e.target.value, goals, setGoals, 'goal')}
                        placeholder={index === 0 ? "Enter a goal" : "Add another goal (optional)"}
                        className={`app-field ${errors.goals?.[index] ? 'border-red-500' : ''}`}
                        aria-label={`Goal ${index + 1}`}
                        aria-invalid={!!errors.goals?.[index]}
                        aria-describedby={errors.goals?.[index] ? `goal-error-${index}` : undefined}
                      />
                      {errors.goals?.[index] && (
                        <p id={`goal-error-${index}`} className="app-form-error mt-1" role="alert">
                          {errors.goals[index]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                  Notes (optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={notes}
                  onChange={handleChange}
                  rows={3}
                  className={`app-field ${errors.notes ? 'border-red-500' : ''}`}
                  placeholder="Any other thoughts or reflections..."
                  aria-invalid={!!errors.notes}
                  aria-describedby={errors.notes ? "notes-error" : undefined}
                />
                {errors.notes && (
                  <p id="notes-error" className="app-form-error mt-1" role="alert">
                    {errors.notes}
                  </p>
                )}
              </div>
            </div>

            <div className="app-form-actions mt-8">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="app-button-secondary"
                aria-label="Cancel check-in"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="app-button"
                aria-label={existingCheckIn ? 'Save check-in changes' : 'Submit check-in'}
              >
                {existingCheckIn ? 'Save Changes' : 'Submit Check-in'}
              </button>
            </div>
          </form>
      </div>
    </AppModal>
  );
}
