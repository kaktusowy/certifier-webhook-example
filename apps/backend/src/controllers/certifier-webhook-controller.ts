import { Request, Response } from 'express';
import { CertifierWebhookService } from '../services/certifier-webhook-service';
import { handleCertifierWebhookError } from '../errors/certifier-webhook-error-handler';
import crypto from 'crypto';

export class CertifierWebhookController {
  constructor(
    private readonly webhookSecret: string,
    private readonly certifierWebhookService: CertifierWebhookService
  ) {}

  handleWebhook = async (request: Request, response: Response) => {
    try {
      // Due to errors related to the signature verification, temporary disabling in dev
      if (process.env.ENVIRONMENT !== 'dev') {
        this.verifyWebhookSignature(request);
      }
      const payload = request.body;
      await this.certifierWebhookService.handle(payload);
      return response.sendStatus(200);
    } catch (error) {
      const { statusCode } = handleCertifierWebhookError(error);
      return response.sendStatus(statusCode);
    }
  };

  private verifyWebhookSignature(request: Request) {
    const receivedSignature = request.headers['x-webhook-signature'];
    if (!receivedSignature || !(typeof receivedSignature === 'string')) {
      throw new Error('Missing webhook signature header');
    }

    try {
      const payload = JSON.stringify(request.body);
      const hmac = crypto.createHmac('sha256', this.webhookSecret);
      hmac.update(payload, 'utf8');
      const expectedSignature = hmac.digest('hex');

      const isSignatureValid = crypto.timingSafeEqual(
        Buffer.from(receivedSignature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
      if (!isSignatureValid) {
        throw new Error('Invalid webhook signature');
      }
    } catch (error) {
      console.error('Could not verify webhook signature');
      throw error;
    }
  }
}
