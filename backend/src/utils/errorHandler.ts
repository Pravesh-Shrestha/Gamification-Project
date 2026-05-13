/**
 * Centralized error handling utility
 * Maps backend errors to user-friendly messages
 */

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

export interface ErrorResponse {
  success: false;
  code: ErrorCode;
  message: string;
  statusCode: number;
  timestamp: string;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

/**
 * User-friendly error messages
 * Maps technical errors to messages users can understand
 */
const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ErrorCode.UNAUTHORIZED]: 'Please log in to continue.',
  [ErrorCode.FORBIDDEN]: 'You don\'t have permission to perform this action.',
  [ErrorCode.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCode.CONFLICT]: 'This action conflicts with existing data.',
  [ErrorCode.INTERNAL_ERROR]: 'Something went wrong. Please try again later.',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'Our service is temporarily unavailable. Please try again soon.',
};

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  code: ErrorCode,
  statusCode: number,
  technicalMessage?: string
): ErrorResponse {
  console.error(`[${code}] ${technicalMessage || ERROR_MESSAGES[code]}`);

  return {
    success: false,
    code,
    message: ERROR_MESSAGES[code],
    statusCode,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create a success response
 */
export function createSuccessResponse<T>(data: T): SuccessResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Map common error patterns to ErrorCode
 */
export function mapErrorToCode(error: any): { code: ErrorCode; statusCode: number } {
  if (error.message?.includes('not found') || error.message?.includes('No document')) {
    return { code: ErrorCode.NOT_FOUND, statusCode: 404 };
  }

  if (error.message?.includes('unauthorized') || error.message?.includes('Unauthorized')) {
    return { code: ErrorCode.UNAUTHORIZED, statusCode: 401 };
  }

  if (error.message?.includes('forbidden') || error.message?.includes('Forbidden')) {
    return { code: ErrorCode.FORBIDDEN, statusCode: 403 };
  }

  if (error.message?.includes('validation') || error.name === 'ValidationError') {
    return { code: ErrorCode.VALIDATION_ERROR, statusCode: 400 };
  }

  if (error.code === 11000) {
    return { code: ErrorCode.CONFLICT, statusCode: 409 };
  }

  if (error.name === 'MongooseError' || error.name === 'MongoError') {
    return { code: ErrorCode.INTERNAL_ERROR, statusCode: 500 };
  }

  return { code: ErrorCode.INTERNAL_ERROR, statusCode: 500 };
}
