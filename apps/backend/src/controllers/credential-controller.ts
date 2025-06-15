import { Request, Response } from 'express';
import { TableApiClient } from '../clients/airtable-api-client';

export class CredentialController {
  constructor(private readonly tableApiClient: TableApiClient) {}

  getAll = async (_: Request, response: Response) => {
    try {
      const credentials = await this.tableApiClient.getAllRecords();
      return response.status(200).json(credentials);
    } catch (error) {
      console.error('Error retrieving credentials:', error);
      return response.status(500).json({ error: 'Internal Server Error' });
    }
  };
}
