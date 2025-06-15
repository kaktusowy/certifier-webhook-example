import { HttpStatusCode } from 'axios';

interface GetCredentialResponse {
  id: string;
  publicId: string;
  groupId: string;
  status: string;
  recipient: {
    name: string;
    email: string;
  };
  issueDate: string;
  expiryDate: string;
  customAttributes: {};
  createdAt: string;
  updatedAt: string;
}

export interface CertifierApiClient {
  getCredential(credentialId: string): Promise<GetCredentialResponse | null>;
}

export class V1CertifierApiClient implements CertifierApiClient {
  private readonly apiUrl: string;

  constructor(private readonly apiKey: string, baseUrl: string) {
    this.apiUrl = `${baseUrl}/v1`;
  }

  /**
   * Fetches a credential by its ID from the Certifier API.
   * @param credentialId the credential ID
   * @returns a credential object or null if not found
   * @throws a TimeoutError or any other fetch-related error if the Certifier API is unreachable
   */
  async getCredential(
    credentialId: string
  ): Promise<GetCredentialResponse | null> {
    if (!credentialId.trim()) {
      throw new Error('Credential ID cannot be empty or whitespace only.');
    }
    const url = `${this.apiUrl}/credentials/${credentialId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'Certifier-Version': '2022-10-26',
      },
      signal: AbortSignal.timeout(15000),
    });
    switch (response.status) {
      case HttpStatusCode.Ok:
        const data: GetCredentialResponse =
          (await response.json()) as GetCredentialResponse;
        return data;
      case HttpStatusCode.NotFound:
        return null;
      default:
        console.error(
          'Unexpected response status from Certifier API:',
          response.status
        );
        return null;
    }
  }
}
