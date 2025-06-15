import { IssuedCredentialHandler } from '../handlers/issued-credential-handler';
import { IssuedCredentialQueueDataType } from '../queue/issued-credential-queue';
import {
  CertifierWebhookEventType,
  CertifierWebhookIncomingData,
  CertifierWebhookIncomingPayload,
} from '../types/certifier-webhook-types';
import { QueueService } from './queue-service';
import { WebhookRunService } from './webhook-run-service';

export interface CertifierWebhookService {
  handle(payload: CertifierWebhookIncomingPayload): Promise<void>;
}

export class StandardCertifierWebhookService
  implements CertifierWebhookService
{
  constructor(
    private readonly issuedCredentialQueueService: QueueService<IssuedCredentialQueueDataType>,
    private readonly webhookRunService: WebhookRunService
  ) {}

  async handle(payload: CertifierWebhookIncomingPayload): Promise<void> {
    switch (payload.type) {
      case CertifierWebhookEventType.CredentialIssued:
        const data =
          payload.data as CertifierWebhookIncomingData[CertifierWebhookEventType.CredentialIssued];
        await new IssuedCredentialHandler(
          payload,
          this.issuedCredentialQueueService,
          this.webhookRunService
        ).handle(data);
        break;
      default:
        console.warn('Unhandled webhook event type:', payload.type);
        break;
    }
  }
}
