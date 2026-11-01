# FlexBot 🤖

> A configurable, embeddable, knowledge-based AI customer support platform.

[![Status](https://img.shields.io/badge/status-in%20development-orange.svg)]()
[![Architecture](https://img.shields.io/badge/architecture-modular%20monolith-blue.svg)]()
[![Stack](https://img.shields.io/badge/stack-TypeScript%20%7C%20Node.js-informational.svg)]()

---

## 📌 What is FlexBot?

**FlexBot** is an AI customer support platform that allows organizations to create, configure, and deploy intelligent chatbots tailored to their specific business needs.

Instead of answering based purely on generic, unverified model knowledge, FlexBot uses **Retrieval-Augmented Generation (RAG)**. It connects directly to business-approved knowledge sources (such as documentation, policies, FAQs, and manuals) to provide accurate, grounded answers to customer questions. Businesses can embed the chatbot into their website via a lightweight chat widget or interact with it through APIs.

---

## 💡 Why FlexBot?

### The Problem
* **Repetitive Queries:** Support teams spend substantial time and resources answering the same questions about products, shipping, returns, troubleshooting, and policies.
* **Cost & Scalability:** Providing 24/7 human customer support across multiple time zones is expensive and difficult to scale during traffic spikes.
* **Generic AI Hallucinations:** Standard out-of-the-box LLMs lack proprietary company context and often invent facts ("hallucinate"), which can mislead customers.
* **Complex Custom Infrastructure:** Building a secure, multi-tenant RAG pipeline, vector search system, and embeddable widget from scratch is resource-intensive for individual businesses.

### The Solution
* **Knowledge-Grounded Answers:** Responses are strictly synthesized from approved business documentation, including source citations and honest admissions when information is unavailable.
* **Turnkey Multi-Tenant AI Engine:** Build once and configure many. Multiple organizations can manage their own distinct chatbots and knowledge bases without maintaining custom AI infrastructure.
* **Zero-Friction Integration:** Embed a clean, responsive chat widget on any website using a simple script tag.
* **Tenant Isolation & Security:** Strong isolation ensures that organization data, documents, configurations, and customer chat histories never leak across tenants.

---

## 🚀 Key Features (MVP & Roadmap)

* [ ] **Organization & Tenant Management:** Workspaces with role-based member permissions.
* [ ] **Custom Chatbot Configuration:** Customizable personality, instructions, welcome messages, and UI branding.
* [ ] **Knowledge Source Ingestion:** Document parsing (PDF text extraction), intelligent chunking, and vector embedding.
* [ ] **Vector Retrieval & RAG:** Contextual search with vector databases (Qdrant) and LLMs (Google Gemini).
* [ ] **Citations & Transparency:** Responses cite the exact knowledge chunk used to answer questions.
* [ ] **Embeddable Chat Widget:** Client-side JavaScript widget for instant website integration.
* [ ] **Admin Dashboard:** Web interface to manage chatbots, monitor conversations, and inspect knowledge bases.

---

## 🏗️ Repository Structure

FlexBot is structured as a modular monorepo:

```text
flexbot/
├── apps/
│   ├── server/       # Node.js + Express REST API (Clean Architecture)
│   ├── dashboard/    # Admin console (React + Vite)
│   └── widget/       # Embeddable client-side chat widget
├── packages/
│   └── shared/       # Shared TypeScript types, schemas, and utilities
└── docs/             # Architecture specifications and documentation
```

---

## ⚙️ Development Status

> [!NOTE]
> FlexBot is currently in **active initial development**. The core architecture and backend services are actively being built.

### Running the Server Locally

```bash
# Navigate to the backend server directory
cd apps/server

# Install dependencies
npm install

# Start development server
npm run dev
```

For more detailed architectural specifications, data models, and system design, see the documentation in [docs/FlexBot_Project_Reference.md](file:///home/oxynub/Projects/flexbot/docs/FlexBot_Project_Reference.md).


After all this you have any doubts? Here it Solves.

Imagine an ecommerce company integrates FlexBot into its website.

A customer visits the website and asks:
Where is my order? I placed it three days ago.

The chatbot should understand the question, retrieve relevant information, and generate a helpful response.

Another customer asks:
What is your return policy?

The chatbot should answer based on the company's actual return policy, not invent an answer.

This is the main goal of FlexBot.

Our chatbot should:
- Understand natural language.
- Answer questions using company-specific information.
- Maintain conversation context.
- Support multiple organizations.
- Provide accurate responses based on available knowledge.
- Integrate with external applications.
- Support different AI models in the future.