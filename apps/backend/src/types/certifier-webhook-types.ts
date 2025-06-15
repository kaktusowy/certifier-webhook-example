export enum CertifierWebhookEventType {
  CredentialIssued = 'credential.issued',
}

export enum CertifierWebhookResourceType {
  Credential = 'credential',
}

export interface CertifierWebhookIncomingData {
  [CertifierWebhookEventType.CredentialIssued]: {
    resource: {
      id: string;
      type: 'credential' | string;
    };
  };
}

export interface CertifierWebhookIncomingPayload {
  id: string;
  type: CertifierWebhookEventType;
  createdAt: string;
  data: CertifierWebhookIncomingData[CertifierWebhookEventType];
}
