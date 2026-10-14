# FlexBot --- AI Customer Support Platform

## Product Requirements, Architecture & Implementation Reference

> **Document purpose:** This is the living source of truth for building
> FlexBot with an AI coding IDE. Refer to it before making architectural
> changes, generating code, or adding dependencies.
>
> **Project status:** Planning / initial implementation\
> **Version:** 1.0\
> **Primary approach:** TypeScript-first modular monolith using Clean
> Architecture\
> **Initial product focus:** Knowledge-based customer support chatbot
> (RAG)

------------------------------------------------------------------------

## 1. Project Overview

### 1.1 What is FlexBot?

FlexBot is a configurable, embeddable, knowledge-based AI customer
support platform. Businesses can create chatbots, provide their own
knowledge sources, and embed a chatbot on their websites or connect to
it through an API.

The chatbot should answer questions using approved business knowledge
instead of relying only on a general-purpose model's existing knowledge.

### 1.2 Problem statement

Businesses repeatedly answer questions about products, policies,
services, documentation, and processes. FlexBot provides a reusable
support assistant that can retrieve relevant information from
business-approved sources and respond conversationally.

### 1.3 Product vision

Build the AI support engine once and allow multiple organizations to
configure their own chatbots without needing to build their own AI
infrastructure.

### 1.4 Target use cases

-   E-commerce: product questions, delivery policies, returns, refunds.
-   SaaS: product documentation, feature explanations, troubleshooting.
-   Education: course details, policies, learning resources.
-   Company websites: FAQs and lead qualification.
-   Internal tools: search across authorized company documentation.

### 1.5 Primary users

-   **Platform user:** Registers and manages an organization.
-   **Organization owner/admin:** Manages members, chatbots, knowledge
    sources, and configuration.
-   **Support operator:** Reviews conversations and, in a later phase,
    handles escalations.
-   **Website visitor:** Uses the embedded chat without needing a
    FlexBot account.

------------------------------------------------------------------------

## 2. Product Scope

### 2.1 MVP --- must have

1.  User registration, login, logout, and secure session handling.
2.  Organization/workspace creation and membership.
3.  Create, view, update, activate, and deactivate chatbots.
4.  Chatbot configuration: name, instructions, welcome message, and
    appearance.
5.  Upload PDF documents and manage processing status.
6.  Extract and chunk document text.
7.  Generate embeddings and store searchable chunks in a vector
    database.
8.  Retrieve relevant knowledge for a question.
9.  Generate answers through an AI provider.
10. Persist conversations and messages.
11. Display sources/citations when retrieval supports them.
12. Basic dashboard for chatbots, knowledge sources, and conversations.
13. Embeddable JavaScript chat widget.
14. Request validation, tenant isolation, rate limiting, and useful
    error handling.
15. Basic logs and usage metadata.

### 2.2 Next phase

-   Website URL ingestion.
-   FAQ entry management.
-   TXT and Markdown uploads.
-   Streaming responses with Server-Sent Events (SSE).
-   Retry and reprocess failed documents.
-   Conversation feedback and basic analytics.
-   More than one AI provider.
-   Usage quotas and configurable limits.
-   Human escalation workflow.

### 2.3 Later / not in initial MVP

-   Automated billing and subscription payments.
-   Advanced multi-agent orchestration.
-   Complex CRM/help-desk integrations.
-   WhatsApp, Slack, and other messaging channels.
-   OCR for scanned PDFs.
-   Fine-tuning or training a foundation model.
-   Enterprise SSO and advanced compliance features.

**Scope rule:** Do not add a later-phase feature unless it is required
to complete or validate the current milestone.

------------------------------------------------------------------------

## 3. Product Principles

1.  **Knowledge-grounded answers:** Prefer relevant, retrieved business
    knowledge.
2.  **Honest uncertainty:** If evidence is missing or weak, say so; do
    not invent policies or facts.
3.  **Provider independence:** Application use cases depend on
    interfaces, not a vendor SDK.
4.  **Tenant isolation:** One organization's users, documents, messages,
    and configuration must never leak to another.
5.  **Security by design:** Public widget identifiers are not
    authorization credentials.
6.  **Modular monolith first:** Clear internal modules; no premature
    microservices.
7.  **Observable AI:** Track latency, failures, retrieval quality, token
    usage where available, and estimated costs.
8.  **Incremental delivery:** Test each vertical slice before adding
    complexity.

------------------------------------------------------------------------

## 4. Technology Stack

The following is the intended stack. Confirm current SDK support,
package maintenance, and provider limits before implementation.

  -----------------------------------------------------------------------
  Area                    Initial choice          Notes
  ----------------------- ----------------------- -----------------------
  Dashboard               React + TypeScript +    Separate frontend
                          Vite                    application

  Styling/UI              Tailwind CSS +          Accessible reusable
                          shadcn/ui               components

  Dashboard state         Zustand where needed    Avoid duplicating
                                                  server state
                                                  unnecessarily

  Backend                 Node.js + Express +     REST API and streaming
                          TypeScript              

  Architecture            Clean Architecture /    Domain and use cases
                          modular monolith        stay vendor-independent

  Database                MongoDB + Mongoose      Accounts, tenants,
                                                  configuration,
                                                  conversations

  Validation              Zod                     Validate external input
                                                  and configuration

  Initial LLM provider    Google Gemini API       Keep behind
                                                  `AIProvider` interface

  Embeddings              Provider/model selected Dimensions must match
                          before vector schema    vector collection
                          setup                   

  Vector database         Qdrant                  Semantic retrieval with
                                                  tenant-scoped metadata
                                                  filters

  PDF parsing             Maintained PDF text     Validate file type,
                          extraction library      size, and page count

  HTML parsing            HTTP fetch + HTML       Website ingestion added
                          parser                  after PDF flow

  Streaming               Server-Sent Events      Add after basic
                          (SSE)                   request/response works

  File storage            Local storage for       Use S3-compatible
                          development behind an   object storage in
                          interface               production

  Background jobs         Redis + BullMQ when     Not required for the
                          ingestion becomes       first basic prototype
                          asynchronous            

  Testing                 Vitest, Supertest,      Unit, API integration,
                          Playwright              and browser tests

  Deployment              Docker; AWS or          HTTPS, secrets,
                          equivalent              monitoring, backups
  -----------------------------------------------------------------------

### 4.1 AI provider selection

Start with one provider so the first end-to-end workflow remains
understandable. Gemini is the initial candidate, not a permanent
commitment.

Before production use, verify: - Current model names and API
availability. - Rate limits and pricing. - Free-tier eligibility and
limits. - Data handling and retention terms. - Tool calling and
streaming support for the selected model. - Error formats and usage
metadata.

Never assume that a free tier is unlimited or appropriate for real
customer data.

### 4.2 Embedding-model decision

Select the embedding model before creating the production Qdrant
collection. Record the model identifier and vector dimensions in
configuration and document metadata. Changing embedding models may
require re-embedding all stored chunks and/or creating a new collection.

------------------------------------------------------------------------

## 5. High-Level Architecture

``` text
Business Admin
    |
    v
React Dashboard ------------------------------+
    |                                         |
    v                                         v
Express API <--------------------------- Embedded Widget
    |
    +-- Authentication / Authorization
    +-- Organization and Chatbot modules
    +-- Knowledge Management module
    +-- Conversation module
    +-- Usage and Observability module
    |
    v
Application Use Cases
    |
    +-- Chatbot Use Cases
    +-- Document Ingestion Use Cases
    +-- Send Message Use Case
    |
    v
Ports / Interfaces
    |
    +----------+------------+------------------+
    |          |            |                  |
    v          v            v                  v
 MongoDB   AI Provider   Embedding Provider   Vector Store
                |              |                 |
                v              v                 v
             LLM API       Embedding API        Qdrant

Object storage: original uploaded files
Redis/BullMQ: background ingestion jobs when introduced
```

### 5.1 Architectural style

Use a modular monolith initially. Deploy one backend application, but
keep responsibilities separated by modules and Clean Architecture
boundaries.

### 5.2 Dependency direction

-   Domain must not depend on Express, Mongoose, AI SDKs, or Qdrant
    SDKs.
-   Application use cases depend on domain types and interfaces/ports.
-   Infrastructure implements interfaces using concrete libraries and
    external services.
-   Presentation handles HTTP, request validation, authentication
    middleware, and response formatting.
-   Dependency injection/wiring occurs in the composition root (for
    example, `main.ts` or a dedicated container).

### 5.3 Suggested backend structure

``` text
server/
└── src/
    ├── domain/
    │   ├── entities/
    │   ├── value-objects/
    │   ├── repositories/
    │   └── errors/
    ├── application/
    │   ├── use-cases/
    │   ├── interfaces/
    │   ├── dto/
    │   └── services/
    ├── infrastructure/
    │   ├── database/
    │   │   ├── models/
    │   │   └── repositories/
    │   ├── ai/
    │   ├── embeddings/
    │   ├── vector-store/
    │   ├── document-processing/
    │   ├── storage/
    │   ├── queue/
    │   └── observability/
    ├── presentation/
    │   ├── routes/
    │   ├── controllers/
    │   ├── middlewares/
    │   ├── validators/
    │   └── presenters/
    ├── config/
    ├── composition/
    └── main.ts
```

Avoid creating empty layers or abstractions without a real use. Keep the
architecture consistent rather than maximizing folder count.

### 5.4 Suggested repository structure

``` text
flexbot/
├── apps/
│   ├── dashboard/          # React admin dashboard
│   ├── widget/             # Independently bundled embeddable chat widget
│   └── server/             # Express API
├── packages/
│   └── shared/             # Shared API types/schemas only when useful
├── docs/
│   └── FLEXBOT_PROJECT_REFERENCE.md
├── docker-compose.yml
├── pnpm-workspace.yaml
├── .env.example
└── README.md
```

A pnpm workspace is optional but suitable for this project. Keep the
widget independently buildable and deployable. Never put server secrets
in a frontend/shared package.

------------------------------------------------------------------------

## 6. Core Domain Model

The following are conceptual models. Final Mongoose schemas should
include validation, indexes, timestamps, and explicit deletion/retention
behavior.

### 6.1 User

Purpose: A FlexBot platform account.

Suggested fields: - `_id` - `name` - `email` (normalized and unique
according to account policy) - `passwordHash` or identity-provider
reference - `status` - `createdAt`, `updatedAt`

Never store plaintext passwords.

### 6.2 Organization

Purpose: Tenant/business boundary.

Suggested fields: - `_id` - `name` - `slug` - `createdAt`, `updatedAt`

### 6.3 Membership

Purpose: Connect a user to an organization with a role.

Suggested fields: - `_id` - `organizationId` - `userId` - `role`
(`owner`, `admin`, `member`) - `createdAt`

Create a unique compound index on organization and user.

### 6.4 Chatbot

Suggested fields: - `_id` - `organizationId` - `name` - `publicId`
(random, non-secret identifier) - `systemInstructions` - `provider` -
`model` - `welcomeMessage` - `appearance` (theme and display
configuration) - `allowedOrigins` - `status` (`active`, `inactive`) -
`createdAt`, `updatedAt`

Do not treat `publicId` as proof that a caller may access private
resources.

### 6.5 KnowledgeSource

Purpose: Track uploaded files, FAQs, or website URLs.

Suggested fields: - `_id` - `organizationId` - `chatbotId` (or an
explicitly defined organization-level scope) - `type` (`pdf`, `text`,
`website`, `faq`) - `name` - `storageKey` or source URL - `status`
(`pending`, `processing`, `completed`, `failed`, `deleting`) -
`checksum` - `chunkCount` - `errorCode` / safe error summary -
`createdAt`, `updatedAt`

### 6.6 Conversation

Suggested fields: - `_id` - `organizationId` - `chatbotId` - `visitorId`
or a securely managed anonymous session reference - `status` (`open`,
`closed`, `escalated`) - `createdAt`, `updatedAt`

Anonymous session credentials must be random, scoped, expiring, and not
guessable. Do not authorize access by conversation ID alone.

### 6.7 Message

Suggested fields: - `_id` - `organizationId` - `chatbotId` -
`conversationId` - `role` (`user`, `assistant`, optionally `system` only
for controlled internal records) - `content` - `sources` (safe
references to retrieved knowledge) - `model` - `inputTokens`,
`outputTokens` when available - `latencyMs` - `status` (`complete`,
`failed`, `cancelled`) - `createdAt`

Do not expose internal prompts, hidden reasoning, provider secrets, or
raw infrastructure errors to visitors.

### 6.8 UsageRecord (later milestone)

Track request count, token usage where available, model, latency, and
estimated cost by organization and chatbot. Treat provider usage as the
source of truth when available; estimates should be labeled as
estimates.

------------------------------------------------------------------------

## 7. Multi-Tenancy and Authorization

Tenant isolation is a core requirement, not an optional optimization.

1.  Resolve the organization from the authenticated membership or the
    chatbot's server-side record.
2.  Never trust a client-supplied `organizationId` without authorization
    checks.
3.  Every repository query for tenant-owned data must include the
    authorized tenant scope.
4.  Verify that a chatbot, document, conversation, and message belong to
    the same permitted scope.
5.  Apply tenant and chatbot filters to vector search before retrieved
    content enters a prompt.
6.  Use least-privilege roles for organization membership.
7.  Test cross-tenant access explicitly.
8.  Public widget IDs identify the chatbot but do not grant
    dashboard/admin permissions.
9.  Restrict widget origins as a browser-level control, but do not rely
    on CORS/origin checks as the only abuse or authorization defense.
10. Avoid leaking whether another tenant's private resource exists.

------------------------------------------------------------------------

## 8. Knowledge Ingestion Pipeline

### 8.1 Initial supported source

PDF text extraction is the first supported knowledge source. Later add
FAQ entries and website URLs.

### 8.2 Pipeline

``` text
Upload
  -> Validate request, size, extension, MIME and PDF signature
  -> Authorize organization/chatbot
  -> Store original file
  -> Create KnowledgeSource record (pending)
  -> Extract text
  -> Normalize/clean text
  -> Split into chunks with overlap
  -> Generate embeddings in batches
  -> Store vectors and payload in Qdrant
  -> Mark source completed
```

On failure: - Mark the source `failed`. - Save a safe, actionable error
code. - Clean up partial vector writes when feasible. - Support retry
without duplicating chunks. - Keep processing idempotent using source
ID, version/checksum, and chunk identifiers.

### 8.3 Chunking

Begin with a configurable chunk size and overlap appropriate for the
chosen embedding model. Measure retrieval quality instead of assuming
one universal value.

Preserve useful metadata: - `organizationId` - `chatbotId` or knowledge
scope - `documentId` - `chunkIndex` - `sourceType` - page number or
source URL when available - document version/checksum

### 8.4 File safety

-   Enforce upload size and page-count limits.
-   Verify actual file content; do not trust the filename or browser
    MIME type alone.
-   Generate server-side storage keys.
-   Keep uploaded files private.
-   Do not execute uploaded content.
-   Consider malware scanning before production.
-   Do not allow arbitrary remote URLs to access internal network
    resources when implementing website ingestion.
-   Use OCR only in a later phase for scanned PDFs.

### 8.5 Storage responsibility

-   MongoDB: source metadata and processing state.
-   Object storage: original file.
-   Qdrant: vectors, text chunks or retrievable chunk payload, and
    retrieval metadata.
-   Redis/BullMQ: ingestion job state/queue when background processing
    is introduced.

Use a `FileStorage` interface. Local disk is acceptable for local
development; production should use durable object storage.

------------------------------------------------------------------------

## 9. RAG Question-Answering Pipeline

### 9.1 Request flow

``` text
Visitor message
  -> Validate input and session
  -> Resolve active chatbot and tenant
  -> Load authorized, limited conversation history
  -> Embed the latest question
  -> Search Qdrant with tenant/chatbot filters
  -> Evaluate whether retrieved evidence is relevant
  -> Build prompt with instructions, history, and evidence
  -> Call AI provider
  -> Stream or return response
  -> Persist user/assistant messages and metadata
  -> Record usage and latency
```

### 9.2 Prompt construction rules

The prompt should: - Explain that retrieved documents are reference
material, not trusted instructions. - Tell the model to answer from the
supplied evidence when the question is about business-specific
knowledge. - Require the model to acknowledge insufficient evidence. -
Ask for concise, customer-friendly responses. - Avoid exposing private
prompts, internal configuration, or other tenants' data. - Provide
source identifiers/metadata so citations can be generated by the
application.

Prompt instructions alone are not a security boundary. Enforce
authorization in code and validate tool arguments server-side.

### 9.3 Retrieval rules

-   Apply tenant/chatbot filters inside the vector search query.
-   Set a configurable top-k.
-   Use a relevance threshold only after evaluating its behavior for the
    selected embedding model.
-   Do not send irrelevant or excessive context to the LLM.
-   Track retrieved document IDs and scores for debugging.
-   Keep citations tied to actual retrieved chunks; never invent source
    references.
-   Consider hybrid search and reranking only after the basic retrieval
    pipeline is tested.

### 9.4 Conversation context

-   Store the full permitted message history according to retention
    policy.
-   Send only a relevant recent window or a maintained summary to the
    model.
-   Limit message size and total context.
-   Do not allow a visitor to request another visitor's conversation
    history.

### 9.5 Streaming

Implement non-streaming responses first for easier debugging. Add SSE
once the complete RAG request works.

For SSE: - Set appropriate headers and handle disconnects. - Send typed
events such as `message_start`, `token`, `sources`, `message_complete`,
and `error`. - Persist final state even if the browser disconnects where
practical. - Support cancellation and timeouts. - Do not send raw
provider errors or secrets to the client.

------------------------------------------------------------------------

## 10. AI Provider and Embedding Interfaces

Application logic must depend on interfaces rather than vendor SDKs.

Example conceptual interfaces:

``` typescript
export interface AIProvider {
  generateResponse(
    request: GenerateRequest
  ): Promise<GenerateResponse>;

  streamResponse(
    request: GenerateRequest
  ): AsyncIterable<string>;
}

export interface EmbeddingProvider {
  embedDocuments(texts: string[]): Promise<number[][]>;
  embedQuery(text: string): Promise<number[]>;
}

export interface VectorStore {
  upsertChunks(chunks: VectorChunk[]): Promise<void>;
  search(query: VectorQuery): Promise<RetrievedChunk[]>;
  deleteBySource(sourceId: string): Promise<void>;
}
```

These are design examples; adjust signatures to support cancellation,
provider usage, tool calls, and error normalization.

### Provider adapter responsibilities

-   Map internal request types to the provider SDK.
-   Normalize responses and usage metadata.
-   Convert provider errors into safe application errors.
-   Support timeout and cancellation.
-   Avoid logging credentials or full sensitive prompts.
-   Keep model/provider configuration on the server.
-   Expose only the features actually supported by the chosen model.

Do not add multiple providers until one provider is fully working and
tested.

------------------------------------------------------------------------

## 11. API Design

Prefix APIs with `/api/v1` once the initial route set is established.

### Authentication and organization

  -----------------------------------------------------------------------------------------
  Method                  Endpoint                                  Purpose
  ----------------------- ----------------------------------------- -----------------------
  POST                    `/api/v1/auth/register`                   Register

  POST                    `/api/v1/auth/login`                      Login

  POST                    `/api/v1/auth/logout`                     Logout

  GET                     `/api/v1/auth/me`                         Current account

  POST                    `/api/v1/organizations`                   Create organization

  GET                     `/api/v1/organizations/:organizationId`   Get authorized
                                                                    organization
  -----------------------------------------------------------------------------------------

### Chatbot management

  -------------------------------------------------------------------------------
  Method                  Endpoint                        Purpose
  ----------------------- ------------------------------- -----------------------
  POST                    `/api/v1/chatbots`              Create chatbot

  GET                     `/api/v1/chatbots`              List authorized
                                                          chatbots

  GET                     `/api/v1/chatbots/:chatbotId`   Get chatbot

  PATCH                   `/api/v1/chatbots/:chatbotId`   Update configuration

  DELETE                  `/api/v1/chatbots/:chatbotId`   Delete/deactivate
                                                          according to policy
  -------------------------------------------------------------------------------

### Knowledge management

  -------------------------------------------------------------------------------------------------
  Method                  Endpoint                                          Purpose
  ----------------------- ------------------------------------------------- -----------------------
  POST                    `/api/v1/chatbots/:chatbotId/knowledge-sources`   Upload/register source

  GET                     `/api/v1/chatbots/:chatbotId/knowledge-sources`   List sources

  GET                     `/api/v1/knowledge-sources/:sourceId`             Get processing status

  POST                    `/api/v1/knowledge-sources/:sourceId/reprocess`   Retry/reprocess

  DELETE                  `/api/v1/knowledge-sources/:sourceId`             Delete source and
                                                                            associated chunks
  -------------------------------------------------------------------------------------------------

### Conversations and public widget

  --------------------------------------------------------------------------------------------------
  Method                  Endpoint                                           Purpose
  ----------------------- -------------------------------------------------- -----------------------
  POST                    `/api/v1/public/chat/sessions`                     Create limited
                                                                             anonymous session

  POST                    `/api/v1/public/chat/messages`                     Send message; later
                                                                             support SSE

  GET                     `/api/v1/conversations`                            List authorized
                                                                             conversations

  GET                     `/api/v1/conversations/:conversationId/messages`   Get authorized message
                                                                             history
  --------------------------------------------------------------------------------------------------

The public API must use a dedicated anonymous-session mechanism and
strict limits. Dashboard endpoints require authenticated organization
membership.

Define consistent success/error response shapes, pagination, request
IDs, and Zod schemas.

------------------------------------------------------------------------

## 12. Embeddable Widget

### 12.1 Integration target

The first widget should work on ordinary HTML websites regardless of
their framework.

Conceptual embed snippet:

``` html
<script
  src="https://YOUR-FLEXBOT-DOMAIN/widget.js"
  data-chatbot-id="PUBLIC_CHATBOT_ID"
  defer
></script>
```

### 12.2 Widget responsibilities

-   Render floating launcher and chat panel.
-   Show welcome message and message history.
-   Submit messages and render assistant responses.
-   Show loading, streaming, retry, and error states.
-   Preserve a limited anonymous session safely.
-   Adapt to mobile and desktop.
-   Apply public branding configuration.
-   Handle network failure and reconnect behavior gracefully.

### 12.3 Security considerations

-   Public chatbot ID is not a secret.
-   Do not embed provider API keys or admin credentials.
-   Use server-side origin policy and rate limits.
-   CORS is not authentication.
-   Validate all widget requests on the backend.
-   Keep anonymous session credentials scoped and expiring.
-   Avoid unsafe HTML rendering; sanitize or render Markdown safely.
-   Do not let arbitrary widget configuration inject scripts or unsafe
    HTML.

A React component package can be added later for React/Next.js
customers, but the backend chat contract should remain
framework-independent.

------------------------------------------------------------------------

## 13. Security and Privacy Checklist

### Authentication

-   Hash passwords using a well-maintained password hashing
    implementation.
-   Use secure session or token handling; prefer secure, HttpOnly,
    appropriately configured cookies where suitable.
-   Implement logout/revocation behavior.
-   Rate-limit login and account recovery endpoints.
-   Avoid revealing whether an account exists unnecessarily.

### Authorization and tenant isolation

-   Enforce organization membership on every dashboard operation.
-   Enforce tenant scope in database and vector queries.
-   Verify conversation ownership/session authorization.
-   Test IDOR and cross-tenant access scenarios.

### API and file handling

-   Validate all inputs with Zod.
-   Apply payload, upload, page-count, timeout, and output limits.
-   Use server-generated storage keys.
-   Keep files private.
-   Use safe error responses.
-   Apply request throttling and concurrency limits.

### AI-specific security

-   Treat user input and retrieved documents as untrusted.
-   Do not rely on prompts for authorization.
-   Validate all tool arguments and permissions in server code.
-   Do not reveal secrets, hidden instructions, or cross-tenant data.
-   Apply output validation where the application expects structured
    data.
-   Avoid giving the model unrestricted database or shell access.

### Secrets and operations

-   Store secrets in environment variables locally and a secret manager
    in production.
-   Commit `.env.example`, never real `.env` secrets.
-   Redact credentials and sensitive content from logs.
-   Configure HTTPS, backups, retention, and deletion procedures.
-   Review AI provider data-handling terms before using real customer
    information.

------------------------------------------------------------------------

## 14. Error Handling and Observability

Use a consistent application error model with safe public messages and
internal diagnostic details.

Track: - Request ID/correlation ID. - Endpoint and status code. -
Latency by stage (retrieval, embedding, LLM). - Provider/model
identifier. - Token usage where available. - Retrieval count and source
identifiers. - Ingestion failures and retry count. - Queue depth and
processing duration when jobs are added. - Rate-limit and validation
failures.

Never log API keys, session tokens, passwords, or unnecessary personal
data. Avoid storing full customer prompts in logs by default.

Provide graceful handling for: - Provider rate limits and outages. -
Timeouts and cancelled requests. - Empty or non-text PDFs. - Embedding
failures. - Vector database outages. - Duplicate uploads. - Partial
ingestion. - Missing retrieval evidence. - Malformed provider responses.

Use retries only where safe, with bounded attempts and backoff. Make
document ingestion idempotent.

------------------------------------------------------------------------

## 15. Testing Strategy

### Unit tests

-   Domain invariants.
-   Use-case logic.
-   Chunking and normalization.
-   Prompt construction.
-   Relevance/abstention decisions.
-   Usage calculation.

### Integration tests

-   Repository behavior.
-   Tenant-scoped queries.
-   AI provider adapter using mocks or a test provider.
-   Vector-store adapter.
-   Upload and processing workflow.
-   Authentication and authorization middleware.

### End-to-end tests

-   Register and create organization.
-   Create chatbot.
-   Upload a test PDF.
-   Wait for processing completion.
-   Ask a question whose answer exists in the PDF.
-   Verify the answer and source.
-   Ask a question absent from the PDF and verify the bot acknowledges
    insufficient evidence.
-   Confirm one tenant cannot retrieve another tenant's knowledge.
-   Test the widget on a separate page.

### AI evaluation dataset

Maintain a small fixed dataset with: - Question. - Expected facts or
answer. - Expected source document. - Whether the system should answer
or abstain.

Evaluate retrieval quality, factual grounding, latency, and cost
whenever prompts, models, chunking, or retrieval settings change.

------------------------------------------------------------------------

## 16. Development Roadmap and Acceptance Criteria

### Milestone 1 --- Project foundation

-   Workspace and applications configured.
-   TypeScript, linting, formatting, environment validation, and basic
    tests set up.
-   Express server starts and exposes a health endpoint.
-   MongoDB connection is reliable.
-   Architecture boundaries are documented.

**Acceptance:** Clean local setup from README instructions; health and
database checks work.

### Milestone 2 --- Authentication and tenant model

-   User registration/login/logout.
-   Organization and membership.
-   Authorization middleware.
-   Initial tenant-scoped repositories.

**Acceptance:** Authenticated user can access only organizations they
belong to.

### Milestone 3 --- Chatbot management

-   CRUD and configuration.
-   Allowed origins and active status.
-   Dashboard screens and validation.

**Acceptance:** An organization can create and configure its own
chatbot.

### Milestone 4 --- PDF ingestion

-   Upload validation and storage interface.
-   Text extraction and chunking.
-   Source status and safe error handling.

**Acceptance:** A valid PDF is processed and its chunks can be inspected
in a controlled development environment.

### Milestone 5 --- Embeddings and vector search

-   Embedding adapter.
-   Qdrant collection and schema.
-   Upsert, search, delete, and tenant filters.

**Acceptance:** A test query retrieves relevant chunks from the correct
knowledge source only.

### Milestone 6 --- RAG chat

-   AI provider adapter.
-   Retrieval and prompt construction.
-   Conversation/message persistence.
-   Citations and insufficient-evidence behavior.

**Acceptance:** Questions grounded in the PDF receive evidence-based
answers; unsupported questions are not fabricated.

### Milestone 7 --- Streaming and widget

-   SSE endpoint.
-   Independently bundled widget.
-   Error, loading, and mobile states.

**Acceptance:** A separate website can embed the widget and complete a
conversation.

### Milestone 8 --- Website ingestion and FAQ

-   URL validation and safe fetching.
-   HTML extraction and content normalization.
-   FAQ management and re-indexing.

**Acceptance:** Approved sources can be indexed and searched without
permitting internal-network access.

### Milestone 9 --- Hardening

-   Rate limits and usage tracking.
-   Structured logs and request IDs.
-   Cross-tenant security tests.
-   Backups and deletion workflows.

**Acceptance:** Key security and failure scenarios pass automated tests.

### Milestone 10 --- Deployment

-   Production environment configuration.
-   HTTPS and private infrastructure configuration.
-   Durable file storage and database/vector backups.
-   Monitoring and recovery runbook.

**Acceptance:** A deployed test organization can create a chatbot,
ingest knowledge, and answer questions securely.

------------------------------------------------------------------------

## 17. Environment Configuration

Keep an `.env.example` with placeholders only. Exact variables depend on
selected packages, but likely include:

``` dotenv
NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:5173

MONGODB_URI=mongodb://localhost:27017/flexbot

AI_PROVIDER=gemini
GEMINI_API_KEY=
GEMINI_MODEL=

EMBEDDING_PROVIDER=
EMBEDDING_MODEL=
EMBEDDING_DIMENSIONS=

QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=

FILE_STORAGE_DRIVER=local
LOCAL_UPLOAD_DIR=./uploads

REDIS_URL=redis://localhost:6379
```

Do not copy this blindly into production. Validate required variables at
startup, and do not require Redis until the corresponding feature is
enabled. Use separate development/test/production configuration and
never commit real secrets.

------------------------------------------------------------------------

## 18. Deployment Strategy

### Local development

-   Run MongoDB and Qdrant locally or through Docker.
-   Use local file storage.
-   Use a development AI API key kept on the server.
-   Add Redis only when background jobs are implemented.

### Production

-   Deploy the dashboard and widget as static assets.
-   Deploy the API behind HTTPS.
-   Use managed or securely operated MongoDB and Qdrant.
-   Use private object storage for uploaded files.
-   Store secrets in a secret manager or secure deployment environment.
-   Configure backups, health checks, log retention, and alerts.
-   Restrict database/vector database network access.
-   Establish data retention and deletion policies.

Do not expose MongoDB, Qdrant, Redis, or object storage credentials to
the browser.

------------------------------------------------------------------------

## 19. AI Coding IDE Instructions

This section is intended to guide an AI coding IDE when it uses this
document as project context.

### Before making changes

1.  Read this reference file and the current README.
2.  Inspect the existing repository and identify implemented
    functionality.
3.  Identify the current milestone and its acceptance criteria.
4.  Do not assume a feature is implemented just because it appears in
    this document.
5.  Ask before introducing a major architectural change or a paid
    external dependency.

### While implementing

1.  Work in small, reviewable milestones.
2.  Follow the documented dependency direction.
3.  Keep domain and application logic independent of infrastructure
    SDKs.
4.  Validate external input using Zod or the established validation
    layer.
5.  Enforce tenant scope in every relevant query and vector search.
6.  Add tests for new use cases and security-sensitive behavior.
7.  Update `.env.example` and setup documentation when configuration
    changes.
8.  Handle errors explicitly and never leak secrets.
9.  Do not invent SDK methods; verify package documentation and
    installed versions.
10. Do not install large frameworks unless they solve a concrete
    requirement.
11. Do not silently replace the selected stack.
12. Report files changed, commands run, tests passed, and known
    limitations.

### Before completing a milestone

-   Run formatting, linting, type checks, and relevant tests.
-   Confirm acceptance criteria are met.
-   Document any deviations from this reference.
-   Update the implementation status below.

### Important distinction

This document describes the **target architecture and planned scope**.
It is not proof that any feature already exists. The actual repository
and passing tests determine implementation status.

------------------------------------------------------------------------

## 20. Implementation Status

Update this table as work progresses.

  -------------------------------------------------------------------------
  Area                      Status                  Notes
  ------------------------- ----------------------- -----------------------
  Requirements and          Planned                 This document is the
  architecture                                      initial reference

  Repository/workspace      Not started             
  setup                                             

  Authentication            Not started             

  Organization/membership   Not started             

  Chatbot CRUD              Not started             

  PDF upload and extraction Not started             

  Chunking                  Not started             

  Embedding provider        Not started             

  Qdrant integration        Not started             

  RAG and answer grounding  Not started             

  Conversation persistence  Not started             

  SSE streaming             Not started             

  Embeddable widget         Not started             

  Website ingestion         Not started             

  Security hardening        Not started             

  Production deployment     Not started             
  -------------------------------------------------------------------------

Suggested statuses: `Not started`, `In progress`, `Blocked`,
`Implemented`, `Verified`.

------------------------------------------------------------------------

## 21. Open Decisions

Do not let unresolved choices block the basic architecture, but resolve
them before the affected implementation begins.

1.  Exact embedding provider/model and vector dimensions.
2.  Final AI model identifier and production provider.
3.  Authentication approach: cookie-based sessions or access/refresh
    token strategy.
4.  Local upload implementation and eventual object-storage provider.
5.  Initial upload size and page-count limits.
6.  Chunking parameters based on evaluation.
7.  Citation presentation in the widget.
8.  Retention and deletion policy for conversations and uploaded
    knowledge.
9.  Production hosting and managed database choices.
10. Whether organization-level knowledge bases will be shared across
    multiple chatbots or sources will initially be chatbot-scoped.

------------------------------------------------------------------------

## 22. Definition of Done

A feature is not complete merely because the happy path works once.

A feature is considered done when: - Requirements and behavior are
clear. - Inputs and errors are validated. - Authorization and tenant
boundaries are enforced. - Relevant tests pass. - Logs do not expose
secrets. - UI has loading, empty, success, and error states where
applicable. - Documentation and environment examples are updated. - The
change does not violate the architecture. - Known limitations are
recorded.

For AI features, also verify grounding, unsupported-question behavior,
retrieval quality, and cost/latency where relevant.

------------------------------------------------------------------------

## 23. First End-to-End Demo

The first meaningful demo should follow this exact scenario:

1.  A user registers and creates an organization.
2.  The user creates a chatbot called `Fabrico Support`.
3.  The user uploads a sample return-policy PDF.
4.  FlexBot extracts and indexes the document.
5.  The dashboard shows the source as `completed`.
6.  A visitor asks: "Can I return an eligible item within 20 days?"
7.  FlexBot retrieves the relevant policy chunk and answers with a
    source reference.
8.  The visitor asks a question that is not covered by the PDF.
9.  FlexBot acknowledges that the available information is insufficient.
10. A second organization cannot retrieve the first organization's
    documents or conversation.

This demo validates the central product value, RAG workflow,
persistence, and tenant isolation.

------------------------------------------------------------------------

## 24. Reference Links

Use official documentation and verify current versions during
implementation.

-   Google AI Studio: https://aistudio.google.com/
-   Gemini API documentation: https://ai.google.dev/gemini-api/docs
-   Gemini API pricing: https://ai.google.dev/gemini-api/docs/pricing
-   Qdrant documentation: https://qdrant.tech/documentation/
-   MongoDB documentation: https://www.mongodb.com/docs/
-   Mongoose documentation: https://mongoosejs.com/docs/
-   Express documentation: https://expressjs.com/
-   Zod documentation: https://zod.dev/
-   LangChain documentation (optional later):
    https://docs.langchain.com/
-   LangGraph documentation (optional later):
    https://docs.langchain.com/oss/javascript/langgraph/overview
-   Ollama (optional local experimentation): https://ollama.com/

------------------------------------------------------------------------

## 25. Final Architecture Summary

**FlexBot is a multi-tenant, knowledge-based AI customer support
platform built with React, Node.js, Express, TypeScript, and MongoDB. It
uses a provider-independent AI layer, an embedding model, and Qdrant for
retrieval-augmented generation. Businesses manage chatbots and knowledge
sources through a dashboard, while visitors interact through an
embeddable widget. The system begins as a modular monolith and
prioritizes tenant isolation, grounded answers, testability, and
incremental delivery.**

**Build order:** Foundation → Authentication and tenancy → Chatbot
management → PDF ingestion → Embeddings and vector search → RAG →
Conversation persistence → Streaming → Widget → Website ingestion →
Security hardening → Deployment.
