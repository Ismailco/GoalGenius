// Custom error types
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class StorageError extends AppError {
  constructor(message: string) {
    super(message, 'STORAGE_ERROR', 500);
    this.name = 'StorageError';
  }
}

// Error codes and messages mapping
export const ERROR_MESSAGES = {
  // Validation Errors
  VALIDATION_ERROR: 'The provided data is invalid.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_DATE: 'Please enter a valid date.',
  INVALID_FORMAT: 'The format of the provided data is invalid.',

  // Storage Errors
  STORAGE_ERROR: 'Failed to save data to storage.',
  STORAGE_QUOTA_EXCEEDED: 'Storage quota exceeded. Please free up some space.',
  STORAGE_NOT_AVAILABLE: 'Storage is not available. Please try again later.',

  // Network Errors
  NETWORK_ERROR: 'Network connection error.',
  NETWORK_TIMEOUT: 'The operation timed out. Please check your connection.',
  OFFLINE: 'You are currently offline. Please check your connection.',

  // Resource Errors
  NOT_FOUND: 'The requested resource was not found.',
  GOAL_NOT_FOUND: 'The specified goal could not be found.',
  MILESTONE_NOT_FOUND: 'The specified milestone could not be found.',
  NOTE_NOT_FOUND: 'The specified note could not be found.',
  TODO_NOT_FOUND: 'The specified todo could not be found.',
  CHECKIN_NOT_FOUND: 'The specified check-in could not be found.',

  // Data Errors
  INVALID_GOAL_DATA: 'The goal data provided is invalid.',
  INVALID_MILESTONE_DATA: 'The milestone data provided is invalid.',
  INVALID_NOTE_DATA: 'The note data provided is invalid.',
  INVALID_TODO_DATA: 'The todo data provided is invalid.',
  INVALID_CHECKIN_DATA: 'The check-in data provided is invalid.',

  // Operation Errors
  OPERATION_FAILED: 'The operation failed. Please try again.',
  DUPLICATE_ENTRY: 'This item already exists.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',

  // Auth Errors
  AUTH_ERROR: 'Authentication error occurred.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',

  // Form Errors
  FORM_VALIDATION_ERROR: 'Please check the form for errors.',
  FORM_SUBMISSION_FAILED: 'Failed to submit the form. Please try again.',
} as const;

// Error logging function
export function logError(error: Error, context?: Record<string, unknown>) {
  // TODO: Replace with proper error logging service
  console.error('Error:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
}

// Helper function to get user-friendly error message
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  return 'An unexpected error occurred.';
}

// Helper function to handle async operations with loading state
export async function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  setLoading?: (loading: boolean) => void,
  onError?: (error: Error) => void
): Promise<T | undefined> {
  try {
    setLoading?.(true);
    const result = await operation();
    return result;
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)));
    onError?.(error instanceof Error ? error : new Error(String(error)));
    return undefined;
  } finally {
    setLoading?.(false);
  }
}
