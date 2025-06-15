import {
  CreateWebhookRunValidator,
  CreateWebhookRunInput,
} from '../validators/webhook-run-validator';
import { WebhookRunRepository } from '../repositories/webhook-run-repository';
import { ValidationError } from '../errors/validation-error';
import { WebhookRunAlreadyExistsError } from '../errors/webhook-run-already-exists-error';
import { WebhookRun } from '@prisma/client';

export interface WebhookRunService {
  getByReferenceId(referenceId: string): Promise<WebhookRun | null>;
  create(input: CreateWebhookRunInput): Promise<WebhookRun>;
}

export class PrismaWebhookRunService implements WebhookRunService {
  constructor(private readonly webhookRunRepository: WebhookRunRepository) {}

  async create(input: CreateWebhookRunInput): Promise<WebhookRun> {
    const validatedWebhookRunData = CreateWebhookRunValidator.safeParse(input);
    if (!validatedWebhookRunData.success) {
      throw new ValidationError(validatedWebhookRunData.error.issues);
    }

    const { referenceId } = validatedWebhookRunData.data;

    const existingWebhookRun = await this.webhookRunRepository.getByReferenceId(
      referenceId
    );
    if (existingWebhookRun) {
      throw new WebhookRunAlreadyExistsError(referenceId);
    }

    return this.webhookRunRepository.create(referenceId);
  }

  async getByReferenceId(referenceId: string): Promise<WebhookRun | null> {
    return this.webhookRunRepository.getByReferenceId(referenceId);
  }
}
