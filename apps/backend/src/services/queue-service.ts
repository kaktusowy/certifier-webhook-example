export interface QueueService<T> {
  addToQueue(data: T): Promise<void>;
}
