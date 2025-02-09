'use client';

import { useState, useEffect } from 'react';
import { CheckIn } from '@/app/types';
import { createCheckIn, updateCheckIn } from '@/app/lib/storage';
import { validateAndSanitizeInput, ValidationResult, unescapeForDisplay } from '@/app/lib/validation';

interface CreateCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingCheckIn?: CheckIn;
  onSave?: (checkIn: CheckIn) => void;
  defaultDate?: string;
}

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
}: CreateCheckInModalProps) {
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [mood, setMood] = useState<'great' | 'good' | 'okay' | 'bad' | 'terrible'>('good');
  const [energy, setEnergy] = useState<'high' | 'medium' | 'low'>('medium');
  const [accomplishments, setAccomplishments] = useState<string[]>(['']);
  const [challenges, setChallenges] = useState<string[]>(['']);
  const [goals, setGoals] = useState<string[]>(['']);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (existingCheckIn) {
      setDate(existingCheckIn.date);
      setMood(existingCheckIn.mood);
      setEnergy(existingCheckIn.energy);
      setAccomplishments(existingCheckIn.accomplishments.map(a => unescapeForDisplay(a)));
      setChallenges(existingCheckIn.challenges.map(c => unescapeForDisplay(c)));
      setGoals(existingCheckIn.goals.map(g => unescapeForDisplay(g)));
      setNotes(existingCheckIn.notes ? unescapeForDisplay(existingCheckIn.notes) : '');
    }
  }, [existingCheckIn]);

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

  const handleSubmit = (e: React.FormEvent) => {
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

    const checkInData = {
      date: dateValidation.sanitizedValue,
      mood: mood as CheckIn['mood'],
      energy: energy as CheckIn['energy'],
      accomplishments: accomplishments.filter(Boolean).map(acc => validateField('accomplishment', acc).sanitizedValue),
      challenges: challenges.filter(Boolean).map(challenge => validateField('challenge', challenge).sanitizedValue),
      goals: goals.filter(Boolean).map(goal => validateField('goal', goal).sanitizedValue),
      notes: notesValidation.sanitizedValue || undefined,
    };

    const savedCheckIn = existingCheckIn
      ? updateCheckIn(existingCheckIn.id, checkInData)
      : createCheckIn(checkInData);

    onSave?.(savedCheckIn);
    onClose();
  };

  const getMoodEmoji = (moodValue: string) => {
    switch (moodValue) {
      case 'great': return '😄';
      case 'good': return '🙂';
      case 'okay': return '😐';
      case 'bad': return '😕';
      case 'terrible': return '😢';
      default: return '🙂';
    }
  };

  const getEnergyIcon = (energyValue: string) => {
    switch (energyValue) {
      case 'high': return '⚡️';
      case 'medium': return '✨';
      case 'low': return '🔋';
      default: return '✨';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl w-full max-w-3xl border border-white/10 max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-white/10 flex-shrink-0">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            {existingCheckIn ? 'Edit Check-in' : 'Daily Check-in'}
          </h2>
        </div>
        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={date}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 bg-white/10 border ${
                    errors.date ? 'border-red-500' : 'border-white/20'
                  } rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                  required
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-500">{errors.date}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    How are you feeling today?
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {(['great', 'good', 'okay', 'bad', 'terrible'] as const).map((moodOption) => (
                      <button
                        key={moodOption}
                        type="button"
                        onClick={() => setMood(moodOption as 'great' | 'good' | 'okay' | 'bad' | 'terrible')}
                        className={`p-2 rounded-xl border transition-all ${
                          mood === moodOption
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-2xl mb-1">{getMoodEmoji(moodOption)}</span>
                        <span className="block text-xs capitalize">{moodOption}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Energy Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['high', 'medium', 'low'] as const).map((energyOption) => (
                      <button
                        key={energyOption}
                        type="button"
                        onClick={() => setEnergy(energyOption as 'high' | 'medium' | 'low')}
                        className={`p-2 rounded-xl border transition-all ${
                          energy === energyOption
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-2xl mb-1">{getEnergyIcon(energyOption)}</span>
                        <span className="block text-xs capitalize">{energyOption}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  What did you accomplish today?
                </label>
                <div className="space-y-2">
                  {accomplishments.map((accomplishment, index) => (
                    <div key={index}>
                      <input
                        type="text"
                        value={accomplishment}
                        onChange={(e) => handleArrayInput(index, e.target.value, accomplishments, setAccomplishments, 'accomplishment')}
                        placeholder={index === 0 ? "Enter an accomplishment" : "Add another accomplishment (optional)"}
                        className={`w-full px-4 py-2 bg-white/10 border ${
                          errors.accomplishments?.[index] ? 'border-red-500' : 'border-white/20'
                        } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                      />
                      {errors.accomplishments?.[index] && (
                        <p className="mt-1 text-sm text-red-500">{errors.accomplishments[index]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
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
                        className={`w-full px-4 py-2 bg-white/10 border ${
                          errors.challenges?.[index] ? 'border-red-500' : 'border-white/20'
                        } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                      />
                      {errors.challenges?.[index] && (
                        <p className="mt-1 text-sm text-red-500">{errors.challenges[index]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Goals for tomorrow
                </label>
                <div className="space-y-2">
                  {goals.map((goal, index) => (
                    <div key={index}>
                      <input
                        type="text"
                        value={goal}
                        onChange={(e) => handleArrayInput(index, e.target.value, goals, setGoals, 'goal')}
                        placeholder={index === 0 ? "Enter a goal" : "Add another goal (optional)"}
                        className={`w-full px-4 py-2 bg-white/10 border ${
                          errors.goals?.[index] ? 'border-red-500' : 'border-white/20'
                        } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                      />
                      {errors.goals?.[index] && (
                        <p className="mt-1 text-sm text-red-500">{errors.goals[index]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
                  Additional Notes (optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={notes}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-4 py-2 bg-white/10 border ${
                    errors.notes ? 'border-red-500' : 'border-white/20'
                  } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                  placeholder="Any other thoughts or reflections..."
                />
                {errors.notes && (
                  <p className="mt-1 text-sm text-red-500">{errors.notes}</p>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl hover:from-indigo-600 hover:to-purple-600 transform hover:scale-[1.02] transition-all duration-200"
              >
                {existingCheckIn ? 'Save Changes' : 'Submit Check-in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
