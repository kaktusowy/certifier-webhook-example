export class WebhookRunAlreadyExistsError extends Error {
  constructor(referenceId: string) {
    super(`WebhookRun with referenceId "${referenceId}" already exists.`);
    this.name = 'WebhookRunAlreadyExistsError';
  }
}
