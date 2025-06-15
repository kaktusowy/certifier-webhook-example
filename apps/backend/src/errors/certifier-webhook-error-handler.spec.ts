import { HttpStatusCode } from 'axios';
import { handleCertifierWebhookError } from './certifier-webhook-error-handler';
import { ValidationError } from './validation-error';

describe('handleCertifierWebhookError', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should return BadRequest status code for ValidationError', () => {
    const validationError = new ValidationError([
      {
        code: 'invalid_format',
        message: 'Invalid data provided',
        format: 'string',
        input: '',
        path: [],
      },
    ]);
    const result = handleCertifierWebhookError(validationError);

    expect(result.statusCode).toBe(HttpStatusCode.BadRequest);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Validation error in certifier webhook:',
      validationError.errors
    );
  });

  it('should return InternalServerError status code for generic Error', () => {
    const genericError = new Error('Something went wrong');
    const result = handleCertifierWebhookError(genericError);

    expect(result.statusCode).toBe(HttpStatusCode.InternalServerError);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'An unexpected error occurred while processing certifier webhook:',
      genericError.name,
      genericError.message
    );
  });

  it('should return InternalServerError status code for unexpected error types', () => {
    const unexpectedError = 42;
    const result = handleCertifierWebhookError(unexpectedError);

    expect(result.statusCode).toBe(HttpStatusCode.InternalServerError);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'An unexpected type of error occurred while processing certifier webhook:',
      typeof unexpectedError
    );
  });
});
