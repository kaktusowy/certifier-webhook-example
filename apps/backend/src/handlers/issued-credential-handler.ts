import { IssuedCredentialQueueDataType } from '../queue/issued-credential-queue';
import { QueueService } from '../services/queue-service';
import { WebhookRunService } from '../services/webhook-run-service';
import {
  CertifierWebhookEventType,
  CertifierWebhookIncomingData,
  CertifierWebhookIncomingPayload,
  CertifierWebhookResourceType,
} from '../types/certifier-webhook-types';
import { WebhookEventHandler } from './webhook-event-handler';

type EventType = CertifierWebhookEventType.CredentialIssued;
type DataType = CertifierWebhookIncomingData[EventType];

export class IssuedCredentialHandler implements WebhookEventHandler<EventType> {
  constructor(
    private readonly webhookPayload: CertifierWebhookIncomingPayload,
    private readonly queueService: QueueService<IssuedCredentialQueueDataType>,
    private readonly webhookRunService: WebhookRunService
  ) {}

  async handle(data: DataType): Promise<void> {
    if (!this.validateInputData(data)) {
      console.error(
        'Invalid data received for credential issued event from webhook:',
        this.webhookPayload.id,
        this.webhookPayload.createdAt
      );
      return;
    }
    const credentialId = data.resource.id;
    const issuedCredentialRunId = `issued:${credentialId}`;
    const existingWebhookRun = await this.webhookRunService.getByReferenceId(
      issuedCredentialRunId
    );
    if (existingWebhookRun) {
      console.warn(
        'Duplicated webhook run for credential issued event:',
        issuedCredentialRunId
      );
      return;
    }

    try {
      await this.queueService.addToQueue(credentialId);
      await this.webhookRunService.create({
        referenceId: issuedCredentialRunId,
      });
    } catch (error) {
      console.error(
        'Could not process credential issued event:',
        issuedCredentialRunId
      );
      throw error;
    }
  }

  private validateInputData(data: DataType): data is DataType {
    return (
      data &&
      data.resource &&
      typeof data.resource.id === 'string' &&
      data.resource.type === CertifierWebhookResourceType.Credential
    );
  }
}
