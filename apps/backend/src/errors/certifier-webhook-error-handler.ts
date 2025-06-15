import { HttpStatusCode } from 'axios';
import { ValidationError } from './validation-error';

interface ErrorHandlingResult {
  statusCode: number;
}

export const handleCertifierWebhookError = (
  error: unknown
): ErrorHandlingResult => {
  const result: ErrorHandlingResult = {
    statusCode: HttpStatusCode.InternalServerError,
  };
  if (error instanceof ValidationError) {
    result.statusCode = HttpStatusCode.BadRequest;
    console.error('Validation error in certifier webhook:', error.errors);
  } else if (error instanceof Error) {
    console.error(
      'An unexpected error occurred while processing certifier webhook:',
      error.name,
      error.message
    );
  } else {
    console.error(
      'An unexpected type of error occurred while processing certifier webhook:',
      typeof error
    );
  }
  return result;
};
