import { HttpErrorResponse } from '@angular/common/http';
import { ProblemDetails } from '../models/problem-details.model';

export function extractApiErrorMessage(
  error: unknown,
  fallback = 'An unexpected error occurred. Please try again.',
): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  if (error.status === 0) {
    return 'Unable to reach the server. Check your connection or backend status.';
  }

  const body = error.error as ProblemDetails | string | null | undefined;
  if (typeof body === 'string' && body.trim().length > 0) {
    return body;
  }

  if (body && typeof body === 'object') {
    if (body.errors) {
      const firstFieldErrors = Object.values(body.errors).flat();
      if (firstFieldErrors.length > 0) {
        return firstFieldErrors[0];
      }
    }
    if (body.detail && body.detail.trim().length > 0) {
      return body.detail;
    }
    if (body.title && body.title.trim().length > 0) {
      return body.title;
    }
  }

  return error.message || fallback;
}
