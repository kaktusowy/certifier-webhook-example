const API_URL = 'http://localhost:3000';

export type AllCredentialsResponse = {
  credentialId: string;
  recipientName: string;
  recipientEmail: string;
  issueDate: string;
}[];

export const getAllCredentials = async (): Promise<AllCredentialsResponse> => {
  const response = await fetch(`${API_URL}/v1/credentials`, {
    method: 'GET',
  });
  if (!response.ok) {
    throw new Error(`Error fetching credentials: ${response.statusText}`);
  }
  return (await response.json()) as AllCredentialsResponse;
};
