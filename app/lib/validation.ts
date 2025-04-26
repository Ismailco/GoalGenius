import DOMPurify from 'dompurify';
import validator from 'validator';

export interface ValidationResult {
  isValid: boolean;
  sanitizedValue: string;
  error?: string;
}

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_CATEGORY_LENGTH = 50;

// Function to sanitize data before storage
export const sanitizeForStorage = (value: string): string => {
  if (!value) return value;
  // First sanitize HTML
  let sanitized = DOMPurify.sanitize(value);
  // Then escape special characters
  sanitized = validator.escape(sanitized);
  return sanitized;
};

// Function to unescape data for display
export const unescapeForDisplay = (value: string): string => {
  if (!value) return value;
  return validator.unescape(value);
};

export const validateAndSanitizeInput = (
  input: string,
  type: 'title' | 'description' | 'category' | 'date',
  required: boolean = true
): ValidationResult => {
  // Keep original input for validation
  const value = input;

  // Check for required fields
  if (required && value.trim().length === 0) {
    return {
      isValid: false,
      sanitizedValue: value,
      error: 'This field is required',
    };
  }

  // If field is optional and empty, it's valid
  if (!required && value.trim().length === 0) {
    return {
      isValid: true,
      sanitizedValue: value,
    };
  }

  // Type-specific validation
  switch (type) {
    case 'title':
      if (value.length > MAX_TITLE_LENGTH) {
        return {
          isValid: false,
          sanitizedValue: value,
          error: `Title must be ${MAX_TITLE_LENGTH} characters or less`,
        };
      }
      break;

    case 'description':
      if (value.length > MAX_DESCRIPTION_LENGTH) {
        return {
          isValid: false,
          sanitizedValue: value,
          error: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`,
        };
      }
      break;

    case 'category':
      if (value.length > MAX_CATEGORY_LENGTH) {
        return {
          isValid: false,
          sanitizedValue: value,
          error: `Category must be ${MAX_CATEGORY_LENGTH} characters or less`,
        };
      }
      break;

    case 'date':
      if (!validator.isDate(value)) {
        return {
          isValid: false,
          sanitizedValue: value,
          error: 'Invalid date format',
        };
      }
      break;
  }

  return {
    isValid: true,
    sanitizedValue: value,
  };
};
