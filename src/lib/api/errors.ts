export interface ApiErrorDetail {
  path: string;
  message: string;
}

interface ApiErrorOptions {
  status: number;
  message: string;
  rawMessage: string;
  errors?: ApiErrorDetail[];
}

const TECHNICAL_ERROR_PATTERNS = [
  /sequelize/i,
  /postgres/i,
  /sql/i,
  /stack/i,
  /column\s+".*"\s+does not exist/i,
  /relation\s+".*"\s+does not exist/i,
  /invalid input syntax/i,
  /constraint/i,
  /internal server error/i,
];

const isTechnicalErrorMessage = (message: string): boolean =>
  TECHNICAL_ERROR_PATTERNS.some((pattern) => pattern.test(message));

const getGenericStatusMessage = (status: number): string => {
  if (status >= 500) {
    return "Something went wrong. Please try again later.";
  }

  if (status === 401) {
    return "Authentication is required. Please sign in and try again.";
  }

  if (status === 403) {
    return "You do not have permission to continue.";
  }

  if (status === 404) {
    return "The requested resource could not be found.";
  }

  return "Unable to complete your request right now.";
};

const normalizeErrorMessage = ({
  status,
  rawMessage,
  errors,
}: Pick<ApiErrorOptions, "status" | "rawMessage" | "errors">): string => {
  const trimmedMessage = rawMessage.trim();

  if (!trimmedMessage) {
    return getGenericStatusMessage(status);
  }

  if (trimmedMessage === "Validation failed" && (errors?.length ?? 0) > 0) {
    return "Please correct the highlighted fields and try again.";
  }

  if (status >= 500 || isTechnicalErrorMessage(trimmedMessage)) {
    return getGenericStatusMessage(status);
  }

  return trimmedMessage;
};

export class ApiError extends Error {
  status: number;
  rawMessage: string;
  errors: ApiErrorDetail[];

  constructor(options: ApiErrorOptions) {
    super(
      normalizeErrorMessage({
        status: options.status,
        rawMessage: options.rawMessage,
        errors: options.errors,
      }),
    );
    this.name = "ApiError";
    this.status = options.status;
    this.rawMessage = options.rawMessage;
    this.errors = options.errors ?? [];
  }
}

export const buildApiError = async (response: Response): Promise<ApiError> => {
  let rawMessage = response.statusText || "Request failed";
  let errors: ApiErrorDetail[] = [];

  try {
    const payload = (await response.json()) as {
      message?: unknown;
      errors?: unknown;
    };

    if (typeof payload.message === "string" && payload.message.trim()) {
      rawMessage = payload.message;
    }

    if (Array.isArray(payload.errors)) {
      errors = payload.errors.flatMap((entry) => {
        if (!entry || typeof entry !== "object") {
          return [];
        }

        const candidate = entry as {
          path?: unknown;
          message?: unknown;
        };

        if (
          typeof candidate.path === "string" &&
          typeof candidate.message === "string"
        ) {
          return [{ path: candidate.path, message: candidate.message }];
        }

        return [];
      });
    }
  } catch {
    // Ignore payload parsing errors and use the status text fallback.
  }

  return new ApiError({
    status: response.status,
    message: rawMessage,
    rawMessage,
    errors,
  });
};

export const getApiFieldErrors = (
  error: unknown,
): Record<string, string> => {
  if (!(error instanceof ApiError)) {
    return {};
  }

  return error.errors.reduce<Record<string, string>>((accumulator, item) => {
    if (!item.path || accumulator[item.path]) {
      return accumulator;
    }

    accumulator[item.path] = item.message;
    return accumulator;
  }, {});
};

export const getApiErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }

  if (error instanceof Error) {
    if (!error.message.trim() || isTechnicalErrorMessage(error.message)) {
      return fallback;
    }

    return error.message;
  }

  return fallback;
};
