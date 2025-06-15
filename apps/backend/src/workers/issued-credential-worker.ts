import { Job, Worker } from 'bullmq';
import {
  ISSUED_CREDENTIAL_QUEUE_ID,
  IssuedCredentialQueueDataType,
} from '../queue/issued-credential-queue';
import { CertifierApiClient } from '../clients/certifier-api-client';
import { TableApiClient } from '../clients/airtable-api-client';

export const BullMQIssuedCredentialWorker = (
  redisUrl: string,
  certifierApiClient: CertifierApiClient,
  tableApiClient: TableApiClient
): Worker =>
  new Worker<IssuedCredentialQueueDataType>(
    ISSUED_CREDENTIAL_QUEUE_ID,
    async (job) => await processJob(job, certifierApiClient, tableApiClient),
    {
      connection: {
        url: redisUrl,
      },
    }
  );

const processJob = async (
  job: Job<IssuedCredentialQueueDataType>,
  certifierApiClient: CertifierApiClient,
  tableApiClient: TableApiClient
) => {
  console.log('Processing job:', job.id, job.name, job.attemptsMade);
  const credentialId = job.data;
  const credential = await certifierApiClient.getCredential(credentialId);
  if (!credential) {
    console.warn(
      'Credential not found while processing issued event',
      credentialId
    );
    return;
  }
  const airtableRecordId = await tableApiClient.createCredentialRecord({
    credentialId: credential.id,
    recipientName: credential.recipient.name,
    recipientEmail: credential.recipient.email,
    issueDate: credential.issueDate,
  });
  console.log(
    'Credential record created in Airtable:',
    airtableRecordId,
    'for credential ID:',
    credential.id,
    job.id,
    job.name
  );
};
