import { PrismaClient, WebhookRun } from '@prisma/client';

export interface WebhookRunRepository {
  getByReferenceId(referenceId: string): Promise<WebhookRun | null>;
  create(referenceId: string): Promise<WebhookRun>;
}

export class PrismaWebhookRunRepository implements WebhookRunRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(referenceId: string): Promise<WebhookRun> {
    return this.prisma.webhookRun.create({
      data: {
        referenceId,
      },
    });
  }

  async getByReferenceId(referenceId: string): Promise<WebhookRun | null> {
    return this.prisma.webhookRun.findUnique({
      where: { referenceId },
    });
  }
}
