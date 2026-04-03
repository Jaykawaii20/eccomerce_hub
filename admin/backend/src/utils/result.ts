// Thin Result type — wraps neverthrow for domain errors
export type DomainError = {
  code: string;
  message: string;
  httpStatus: number;
};

export function domainError(code: string, message: string, httpStatus = 400): DomainError {
  return { code, message, httpStatus };
}

// Common errors
export const Errors = {
  NOT_FOUND: (resource: string) =>
    domainError(`${resource.toUpperCase()}_NOT_FOUND`, `${resource} not found.`, 404),
  UNAUTHORIZED: domainError('UNAUTHORIZED', 'Authentication required.', 401),
  FORBIDDEN: domainError('FORBIDDEN', 'Insufficient permissions.', 403),
  CONFLICT: (message: string) => domainError('CONFLICT', message, 409),
  VALIDATION: (message: string) => domainError('VALIDATION_ERROR', message, 400),
  BUSINESS_RULE: (message: string) => domainError('BUSINESS_RULE_VIOLATION', message, 422),
  INTERNAL: domainError('INTERNAL_ERROR', 'An unexpected error occurred.', 500),
};
