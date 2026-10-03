export type ActionErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'VALIDATION_ERROR'

export interface ActionError {
  code: ActionErrorCode
  message: string
  fieldErrors?: Record<string, string[]>
}

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: ActionError }

export function success<T>(data: T): Result<T> {
  return { ok: true, data }
}

export function failure(code: ActionErrorCode, message: string, fieldErrors?: Record<string, string[]>): Result<never> {
  return {
    ok: false,
    error: {
      code,
      message,
      ...(fieldErrors ? { fieldErrors } : {}),
    },
  }
}
