import { Queue } from 'bullmq';
import {
  ISSUED_CREDENTIAL_QUEUE_JOB_ID,
  IssuedCredentialQueueDataType,
} from '../queue/issued-credential-queue';
import { QueueService } from './queue-service';

export class BullMQIssuedCredentialQueueService
  implements QueueService<IssuedCredentialQueueDataType>
{
  constructor(private readonly queue: Queue<IssuedCredentialQueueDataType>) {}

  async addToQueue(data: IssuedCredentialQueueDataType): Promise<void> {
    this.queue.add(ISSUED_CREDENTIAL_QUEUE_JOB_ID, data);
  }
}
