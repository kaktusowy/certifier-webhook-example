import { z } from 'zod/v4';

export const CreateWebhookRunValidator = z.object({
  referenceId: z.string().min(1, 'Reference ID is required'),
});

export type CreateWebhookRunInput = z.infer<typeof CreateWebhookRunValidator>;
