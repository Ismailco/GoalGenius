type AuthErrorType =
  | 'USER_NOT_FOUND'
  | 'INVALID_PASSWORD'
  | 'EMAIL_EXISTS'
  | 'INVALID_EMAIL'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'UNKNOWN';

interface AuthErrorMapping {
  pattern: string | RegExp;
  type: AuthErrorType;
  message: string;
}

const AUTH_ERROR_MAPPINGS: AuthErrorMapping[] = [
  {
    pattern: 'user not found',
    type: 'USER_NOT_FOUND',
    message: 'No account found with this email. Please check your email or sign up.'
  },
  {
    pattern: /(invalid|incorrect) password/i,
    type: 'INVALID_PASSWORD',
    message: 'Incorrect password. Please try again.'
  },
  {
    pattern: /(email already exists|already registered)/i,
    type: 'EMAIL_EXISTS',
    message: 'An account with this email already exists. Please sign in instead.'
  },
  {
    pattern: 'invalid email',
    type: 'INVALID_EMAIL',
    message: 'Please enter a valid email address.'
  },
  {
    pattern: /(network|connection)/i,
    type: 'NETWORK_ERROR',
    message: 'Unable to connect to the server. Please check your internet connection.'
  },
  {
    pattern: 'timeout',
    type: 'TIMEOUT',
    message: 'The request took too long. Please try again.'
  }
];

export interface AuthError {
  type: AuthErrorType;
  message: string;
}

export const getAuthError = (error: unknown): AuthError => {
  // Handle string errors
  const errorMessage = error instanceof Error
    ? error.message.toLowerCase()
    : typeof error === 'string'
      ? error.toLowerCase()
      : typeof error === 'object' && error && 'message' in error
        ? (error as { message: string }).message.toLowerCase()
        : '';

  // Find matching error mapping
  const mapping = AUTH_ERROR_MAPPINGS.find(m =>
    typeof m.pattern === 'string'
      ? errorMessage.includes(m.pattern)
      : m.pattern.test(errorMessage)
  );

  if (mapping) {
    return {
      type: mapping.type,
      message: mapping.message
    };
  }

  // Default error
  return {
    type: 'UNKNOWN',
    message: 'Something went wrong. Please try again later.'
  };
};
