import { ValidationError } from '../errors/validation-error';
import { WebhookRunAlreadyExistsError } from '../errors/webhook-run-already-exists-error';
import { WebhookRunRepository } from '../repositories/webhook-run-repository';
import { CreateWebhookRunValidator } from '../validators/webhook-run-validator';
import { PrismaWebhookRunService } from './webhook-run-service';

jest.mock('../repositories/webhook-run-repository');
jest.mock('../validators/webhook-run-validator');

describe('PrismaWebhookRunService', () => {
  let webhookRunRepositoryMock: jest.Mocked<WebhookRunRepository>;
  let service: PrismaWebhookRunService;

  beforeEach(() => {
    webhookRunRepositoryMock = {
      create: jest.fn(),
      getByReferenceId: jest.fn(),
    } as unknown as jest.Mocked<WebhookRunRepository>;

    service = new PrismaWebhookRunService(webhookRunRepositoryMock);
  });

  describe('create', () => {
    it('should create a new webhook run if input is valid and referenceId does not exist', async () => {
      const input = { referenceId: 'test-reference-id' };
      const validatedData = { success: true, data: input };
      const webhookRunMock = { id: 1, referenceId: input.referenceId };

      (CreateWebhookRunValidator.safeParse as jest.Mock).mockReturnValue(
        validatedData
      );
      webhookRunRepositoryMock.getByReferenceId.mockResolvedValue(null);
      webhookRunRepositoryMock.create.mockResolvedValue(webhookRunMock);

      const result = await service.create(input);

      expect(CreateWebhookRunValidator.safeParse).toHaveBeenCalledWith(input);
      expect(webhookRunRepositoryMock.getByReferenceId).toHaveBeenCalledWith(
        input.referenceId
      );
      expect(webhookRunRepositoryMock.create).toHaveBeenCalledWith(
        input.referenceId
      );
      expect(result).toEqual(webhookRunMock);
    });

    it('should throw ValidationError if input is invalid', async () => {
      const input = { referenceId: '' }; // Invalid input
      const validationErrorMock = {
        success: false,
        error: {
          issues: [
            {
              code: 'invalid_format',
              message: 'Invalid data provided',
              format: 'string',
              input: '',
              path: [],
            },
          ],
        },
      };

      (CreateWebhookRunValidator.safeParse as jest.Mock).mockReturnValue(
        validationErrorMock
      );

      await expect(service.create(input)).rejects.toThrow(ValidationError);
      await expect(service.create(input)).rejects.toMatchObject({
        errors: validationErrorMock.error.issues,
      });
      expect(CreateWebhookRunValidator.safeParse).toHaveBeenCalledWith(input);
      expect(webhookRunRepositoryMock.getByReferenceId).not.toHaveBeenCalled();
      expect(webhookRunRepositoryMock.create).not.toHaveBeenCalled();
    });

    it('should throw WebhookRunAlreadyExistsError if referenceId already exists', async () => {
      const input = { referenceId: 'existing-reference-id' };
      const validatedData = { success: true, data: input };
      const existingWebhookRunMock = { id: 1, referenceId: input.referenceId };

      (CreateWebhookRunValidator.safeParse as jest.Mock).mockReturnValue(
        validatedData
      );
      webhookRunRepositoryMock.getByReferenceId.mockResolvedValue(
        existingWebhookRunMock
      );

      await expect(service.create(input)).rejects.toThrow(
        WebhookRunAlreadyExistsError
      );
      expect(CreateWebhookRunValidator.safeParse).toHaveBeenCalledWith(input);
      expect(webhookRunRepositoryMock.getByReferenceId).toHaveBeenCalledWith(
        input.referenceId
      );
      expect(webhookRunRepositoryMock.create).not.toHaveBeenCalled();
    });
  });

  describe('getByReferenceId', () => {
    it('should return the webhook run if found', async () => {
      const referenceId = 'test-reference-id';
      const webhookRunMock = { id: 1, referenceId };

      webhookRunRepositoryMock.getByReferenceId.mockResolvedValue(
        webhookRunMock
      );

      const result = await service.getByReferenceId(referenceId);

      expect(webhookRunRepositoryMock.getByReferenceId).toHaveBeenCalledWith(
        referenceId
      );
      expect(result).toEqual(webhookRunMock);
    });

    it('should return null if webhook run is not found', async () => {
      const referenceId = 'non-existent-reference-id';

      webhookRunRepositoryMock.getByReferenceId.mockResolvedValue(null);

      const result = await service.getByReferenceId(referenceId);

      expect(webhookRunRepositoryMock.getByReferenceId).toHaveBeenCalledWith(
        referenceId
      );
      expect(result).toBeNull();
    });
  });
});
