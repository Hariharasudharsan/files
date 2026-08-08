export interface ValidationSuccess<T> {
  success: true;
  data: T;
}

export interface ValidationFailure {
  success: false;
  errors: string[];
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

export function ok<T>(data: T): ValidationSuccess<T> {
  return { success: true, data };
}

export function fail(errors: string[]): ValidationFailure {
  return { success: false, errors };
}
