import { useQuery } from '@tanstack/react-query';
import { AllCredentialsResponse, getAllCredentials } from '../api/api';

export function App() {
  const { isPending, isError, data, error } = useQuery<AllCredentialsResponse>({
    queryKey: ['credentials'],
    queryFn: getAllCredentials,
  });

  if (isPending) {
    return <div className="text-center">Loading...</div>;
  }

  if (isError) {
    return (
      <div className="text-center">
        Error: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  return (
    <div>
      <table className="min-w-full border-collapse border border-gray-200">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Credential ID</th>
            <th className="border border-gray-300 px-4 py-2">Recipient name</th>
            <th className="border border-gray-300 px-4 py-2">
              Recipient email
            </th>
            <th className="border border-gray-300 px-4 py-2">Issue date</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((credential) => (
            <tr key={credential.credentialId}>
              <td className="border border-gray-300 px-4 py-2">
                {credential.credentialId}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {credential.recipientName}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {credential.recipientEmail}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {credential.issueDate}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
