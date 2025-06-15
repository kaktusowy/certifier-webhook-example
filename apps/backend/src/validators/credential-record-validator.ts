import { z } from 'zod/v4';

export const CredentialRecordValidator = z.object({
  credentialId: z.string().min(1, 'Credential ID is required'),
  recipientName: z.string().min(1, 'Recipient name is required'),
  recipientEmail: z.email().min(1, 'Recipient email is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
});

export type CredentialRecordInput = z.infer<typeof CredentialRecordValidator>;
