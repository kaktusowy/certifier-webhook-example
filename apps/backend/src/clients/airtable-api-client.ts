import Airtable from 'airtable';
import {
  CredentialRecordInput,
  CredentialRecordValidator,
} from '../validators/credential-record-validator';
import { ValidationError } from '../errors/validation-error';

export interface TableApiClient {
  /**
   * Creates a new credential record in a table.
   * @returns A promise that resolves to the ID of the created record.
   */
  createCredentialRecord(
    credentialRecordInput: CredentialRecordInput
  ): Promise<string>;

  /**
   * Retrieves all credential records from the table.
   * @returns A promise that resolves to an array of credential records.
   */
  getAllRecords(): Promise<CredentialRecord[]>;
}

interface CredentialRecord {
  credentialId: string;
  recipientName: string;
  recipientEmail: string;
  issueDate: string;
}

export const CREDENTIAL_ID_COLUMN_NAME = 'Credential ID';
export const RECIPIENT_NAME_COLUMN_NAME = 'Recipient name';
export const RECIPIENT_EMAIL_COLUMN_NAME = 'Recipient email';
export const ISSUE_DATE_COLUMN_NAME = 'Issue date';

export class AirtableApiClient implements TableApiClient {
  private readonly base: Airtable.Base;

  /**
   * Initializes the Airtable API client with the provided API key and base ID.
   * @param apiKey - The API key for accessing Airtable.
   * @param baseId - The ID of the Airtable base to interact with.
   * @param tableName - The name of the table where credential records will be stored.
   */
  constructor(
    apiKey: string,
    baseId: string,
    private readonly tableName: string
  ) {
    this.base = new Airtable({ apiKey }).base(baseId);
  }

  async createCredentialRecord(
    credentialRecordInput: CredentialRecordInput
  ): Promise<string> {
    const validatedCredentialRecord = CredentialRecordValidator.safeParse(
      credentialRecordInput
    );
    if (!validatedCredentialRecord.success) {
      throw new ValidationError(validatedCredentialRecord.error.issues);
    }
    const { credentialId, recipientName, recipientEmail, issueDate } =
      validatedCredentialRecord.data;
    const result = await this.base(this.tableName).create({
      [CREDENTIAL_ID_COLUMN_NAME]: credentialId,
      [RECIPIENT_NAME_COLUMN_NAME]: recipientName,
      [RECIPIENT_EMAIL_COLUMN_NAME]: recipientEmail,
      [ISSUE_DATE_COLUMN_NAME]: issueDate,
    });
    return result.getId();
  }

  async getAllRecords(): Promise<CredentialRecord[]> {
    const allCredentialRecords = await this.base(this.tableName).select().all();
    return (
      allCredentialRecords
        // Airtable can return a record with all undefined values
        .filter((record) => record.get(CREDENTIAL_ID_COLUMN_NAME) !== undefined)
        .map((record) => ({
          credentialId: record.get(CREDENTIAL_ID_COLUMN_NAME) as string,
          recipientName: record.get(RECIPIENT_NAME_COLUMN_NAME) as string,
          recipientEmail: record.get(RECIPIENT_EMAIL_COLUMN_NAME) as string,
          issueDate: record.get(ISSUE_DATE_COLUMN_NAME) as string,
        }))
    );
  }
}
