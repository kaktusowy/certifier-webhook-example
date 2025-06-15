import { PrismaWebhookRunRepository } from './webhook-run-repository';
import { mockDeep } from 'jest-mock-extended';
import {
  PrismaClient as OriginalPrismaClient,
  PrismaClient,
  WebhookRun,
} from '@prisma/client';

jest.mock('@prisma/client', () => ({
  PrismaClient: function () {
    return mockDeep<OriginalPrismaClient>();
  },
}));

describe('PrismaWebhookRunRepository', () => {
  let prismaMock: jest.Mocked<PrismaClient>;
  let repository: PrismaWebhookRunRepository;

  beforeEach(() => {
    prismaMock = new PrismaClient() as jest.Mocked<PrismaClient>;
    repository = new PrismaWebhookRunRepository(prismaMock);
  });

  describe('create', () => {
    it('should call prisma.webhookRun.create with correct data and return the result', async () => {
      const referenceId = 'test-reference-id';
      const webhookRunMock: WebhookRun = { id: 1, referenceId };

      (prismaMock.webhookRun.create as jest.Mock).mockResolvedValue(
        webhookRunMock
      );

      const result = await repository.create(referenceId);

      expect(prismaMock.webhookRun.create).toHaveBeenCalledWith({
        data: { referenceId },
      });
      expect(result).toEqual(webhookRunMock);
    });
  });

  describe('getByReferenceId', () => {
    it('should call prisma.webhookRun.findUnique with correct where clause and return the result', async () => {
      const referenceId = 'test-reference-id';
      const webhookRunMock: WebhookRun = { id: 1, referenceId };

      (prismaMock.webhookRun.findUnique as jest.Mock).mockResolvedValue(
        webhookRunMock
      );

      const result = await repository.getByReferenceId(referenceId);

      expect(prismaMock.webhookRun.findUnique).toHaveBeenCalledWith({
        where: { referenceId },
      });
      expect(result).toEqual(webhookRunMock);
    });

    it('should return null if no webhookRun is found', async () => {
      const referenceId = 'non-existent-reference-id';

      (prismaMock.webhookRun.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.getByReferenceId(referenceId);

      expect(prismaMock.webhookRun.findUnique).toHaveBeenCalledWith({
        where: { referenceId },
      });
      expect(result).toBeNull();
    });
  });
});
