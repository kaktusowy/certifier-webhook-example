import { Queue, QueueEvents } from 'bullmq';

export const ISSUED_CREDENTIAL_QUEUE_ID = 'processIssuedCredential';
export const ISSUED_CREDENTIAL_QUEUE_JOB_ID = 'issuedCredential';

export type IssuedCredentialQueueDataType = string;

export const BullMQIssuedCredentialQueue = (redisUrl: string): Queue =>
  new Queue<IssuedCredentialQueueDataType>(ISSUED_CREDENTIAL_QUEUE_ID, {
    connection: {
      url: redisUrl,
    },
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: false,
      attempts: 8,
      backoff: {
        type: 'exponential',
        delay: 60000,
      },
    },
  });

export const BullMQIssuedCredentialQueueEvents = (
  redisUrl: string
): QueueEvents => {
  const events = new QueueEvents(ISSUED_CREDENTIAL_QUEUE_ID, {
    connection: {
      url: redisUrl,
    },
  });
  events.on('completed', ({ jobId }) => {
    console.log('Job completed:', jobId);
  });
  events.on(
    'failed',
    ({ jobId, failedReason }: { jobId: string; failedReason: string }) => {
      console.error('Job failed:', jobId, 'Reason:', failedReason);
    }
  );
  return events;
};
