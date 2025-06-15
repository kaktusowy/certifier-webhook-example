# Certifier Webhook Example

This is an example implementation of a webhook endpoint that accepts incoming `credential.issued` events from Certifier. The event is processed by retrieving additional data from the Certifier API and saving it into an Airtable table.

## Assumptions

- **Idempotency**: Prisma with SQLite is utilized to store processed credential IDs, ensuring that repeated requests do not result in duplicate processing.
- **Error Handling**: Errors are managed at the controller level to maintain clean and efficient error reporting.
- **Logging**:
  - Logs should facilitate further investigation of any issues.
  - Sensitive data should not be logged to maintain privacy and security.
- **Webhook Endpoint**:
  - Returns only status codes as any data is not required.
  - Does not return an error array; only the status code.
  - If any issues occur before adding to the webhook data processing queue, an error status code will be returned. This triggers the retry mechanism on the Certifier side, and the error will be logged for further investigation to provide a fix ASAP.
- **Webhook Data Processing**:
  - Implemented Retry logic with **8 attempts** for processing.
  - If there was a webhook data processing with the same credential ID before, the job will be completed without continuing.
  - If a credential cannot be found during processing, the job will complete, and an error will be logged for further investigation.
- **Frontend Display**: The stored results are presented using a minimal React.js frontend, displayed in a table format.

## Requirements

- Node.js v22+
- Docker
- Airtable & Certifier accounts

## Setup

### 1. Airtable

1. Create a new Airtable table (workspace) and name it for example `Certificates`.
2. Create columns (use exact names):
   - `Credential ID`
     - Type: `Single line text`
   - `Recipient name`
     - Type: `Single line text`
   - `Recipient email`
     - Type: `Single line text`
   - `Issue date`
     - Type: `Date`
     - `Include time` must be **checked**.
3. Create a personal access token and save it for later use.
   - Scopes should include `data.records:read` and `data.records:write`.
   - Provide access to the created workspace.

### 2. Certifier

1. Create an Access Token and save it for later use.
2. Webhooks (choose one):

- (Recommended) Create a Webhook for the `credential.issued` event using a URL from a dedicated webhook inspection service. This will allow you to issue a certificate and capture the data for later use in requests to the local API.
- Create a Webhook with `{you_app_url}/v1/certifier-webhook` URL for the `credential.issued` event. This is useful if your app server is exposed to the internet and you want to handle the real webhook.

### 3. Install dependencies

```sh
npm i
```

### 4. Start local Redis server

```sh
docker-compose -f docker-compose.dev.yml up -d
```

### 5. Setup environment variables

1. Clone `.env.example` in `apps/backend` and name it `.env`.
2. Set the environment variables.

Below is the list of environment variables required for the application:

| Variable Name              | Description                                                        | Example Value                   |
| -------------------------- | ------------------------------------------------------------------ | ------------------------------- |
| `ENVIRONMENT`              | Specifies the environment in which the application is running.     | `dev`                           |
| `HOST`                     | The host address for the application.                              | `localhost`                     |
| `PORT`                     | The port number on which the application will run.                 | `3000`                          |
| `DATABASE_URL`             | The Prisma URL for the database connection.                        | `file:./dev.db`                 |
| `REDIS_URL`                | The URL for the Redis instance used for caching or message queues. | `redis://localhost:6379`        |
| `CERTIFIER_BASE_URL`       | The base URL for the Certifier API.                                | `https://api.certifier.io`      |
| `CERTIFIER_API_KEY`        | The API key for authenticating with the Certifier API.             | `your_certifier_api_key_here`   |
| `CERTIFIER_WEBHOOK_SECRET` | The secret key for validating Certifier webhooks.                  | `your_webhook_secret_here`      |
| `AIRTABLE_API_KEY`         | The API key for accessing Airtable data.                           | `your_airtable_api_key_here`    |
| `AIRTABLE_BASE_ID`         | The base ID for the Airtable database.                             | `your_airtable_base_id_here`    |
| `AIRTABLE_TABLE_NAME`      | The name of the table in Airtable to interact with.                | `your_airtable_table_name_here` |

## Notes

- Replace placeholder values (e.g., `your_certifier_api_key_here`) with actual credentials in your `.env` file.
- Ensure sensitive values like API keys and secrets are kept secure and not exposed publicly.

### 6. Setup Prisma

```sh
npx nx migrateDev backend
```

### 7. Start the servers

To run the backend dev server:

```sh
npx nx serve backend
```

To run the frontend dev server:

```sh
npx nx dev frontend
```

### 8. Send a sample request

To send a request to the local API server, you can use the sample request below. Simply replace `<your_credential_id>` with the credential ID returned from the Webhook (refer to step 2).

```sh
curl -X POST http://localhost:3000/v1/certifier-webhook -H "Content-Type: application/json" -d '{"id":"test-id","data":{"resource":{"id":"<your_credential_id>","type":"credential"}},"type":"credential.issued","createdAt":"2025-06-15T16:48:02.607Z"}'
```

## Endpoints

`POST /v1/certifier-webhook`

Starts the webhook data processing.

### Sample request:

```json
{
  "id": "test-id",
  "data": {
    "resource": { "id": "resource_id", "type": "credential" }
  },
  "type": "credential.issued",
  "createdAt": "2025-06-15T16:42:02.607Z"
}
```

### Response codes:

- **`200`** Success
- **`400`** Failure, when the request validation is failing
- **`500`** Failure, when any other error

---

`GET /v1/credentials`

Returns all credentials from the Airtable workspace.

### Sample response:

```json
[
  {
    "credentialId": "123",
    "recipientName": "John Doe",
    "recipientEmail": "test@example.com",
    "issueDate": "2025-02-25T15:35:59.680Z"
  },
  {
    "credentialId": "456",
    "recipientName": "John Doe",
    "recipientEmail": "test@example.com",
    "issueDate": "2023-12-31T23:01:00.000Z"
  }
]
```

### Response codes:

- **`200`** Success
- **`500`** Failure, when any error

## Running Tests

Backend:

```sh
npx nx test backend
```

## Retry Mechanism

If the webhook processing worker fails, it will attempt to retry based on the table below. After a total of **8** attempts, an error will be logged.

| Attempt | Retry after (minutes) |
| ------- | --------------------- |
| 1       | 1                     |
| 2       | 2                     |
| 3       | 4                     |
| 4       | 8                     |
| 5       | 16                    |
| 6       | 32                    |
| 7       | 64                    |
| 8       | 128                   |

## Things that could be improved

Due to limited time to create this projects there are some areas that could be improved:

- **Signature Verification** -> For some reason, it didn't work even if I used a real request and the correct Webhook secret.
- **More Unit Tests** -> While I have created a few tests, it would be beneficial to ensure comprehensive coverage across all code.
- **Message Broker instead of Redis** -> It would be good to replace the Redis BullMQ with a message broker such as RabbitMQ, Apache Kafka or AWS SQS.
- **Project structure** -> I've used a simple folder structure for the project due to a small scope. If the project would be extended I would consider Domain-driven design.
- **Auth Middleware** -> An Auth middleware should be implemented to protect the webhook endpoints.
- **Logging in JSON** -> The loggers could be updated to log in JSON format to make the logs easier to read.
- **Shared types between backend & frontend** -> API types could be shared packages.
- **Frontend** -> The current frontend is quite basic, primarily displaying a table with data. There is significant potential for enhancement to improve user experience and functionality.
- **CORS Setup** -> I would consider enhancing the CORS configuration for the production environment to ensure better security and resource sharing.
