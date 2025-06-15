import {
  CertifierWebhookEventType,
  CertifierWebhookIncomingData,
} from '../types/certifier-webhook-types';

export interface WebhookEventHandler<T extends CertifierWebhookEventType> {
  handle(data: CertifierWebhookIncomingData[T]): Promise<void>;
}
