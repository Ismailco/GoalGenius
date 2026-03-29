export type AuthMode = "signin" | "signup";

type AuthErrorType =
  | "AUTHENTICATION_FAILED"
  | "ACCOUNT_CREATION_FAILED"
  | "EMAIL_NOT_VERIFIED"
  | "INVALID_EMAIL"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "UNKNOWN";

interface AuthErrorMapping {
  pattern: string | RegExp;
  type: AuthErrorType;
  message: string;
}

const AUTH_ERROR_MAPPINGS: AuthErrorMapping[] = [
  {
    pattern:
      /(invalid email or password|user not found|(invalid|incorrect) password)/i,
    type: "AUTHENTICATION_FAILED",
    message: "Invalid email or password. Please try again.",
  },
  {
    pattern:
      /(email already exists|already registered|user already exists|use another email|email already in use)/i,
    type: "ACCOUNT_CREATION_FAILED",
    message:
      "Unable to create your account. Please review your details and try again.",
  },
  {
    pattern: "email not verified",
    type: "EMAIL_NOT_VERIFIED",
    message: "Please verify your email before signing in.",
  },
  {
    pattern: "invalid email",
    type: "INVALID_EMAIL",
    message: "Please enter a valid email address.",
  },
  {
    pattern: /(network|connection)/i,
    type: "NETWORK_ERROR",
    message:
      "Unable to connect to the server. Please check your internet connection.",
  },
  {
    pattern: "timeout",
    type: "TIMEOUT",
    message: "The request took too long. Please try again.",
  },
];

export interface AuthError {
  type: AuthErrorType;
  message: string;
}

const DEFAULT_AUTH_ERROR_MESSAGES: Record<AuthMode, string> = {
  signin: "Authentication failed. Please try again.",
  signup:
    "Unable to create your account. Please review your details and try again.",
};

export const getAuthError = (error: unknown, mode: AuthMode): AuthError => {
  // Handle string errors
  const errorMessage =
    error instanceof Error
      ? error.message.toLowerCase()
      : typeof error === "string"
        ? error.toLowerCase()
        : typeof error === "object" && error && "message" in error
          ? (error as { message: string }).message.toLowerCase()
          : "";

  // Find matching error mapping
  const mapping = AUTH_ERROR_MAPPINGS.find((m) =>
    typeof m.pattern === "string"
      ? errorMessage.includes(m.pattern)
      : m.pattern.test(errorMessage),
  );

  if (mapping) {
    return {
      type: mapping.type,
      message: mapping.message,
    };
  }

  // Default error
  return {
    type: "UNKNOWN",
    message: DEFAULT_AUTH_ERROR_MESSAGES[mode],
  };
};
