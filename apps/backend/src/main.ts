import express, { Router } from 'express';
import { CertifierWebhookController } from './controllers/certifier-webhook-controller';
import Prisma from './db/prisma';
import { PrismaWebhookRunService } from './services/webhook-run-service';
import { PrismaWebhookRunRepository } from './repositories/webhook-run-repository';
import { StandardCertifierWebhookService } from './services/certifier-webhook-service';
import { V1CertifierApiClient } from './clients/certifier-api-client';
import { BullMQIssuedCredentialQueueService } from './services/issued-credential-queue-service';
import {
  BullMQIssuedCredentialQueue,
  BullMQIssuedCredentialQueueEvents,
} from './queue/issued-credential-queue';
import { BullMQIssuedCredentialWorker } from './workers/issued-credential-worker';
import { AirtableApiClient } from './clients/airtable-api-client';
import { CredentialController } from './controllers/credential-controller';
import cors from 'cors';

const requireEnvVariable = (variableName: string): string => {
  const envVar = process.env[variableName];
  if (!envVar) {
    throw new Error(`${variableName} environment variable is not set`);
  }
  return envVar;
};

const host = requireEnvVariable('HOST');
const port = Number(requireEnvVariable('PORT'));
const redisUrl = requireEnvVariable('REDIS_URL');
const certifierBaseUrl = requireEnvVariable('CERTIFIER_BASE_URL');
const certifierApiKey = requireEnvVariable('CERTIFIER_API_KEY');
const webhookSecret = requireEnvVariable('CERTIFIER_WEBHOOK_SECRET');
const airtableApiKey = requireEnvVariable('AIRTABLE_API_KEY');
const airtableBaseId = requireEnvVariable('AIRTABLE_BASE_ID');
const airtableTableName = requireEnvVariable('AIRTABLE_TABLE_NAME');

const webhookRunRepository = new PrismaWebhookRunRepository(Prisma);
const webhookRunService = new PrismaWebhookRunService(webhookRunRepository);

const certifierApiClient = new V1CertifierApiClient(
  certifierApiKey,
  certifierBaseUrl
);
const tableApiClient = new AirtableApiClient(
  airtableApiKey,
  airtableBaseId,
  airtableTableName
);

const issuedCredentialQueue = BullMQIssuedCredentialQueue(redisUrl);
const issuedCredentialWorker = BullMQIssuedCredentialWorker(
  redisUrl,
  certifierApiClient,
  tableApiClient
);
const issuedCredentialQueueEvents = BullMQIssuedCredentialQueueEvents(redisUrl);
const issuedCredentialQueueService = new BullMQIssuedCredentialQueueService(
  issuedCredentialQueue
);

const certifierWebhookService = new StandardCertifierWebhookService(
  issuedCredentialQueueService,
  webhookRunService
);
const certifierWebhookController = new CertifierWebhookController(
  webhookSecret,
  certifierWebhookService
);
const credentialController = new CredentialController(tableApiClient);

const app = express();
app.use(cors());
app.use(express.json());

const v1Router = Router();
v1Router.post('/certifier-webhook', certifierWebhookController.handleWebhook);
v1Router.get('/credentials', credentialController.getAll);
app.use('/v1', v1Router);

const server = app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});

const shutdown = async () => {
  console.log('Closing server...');

  await issuedCredentialQueue.close();
  await issuedCredentialWorker.close();
  await issuedCredentialQueueEvents.close();

  server.close((error) => {
    console.log('Server closed');
    process.exit(error ? 1 : 0);
  });
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
