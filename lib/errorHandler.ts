import { toast } from 'sonner';

export interface AppError {
  code?: string;
  message: string;
  status?: number;
  details?: any;
}

export class ErrorHandler {
  static handle(error: any, context?: string): AppError {
    console.error(`${context ? context + ': ' : ''}`, error);
    
    // Handle different types of errors
    let appError: AppError = {
      message: 'An unexpected error occurred',
      details: error
    };

    // Handle Supabase errors
    if (error.code) {
      appError.code = error.code;
      appError.message = this.getSupabaseErrorMessage(error);
    } 
    // Handle fetch/network errors
    else if (error.status) {
      appError.status = error.status;
      appError.message = this.getHttpStatusMessage(error.status);
    } 
    // Handle generic errors
    else if (error.message) {
      appError.message = error.message;
    }

    return appError;
  }

  static getSupabaseErrorMessage(error: any): string {
    switch (error.code) {
      case '23505': // Unique violation
        return 'This record already exists';
      case '42501': // Insufficient privilege
        return 'You are not authorized to perform this action';
      case 'PGRST116': // Result contains 0 rows
        return 'The requested resource was not found';
      case 'PGRST301': // No table match
        return 'The requested resource does not exist';
      default:
        return error.message || 'Database error occurred';
    }
  }

  static getHttpStatusMessage(status: number): string {
    switch (status) {
      case 400:
        return 'Bad request - please check your input';
      case 401:
        return 'Unauthorized - please log in';
      case 403:
        return 'Forbidden - you do not have permission';
      case 404:
        return 'Resource not found';
      case 413:
        return 'Request too large';
      case 500:
        return 'Internal server error - please try again later';
      default:
        return `HTTP error ${status} occurred`;
    }
  }

  static showErrorToast(error: AppError, customMessage?: string): void {
    if (typeof window === 'undefined') return;
    const message = customMessage || error.message;
    toast.error(message);
  }

  static showSuccessToast(message: string): void {
    if (typeof window === 'undefined') return;
    toast.success(message);
  }
}