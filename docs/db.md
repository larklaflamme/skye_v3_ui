# Building a Node.js and TypeScript Backend with MongoDB, Neo4j, and Qdrant

Most backend applications start with one database. As the product grows, different kinds of data often need different storage systems.

A document database is good at storing application records. A graph database is better at representing relationships. A vector database is designed for similarity search over embeddings.

This tutorial shows how to use three popular database technologies from a Node.js and TypeScript backend:

- **MongoDB** for application documents
- **Neo4j** for a knowledge graph
- **Qdrant** for vector search

The example application will be a small knowledge base.

It will store:

- Articles and notes in MongoDB
- Relationships between articles, topics, and authors in Neo4j
- Vector embeddings for semantic search in Qdrant

The resulting architecture looks like this:

```text
                    ┌───────────────┐
                    │   Node.js API │
                    └───────┬───────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
      MongoDB            Neo4j             Qdrant
   Documents          Relationships      Embeddings
```

The three databases are not interchangeable.

MongoDB answers:

> What is the content of this article?

Neo4j answers:

> Which topics, authors, and articles are connected?

Qdrant answers:

> Which stored documents are semantically similar to this query?

That separation is the main idea behind the architecture.

---

# Why use three databases?

Using multiple databases adds operational complexity, so it should be done for a reason.

## MongoDB

MongoDB stores JSON-like documents in collections.

It is a good fit for:

- User profiles
- Articles
- Product catalogs
- Event records
- Flexible application data
- Documents that evolve over time

MongoDB’s official Node.js driver supports JavaScript and TypeScript and allows collections to be typed with TypeScript generics. [MongoDB Node.js driver documentation](https://www.mongodb.com/docs/drivers/node/current/)

## Neo4j

Neo4j stores nodes and relationships.

It is a good fit for:

- Knowledge graphs
- Recommendation systems
- Dependency graphs
- Fraud detection
- Organization structures
- Social connections
- Access-control relationships

Instead of representing everything as nested JSON, Neo4j lets you model relationships directly:

```text
(Alice)-[:WROTE]->(Article)
(Article)-[:ABOUT]->(TypeScript)
(Article)-[:REFERENCES]->(MongoDB)
```

Neo4j uses the Cypher query language.

## Qdrant

Qdrant stores vectors and supports similarity search.

It is useful for:

- Semantic search
- Retrieval-augmented generation
- Recommendation systems
- Duplicate detection
- Image similarity
- Document clustering
- Finding related content

Qdrant’s search process compares a query vector with stored vectors and returns the closest matches. It provides an official JavaScript/TypeScript client. [Qdrant client documentation](https://qdrant.tech/documentation/interfaces/)

---

# The data flow

When an article is created, the backend will perform three writes:

```text
1. Store article content in MongoDB
2. Create article relationships in Neo4j
3. Generate and store an embedding in Qdrant
```

When a user performs a semantic search:

```text
1. Convert the query into an embedding
2. Search Qdrant for similar vectors
3. Extract matching article IDs
4. Load full article documents from MongoDB
5. Optionally expand related topics through Neo4j
```

The vector database does not need to contain the entire article. It can store only:

```json
{
  "articleId": "article-123",
  "title": "TypeScript Backend Patterns"
}
```

The complete article remains in MongoDB.

---

# Prerequisites on Ubuntu

Install Node.js through `nvm`:

```bash
sudo apt update
sudo apt install -y curl git build-essential
```

Install `nvm`:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.6/install.sh | bash
```

Reload your shell:

```bash
source ~/.bashrc
```

Install an LTS version of Node.js:

```bash
nvm install --lts
nvm alias default lts/*
```

Verify:

```bash
node --version
npm --version
```

You also need Docker and Docker Compose for local database development.

Verify Docker:

```bash
docker --version
docker compose version
```

---

# Create the project

```bash
mkdir -p ~/projects/knowledge-api
cd ~/projects/knowledge-api
```

Pin the Node version:

```bash
echo "22" > .nvmrc
nvm install
nvm use
```

Initialize npm:

```bash
npm init -y
```

Install the runtime dependencies:

```bash
npm install \
  fastify \
  mongodb \
  neo4j-driver \
  @qdrant/js-client-rest \
  zod
```

Install development dependencies:

```bash
npm install --save-dev \
  typescript \
  tsx \
  @types/node
```

The project uses:

- Fastify for HTTP routing
- MongoDB’s official driver
- Neo4j’s official JavaScript driver
- Qdrant’s JavaScript REST client
- Zod for runtime validation
- TypeScript for static checking
- `tsx` for development execution

---

# Configure `package.json`

```json
{
  "name": "knowledge-api",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@qdrant/js-client-rest": "^1.0.0",
    "fastify": "^5.0.0",
    "mongodb": "^6.0.0",
    "neo4j-driver": "^6.0.0",
    "zod": "^4.0.0"
  },
  "devDependencies": {
    "@types/node": "^24.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

The exact versions may differ. Your `package-lock.json` records the actual dependency tree installed by npm.

Create the project structure:

```bash
mkdir -p src/db src/articles
touch src/server.ts
touch src/config.ts
touch src/app.ts
touch src/db/mongodb.ts
touch src/db/neo4j.ts
touch src/db/qdrant.ts
touch src/articles/article.types.ts
touch src/articles/article.schemas.ts
touch src/articles/article.service.ts
touch tsconfig.json
touch .env.example
touch .gitignore
```

---

# Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "sourceMap": true,
    "declaration": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

Use strict mode from the beginning. It is much easier to keep a project type-safe than to retrofit strictness after thousands of lines have been written.

---

# Configure environment variables

Create `.env.example`:

```env
NODE_ENV=development
PORT=3000

MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DATABASE=knowledge_api

NEO4J_URI=neo4j://127.0.0.1:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=secretgraph

QDRANT_URL=http://127.0.0.1:6333
QDRANT_API_KEY=
QDRANT_COLLECTION=articles
```

Create `.gitignore`:

```gitignore
node_modules/
dist/
.env
.env.*
!.env.example
```

Copy the example:

```bash
cp .env.example .env
```

Do not commit `.env`.

---

# Start MongoDB, Neo4j, and Qdrant with Docker Compose

Create `docker-compose.yml`:

```yaml
services:
  mongodb:
    image: mongo:8
    container_name: knowledge-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  neo4j:
    image: neo4j:2026.06.0
    container_name: knowledge-neo4j
    restart: unless-stopped
    environment:
      NEO4J_AUTH: neo4j/secretgraph
    ports:
      - "7474:7474"
      - "7687:7687"
    volumes:
      - neo4j_data:/data
      - neo4j_logs:/logs

  qdrant:
    image: qdrant/qdrant
    container_name: knowledge-qdrant
    restart: unless-stopped
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant_data:/qdrant/storage

volumes:
  mongodb_data:
  neo4j_data:
  neo4j_logs:
  qdrant_data:
```

Start the services:

```bash
docker compose up -d
```

Check their status:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f
```

Neo4j’s browser interface should be available at:

```text
http://localhost:7474
```

Log in with:

```text
Username: neo4j
Password: secretgraph
```

Qdrant’s local REST API is available at:

```text
http://localhost:6333
```

Qdrant recommends Docker for local development and exposes its REST API on port `6333`. [Qdrant local quickstart](https://qdrant.tech/documentation/quick-start/)

Neo4j’s official Docker image supports persistent data volumes and authentication through `NEO4J_AUTH`. [Neo4j Docker documentation](https://neo4j.com/docs/operations-manual/current/docker/introduction/)

---

# Validate configuration

Create `src/config.ts`:

```ts
import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(3000),

  MONGODB_URI: z.string().min(1),
  MONGODB_DATABASE: z.string().min(1),

  NEO4J_URI: z.string().min(1),
  NEO4J_USERNAME: z.string().min(1),
  NEO4J_PASSWORD: z.string().min(1),

  QDRANT_URL: z.string().url(),
  QDRANT_API_KEY: z.string().optional(),
  QDRANT_COLLECTION: z.string().min(1).default("articles")
});

const result = environmentSchema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid environment configuration");
  console.error(result.error.format());
  process.exit(1);
}

export const config = result.data;
```

Environment variables are strings at runtime. The schema converts and validates them before the application starts.

A backend should fail early if a required connection string or credential is missing.

---

# Connect to MongoDB

Create `src/db/mongodb.ts`:

```ts
import {
  Collection,
  MongoClient,
  type OptionalId
} from "mongodb";
import { config } from "../config.js";

export interface ArticleDocument {
  _id?: string;
  title: string;
  body: string;
  authorId: string;
  topicIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const client = new MongoClient(config.MONGODB_URI);

let articles: Collection<ArticleDocument>;

export async function connectMongoDB(): Promise<void> {
  await client.connect();

  const database = client.db(config.MONGODB_DATABASE);

  articles = database.collection<ArticleDocument>("articles");

  await articles.createIndex({
    authorId: 1
  });

  await articles.createIndex({
    topicIds: 1
  });

  await articles.createIndex({
    createdAt: -1
  });
}

export function articleCollection(): Collection<ArticleDocument> {
  if (!articles) {
    throw new Error("MongoDB has not been connected");
  }

  return articles;
}

export async function closeMongoDB(): Promise<void> {
  await client.close();
}

export type NewArticleDocument = OptionalId<ArticleDocument>;
```

The MongoDB driver supports typed collections:

```ts
const articles = database.collection<ArticleDocument>("articles");
```

This improves editor autocomplete and catches many mistakes while writing queries. However, TypeScript types do not validate existing database data at runtime, so production systems should still treat database documents carefully. [MongoDB TypeScript driver guidance](https://www.mongodb.com/docs/drivers/node/v6.x/typescript/)

---

# Write and read MongoDB documents

Create `src/articles/article.types.ts`:

```ts
export interface Article {
  id: string;
  title: string;
  body: string;
  authorId: string;
  topicIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateArticleInput {
  title: string;
  body: string;
  authorId: string;
  topicIds: string[];
}

export interface ArticleSearchResult {
  article: Article;
  score: number;
}
```

Create `src/articles/article.schemas.ts`:

```ts
import { z } from "zod";

export const createArticleSchema = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(100_000),
  authorId: z.string().trim().min(1),
  topicIds: z.array(z.string().trim().min(1)).max(50)
});

export const searchSchema = z.object({
  query: z.string().trim().min(1).max(500),
  limit: z.coerce.number().int().positive().max(50).default(10)
});
```

Create a MongoDB mapper:

```ts
import type { Article } from "./article.types.js";
import type { ArticleDocument } from "../db/mongodb.js";

export function toArticle(document: ArticleDocument): Article {
  if (!document._id) {
    throw new Error("Article document is missing _id");
  }

  return {
    id: document._id,
    title: document.title,
    body: document.body,
    authorId: document.authorId,
    topicIds: document.topicIds,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString()
  };
}
```

A useful practice is not to expose MongoDB-specific document shapes directly from your API.

The database representation contains:

```ts
_id?: string;
createdAt: Date;
```

The API representation contains:

```ts
id: string;
createdAt: string;
```

Keeping that mapping explicit prevents storage details from leaking through the rest of the application.

---

# Create a knowledge graph with Neo4j

A knowledge graph models entities as nodes and relationships as edges.

For our article system:

```text
(:Article)-[:WRITTEN_BY]->(:Author)
(:Article)-[:ABOUT]->(:Topic)
(:Article)-[:REFERENCES]->(:Article)
```

A graph might look like:

```text
(Article: TypeScript Backend)
          │
          ├── WRITTEN_BY → (Author: Alice)
          ├── ABOUT      → (Topic: TypeScript)
          └── ABOUT      → (Topic: Node.js)
```

Create `src/db/neo4j.ts`:

```ts
import neo4j, {
  type Driver,
  type Integer
} from "neo4j-driver";
import { config } from "../config.js";

let driver: Driver;

export function connectNeo4j(): void {
  driver = neo4j.driver(
    config.NEO4J_URI,
    neo4j.auth.basic(
      config.NEO4J_USERNAME,
      config.NEO4J_PASSWORD
    ),
    {
      disableLosslessIntegers: true
    }
  );
}

export function neo4jDriver(): Driver {
  if (!driver) {
    throw new Error("Neo4j has not been connected");
  }

  return driver;
}

export async function verifyNeo4j(): Promise<void> {
  await neo4jDriver().verifyConnectivity();
}

export async function closeNeo4j(): Promise<void> {
  await driver.close();
}
```

Install the official driver with:

```bash
npm install neo4j-driver
```

Neo4j’s JavaScript driver includes TypeScript declarations and supports Node.js and TypeScript applications. [Neo4j JavaScript driver installation](https://neo4j.com/docs/javascript-manual/current/install/)

---

# Create graph nodes and relationships

Add this to `src/db/neo4j.ts`:

```ts
export async function upsertArticleGraph(input: {
  articleId: string;
  title: string;
  authorId: string;
  topicIds: string[];
}): Promise<void> {
  const query = `
    MERGE (article:Article {id: $articleId})
    SET article.title = $title,
        article.updatedAt = datetime()

    MERGE (author:Author {id: $authorId})
    MERGE (article)-[:WRITTEN_BY]->(author)

    WITH article
    UNWIND $topicIds AS topicId
    MERGE (topic:Topic {id: topicId})
    MERGE (article)-[:ABOUT]->(topic)
  `;

  await neo4jDriver().executeQuery(query, {
    articleId: input.articleId,
    title: input.title,
    authorId: input.authorId,
    topicIds: input.topicIds
  });
}
```

The Cypher query uses `MERGE` rather than `CREATE`.

`CREATE` always creates a new node or relationship.

`MERGE` creates it only if an equivalent pattern does not already exist.

This makes the operation idempotent. Running the same synchronization twice should not create duplicate graph entities.

## Query related articles

```ts
export async function findArticlesByTopic(
  topicId: string
): Promise<string[]> {
  const query = `
    MATCH (article:Article)-[:ABOUT]->(topic:Topic {id: $topicId})
    RETURN article.id AS articleId
    ORDER BY article.updatedAt DESC
  `;

  const result = await neo4jDriver().executeQuery(query, {
    topicId
  });

  return result.records.map((record) =>
    record.get("articleId") as string
  );
}
```

## Find an article’s graph neighborhood

```ts
export async function findArticleConnections(
  articleId: string
): Promise<Array<{
  type: string;
  id: string;
}>> {
  const query = `
    MATCH (article:Article {id: $articleId})-[relation]-(connected)
    RETURN type(relation) AS type, connected.id AS id
  `;

  const result = await neo4jDriver().executeQuery(query, {
    articleId
  });

  return result.records.map((record) => ({
    type: record.get("type") as string,
    id: record.get("id") as string
  }));
}
```

This is where a graph database is different from MongoDB.

In MongoDB, you might store:

```json
{
  "topicIds": ["nodejs", "typescript"]
}
```

In Neo4j, the relationship itself is first-class:

```text
Article -[:ABOUT]-> Topic
```

That makes multi-hop queries natural:

```cypher
MATCH
  (article:Article)-[:ABOUT]->(topic:Topic)<-[:ABOUT]-(related:Article)
WHERE article.id = $articleId
RETURN related
```

This finds other articles that share a topic.

---

# Create a Qdrant client

Qdrant collections store vectors with a fixed dimension and distance function.

Create `src/db/qdrant.ts`:

```ts
import { QdrantClient } from "@qdrant/js-client-rest";
import { config } from "../config.js";

export const qdrant = new QdrantClient({
  url: config.QDRANT_URL,
  apiKey: config.QDRANT_API_KEY || undefined
});
```

The official client package is:

```bash
npm install @qdrant/js-client-rest
```

Qdrant’s official documentation lists this package as its JavaScript/TypeScript client. [Qdrant SDK documentation](https://qdrant.tech/documentation/interfaces/)

## Create a collection

```ts
const VECTOR_SIZE = 384;

export async function ensureArticleCollection(): Promise<void> {
  const collections = await qdrant.getCollections();

  const exists = collections.collections.some(
    (collection) =>
      collection.name === config.QDRANT_COLLECTION
  );

  if (!exists) {
    await qdrant.createCollection(
      config.QDRANT_COLLECTION,
      {
        vectors: {
          size: VECTOR_SIZE,
          distance: "Cosine"
        }
      }
    );
  }
}
```

The vector size must match the embedding model you use.

Examples:

```text
384 dimensions
768 dimensions
1536 dimensions
3072 dimensions
```

You cannot insert a 768-dimensional vector into a collection configured for 384 dimensions.

---

# What embeddings are

An embedding is a numeric representation of content.

For example:

```text
"How do I configure TypeScript for Node.js?"
```

might become:

```text
[0.021, -0.119, 0.443, ...]
```

The vector has no obvious human interpretation. Its useful property is that semantically similar text should produce vectors that are close together.

A vector search system can then answer:

> Find documents similar to this query.

The process is:

```text
Text
  ↓
Embedding model
  ↓
Vector
  ↓
Qdrant similarity search
```

Qdrant stores vectors, but it does not automatically know the meaning of arbitrary text. You need an embedding model.

Possible approaches include:

- A hosted embedding API
- A local embedding model
- Cloud inference
- A transformer model running in your service

For this tutorial, define an interface first:

```ts
export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
}
```

That lets you change providers later without rewriting Qdrant integration.

---

# Use a development embedding provider

For a completely runnable local example, we can create a deterministic placeholder embedding.

This is not a semantic embedding model. It is only useful for testing the database integration.

Create `src/db/embeddings.ts`:

```ts
export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
}

export class DevelopmentEmbeddingProvider
  implements EmbeddingProvider
{
  private readonly dimensions = 384;

  async embed(text: string): Promise<number[]> {
    const vector = new Array<number>(this.dimensions).fill(0);

    for (let index = 0; index < text.length; index += 1) {
      const code = text.charCodeAt(index);
      vector[index % this.dimensions] += code / 255;
    }

    const magnitude = Math.sqrt(
      vector.reduce(
        (sum, value) => sum + value * value,
        0
      )
    );

    if (magnitude === 0) {
      return vector;
    }

    return vector.map((value) => value / magnitude);
  }
}
```

This lets us test:

- Collection creation
- Upserts
- Queries
- Payloads
- Result IDs

But it will not provide meaningful semantic search.

For real applications, replace it with a real embedding model that outputs exactly `384` dimensions—or change `VECTOR_SIZE` to match your model.

---

# Store article vectors in Qdrant

Add to `src/db/qdrant.ts`:

```ts
export async function upsertArticleVector(input: {
  articleId: string;
  title: string;
  vector: number[];
}): Promise<void> {
  await qdrant.upsert(config.QDRANT_COLLECTION, {
    wait: true,
    points: [
      {
        id: input.articleId,
        vector: input.vector,
        payload: {
          articleId: input.articleId,
          title: input.title
        }
      }
    ]
  });
}
```

The vector point contains:

```text
id
vector
payload
```

The payload is metadata that helps you identify the result.

Search the collection:

```ts
export async function searchArticleVectors(
  vector: number[],
  limit: number
): Promise<Array<{
  articleId: string;
  score: number;
}>> {
  const results = await qdrant.search(
    config.QDRANT_COLLECTION,
    {
      vector,
      limit,
      with_payload: true
    }
  );

  return results.flatMap((result) => {
    const payload = result.payload;

    if (
      !payload ||
      typeof payload.articleId !== "string"
    ) {
      return [];
    }

    return [
      {
        articleId: payload.articleId,
        score: result.score
      }
    ];
  });
}
```

The `score` depends on the distance metric. With cosine similarity, higher scores generally indicate greater similarity.

Always check the client version’s API when upgrading. Vector database SDKs evolve quickly, particularly around search and query APIs.

---

# Combine all three systems in a service

Create `src/articles/article.service.ts`:

```ts
import { articleCollection } from "../db/mongodb.js";
import {
  upsertArticleGraph
} from "../db/neo4j.js";
import {
  upsertArticleVector
} from "../db/qdrant.js";
import {
  DevelopmentEmbeddingProvider
} from "../db/embeddings.js";
import type {
  ArticleDocument,
  NewArticleDocument
} from "../db/mongodb.js";
import type {
  CreateArticleInput,
  Article
} from "./article.types.js";
import { toArticle } from "./article.mapper.js";
```

Create `src/articles/article.mapper.ts`:

```ts
import type { ArticleDocument } from "../db/mongodb.js";
import type { Article } from "./article.types.js";

export function toArticle(document: ArticleDocument): Article {
  if (!document._id) {
    throw new Error("Article document has no id");
  }

  return {
    id: document._id,
    title: document.title,
    body: document.body,
    authorId: document.authorId,
    topicIds: document.topicIds,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString()
  };
}
```

Now create the service:

```ts
import { articleCollection } from "../db/mongodb.js";
import { upsertArticleGraph } from "../db/neo4j.js";
import { upsertArticleVector } from "../db/qdrant.js";
import {
  DevelopmentEmbeddingProvider
} from "../db/embeddings.js";
import type { Article } from "./article.types.js";
import type { CreateArticleInput } from "./article.types.js";
import { toArticle } from "./article.mapper.js";

export class ArticleService {
  private readonly embeddings =
    new DevelopmentEmbeddingProvider();

  async createArticle(
    input: CreateArticleInput
  ): Promise<Article> {
    const now = new Date();
    const id = crypto.randomUUID();

    const document = {
      _id: id,
      title: input.title,
      body: input.body,
      authorId: input.authorId,
      topicIds: input.topicIds,
      createdAt: now,
      updatedAt: now
    };

    await articleCollection().insertOne(document);

    try {
      const embedding = await this.embeddings.embed(
        `${input.title}\n\n${input.body}`
      );

      await upsertArticleGraph({
        articleId: id,
        title: input.title,
        authorId: input.authorId,
        topicIds: input.topicIds
      });

      await upsertArticleVector({
        articleId: id,
        title: input.title,
        vector: embedding
      });
    } catch (error) {
      await articleCollection().deleteOne({ _id: id });
      throw error;
    }

    return toArticle(document);
  }

  async getArticle(id: string): Promise<Article | null> {
    const document = await articleCollection().findOne({
      _id: id
    });

    return document ? toArticle(document) : null;
  }

  async listArticles(): Promise<Article[]> {
    const documents = await articleCollection()
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return documents.map(toArticle);
  }
}
```

This service performs a multi-system write.

That introduces an important problem: there is no automatic transaction covering MongoDB, Neo4j, and Qdrant together.

If MongoDB succeeds but Neo4j fails, the systems can become inconsistent.

---

# Multi-database consistency

When using multiple databases, you need to decide how to handle partial failure.

## Option 1: Compensating actions

The example attempts to delete the MongoDB record if a later write fails:

```ts
try {
  // Write graph and vector systems
} catch (error) {
  await articleCollection().deleteOne({ _id: id });
  throw error;
}
```

This is a compensating action.

It is not a perfect distributed transaction. The delete could fail too.

## Option 2: Outbox pattern

A stronger design is:

```text
1. Write the article and an outbox event to MongoDB
2. Background worker reads the event
3. Worker updates Neo4j
4. Worker updates Qdrant
5. Worker marks the event complete
```

The outbox event might look like:

```json
{
  "type": "ArticleCreated",
  "articleId": "article-123",
  "status": "pending",
  "attempts": 0
}
```

This makes synchronization retryable.

## Option 3: Event-driven architecture

Publish an event:

```text
ArticleCreated
    ├── Graph projection consumes it
    └── Vector projection consumes it
```

Each database becomes a projection of the source data.

This is more complex but useful when:

- Search indexes can be eventually consistent
- Graph relationships can be rebuilt
- You need retries
- Multiple services consume the same events

The main rule is:

> Do not pretend that three independent databases behave like one transaction.

---

# Connect all databases during startup

Create `src/db/index.ts`:

```ts
import { connectMongoDB } from "./mongodb.js";
import {
  connectNeo4j,
  verifyNeo4j
} from "./neo4j.js";
import {
  ensureArticleCollection
} from "./qdrant.js";

export async function connectDatabases(): Promise<void> {
  await connectMongoDB();

  connectNeo4j();
  await verifyNeo4j();

  await ensureArticleCollection();
}
```

For a production application, also add:

```ts
export async function closeDatabases(): Promise<void> {
  await closeMongoDB();
  await closeNeo4j();
}
```

The Qdrant client is HTTP-based and does not require the same explicit connection lifecycle as MongoDB or Neo4j.

---

# Create API routes

Create `src/articles/article.routes.ts`:

```ts
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { createArticleSchema } from "./article.schemas.js";
import type { ArticleService } from "./article.service.js";

const idSchema = z.object({
  id: z.string().min(1)
});

export async function registerArticleRoutes(
  app: FastifyInstance,
  articleService: ArticleService
): Promise<void> {
  app.get("/api/articles", async () => {
    return articleService.listArticles();
  });

  app.get<{ Params: { id: string } }>(
    "/api/articles/:id",
    async (request, reply) => {
      const params = idSchema.parse(request.params);
      const article = await articleService.getArticle(
        params.id
      );

      if (!article) {
        return reply.code(404).send({
          error: {
            code: "ARTICLE_NOT_FOUND",
            message: "Article not found"
          }
        });
      }

      return article;
    }
  );

  app.post("/api/articles", async (request, reply) => {
    const input = createArticleSchema.parse(request.body);
    const article = await articleService.createArticle(input);

    return reply.code(201).send(article);
  });
}
```

Create `src/app.ts`:

```ts
import Fastify from "fastify";
import { ArticleService } from "./articles/article.service.js";
import {
  registerArticleRoutes
} from "./articles/article.routes.js";

export function buildApp(): ReturnType<typeof Fastify> {
  const app = Fastify({
    logger: true
  });

  const articleService = new ArticleService();

  app.get("/health", async () => {
    return {
      status: "ok"
    };
  });

  app.register(async (articlesApp) => {
    await registerArticleRoutes(
      articlesApp,
      articleService
    );
  });

  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);

    return reply.code(500).send({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Unexpected server error"
      }
    });
  });

  return app;
}
```

Create `src/server.ts`:

```ts
import { buildApp } from "./app.js";
import { config } from "./config.js";
import {
  closeMongoDB
} from "./db/mongodb.js";
import {
  closeNeo4j
} from "./db/neo4j.js";
import {
  connectDatabases
} from "./db/index.js";

await connectDatabases();

const app = buildApp();

await app.listen({
  host: "127.0.0.1",
  port: config.PORT
});

async function shutdown(signal: string): Promise<void> {
  app.log.info(`Received ${signal}`);

  await app.close();
  await closeMongoDB();
  await closeNeo4j();

  process.exitCode = 0;
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
```

---

# Add semantic search

Add an embedding-based search method to the service:

```ts
import {
  searchArticleVectors
} from "../db/qdrant.js";

export async function searchArticles(
  query: string,
  limit: number
): Promise<Array<{
  article: Article;
  score: number;
}>> {
  const embedding = await this.embeddings.embed(query);

  const matches = await searchArticleVectors(
    embedding,
    limit
  );

  const articles = await Promise.all(
    matches.map(async (match) => {
      const article = await this.getArticle(
        match.articleId
      );

      if (!article) {
        return null;
      }

      return {
        article,
        score: match.score
      };
    })
  );

  return articles.flatMap((result) =>
    result ? [result] : []
  );
}
```

Add a route:

```ts
app.get("/api/search", async (request) => {
  const query = searchSchema.parse(request.query);

  return articleService.searchArticles(
    query.query,
    query.limit
  );
});
```

Call it:

```bash
curl "http://127.0.0.1:3000/api/search?query=typescript%20backend"
```

With the development embedding provider, the results are only useful for testing the plumbing. Replace it with a real embedding provider for meaningful semantic search.

---

# Add graph-based related content

Add a service method:

```ts
import {
  findArticlesByTopic
} from "../db/neo4j.js";

async function findRelatedArticles(
  topicId: string
): Promise<Article[]> {
  const ids = await findArticlesByTopic(topicId);

  const articles = await Promise.all(
    ids.map((id) => this.getArticle(id))
  );

  return articles.flatMap((article) =>
    article ? [article] : []
  );
}
```

This gives you a useful hybrid architecture:

```text
Qdrant:
  Find content that is semantically similar

Neo4j:
  Find content that is structurally related

MongoDB:
  Return the complete content
```

A search experience might combine both:

```text
1. Search for semantic matches in Qdrant
2. Expand related topics in Neo4j
3. Load article details from MongoDB
4. Rank or group results
```

This is much more powerful than using any one database for every query.

---

# MongoDB best practices

## Create indexes intentionally

Indexes should match real query patterns.

For example:

```ts
await articles.createIndex({
  authorId: 1
});

await articles.createIndex({
  topicIds: 1
});

await articles.createIndex({
  createdAt: -1
});
```

Do not create indexes for every field. Indexes improve reads but increase storage and write cost.

## Avoid unbounded queries

Bad:

```ts
await articles.find({}).toArray();
```

Better:

```ts
await articles
  .find({})
  .sort({ createdAt: -1 })
  .limit(100)
  .toArray();
```

## Keep documents cohesive

A document should contain data that is commonly read together.

Do not put a huge, frequently changing array inside every document if it can grow without limit.

## Validate before writing

MongoDB’s TypeScript type parameter helps at compile time, but it does not validate arbitrary runtime objects.

Use Zod or MongoDB schema validation for stronger guarantees.

---

# Neo4j best practices

## Use stable identifiers

Prefer application-level identifiers:

```text
article-123
topic-typescript
author-alice
```

Do not rely on internal graph IDs as public identifiers.

## Use `MERGE` carefully

This is often safer:

```cypher
MERGE (topic:Topic {id: $topicId})
```

than:

```cypher
CREATE (topic:Topic {id: $topicId})
```

But `MERGE` can still create duplicates if your identifying properties are inconsistent.

## Add uniqueness constraints

For example:

```cypher
CREATE CONSTRAINT article_id_unique IF NOT EXISTS
FOR (article:Article)
REQUIRE article.id IS UNIQUE;
```

```cypher
CREATE CONSTRAINT topic_id_unique IF NOT EXISTS
FOR (topic:Topic)
REQUIRE topic.id IS UNIQUE;
```

Constraints protect the integrity of the graph.

## Keep relationships meaningful

Prefer:

```text
Article -[:ABOUT]-> Topic
```

over vague relationships such as:

```text
Article -[:RELATED_TO]-> Topic
```

The more precise the relationship type, the more useful the graph becomes.

---

# Qdrant best practices

## Fix the embedding model

Do not change embedding models without planning a migration.

Different models usually produce vectors with different dimensions and different meanings.

Changing models may require:

1. Creating a new collection
2. Re-embedding all content
3. Writing new vectors
4. Switching search traffic
5. Deleting the old collection later

## Store useful payload metadata

A Qdrant payload might contain:

```json
{
  "articleId": "article-123",
  "title": "TypeScript Backend Patterns",
  "authorId": "alice",
  "topics": ["typescript", "nodejs"]
}
```

Keep the payload lightweight. The primary article content can remain in MongoDB.

## Use metadata filters

For example:

```ts
await qdrant.search("articles", {
  vector,
  limit: 10,
  filter: {
    must: [
      {
        key: "authorId",
        match: {
          value: "alice"
        }
      }
    ]
  },
  with_payload: true
});
```

This lets you combine semantic similarity with structured constraints.

## Use a similarity threshold

Not every top result is genuinely relevant.

You may want to reject results below a threshold:

```ts
const relevant = results.filter(
  (result) => result.score >= 0.72
);
```

The correct threshold depends on:

- The embedding model
- The distance function
- The content
- The user experience
- Your evaluation dataset

---

# Testing database integrations

Use separate test environments.

Do not run destructive tests against your development databases.

A practical setup might include:

```text
MongoDB test database
Neo4j test database
Qdrant test collection
```

Use unique names:

```text
knowledge_api_test
articles_test_2026_08_14
```

For unit tests, mock interfaces:

```ts
const repository: NoteRepository = {
  findAll: async () => [],
  findById: async () => undefined,
  create: async () => mockArticle,
  update: async () => mockArticle,
  delete: async () => true
};
```

For integration tests, use real services in Docker.

Test:

- Startup connections
- Inserts
- Queries
- Indexes
- Graph constraints
- Vector collection configuration
- Error handling
- Retry behavior
- Partial failure behavior

---

# The most important architectural warning

Do not create three databases just because three databases are interesting.

Use MongoDB, Neo4j, and Qdrant together when the application genuinely has three different access patterns:

```text
Document retrieval
Relationship traversal
Similarity search
```

If your application only needs ordinary CRUD, MongoDB may be enough.

If it only needs full-text search, a search engine may be more appropriate than a vector store.

If it needs recommendations based on relationships, Neo4j may be worthwhile.

The architecture is justified when each database has a clear job.

---

# Final project workflow

Start the databases:

```bash
docker compose up -d
```

Install dependencies:

```bash
npm install
```

Run type checking:

```bash
npm run typecheck
```

Start the API:

```bash
npm run dev
```

Create an article:

```bash
curl -X POST http://127.0.0.1:3000/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "TypeScript Backend Patterns",
    "body": "A practical guide to building Node.js APIs.",
    "authorId": "alice",
    "topicIds": ["typescript", "nodejs"]
  }'
```

Check MongoDB:

```bash
docker exec -it knowledge-mongodb mongosh
```

Check Neo4j through:

```text
http://localhost:7474
```

Check Qdrant:

```bash
curl http://127.0.0.1:6333/collections
```

Build the backend:

```bash
npm run build
```

Run production output:

```bash
npm start
```

---

# Final thoughts

MongoDB, Neo4j, and Qdrant solve different problems:

```text
MongoDB
  Flexible application documents

Neo4j
  Explicit relationships and graph traversal

Qdrant
  Semantic similarity over vector embeddings
```

The Node.js backend sits in the middle and coordinates them.

The most maintainable design keeps each database behind a focused interface:

```text
Article repository
Graph repository
Vector repository
```

The application service coordinates the workflow without exposing database-specific details to the HTTP layer.

That separation gives you room to evolve:

- Replace MongoDB with another document store
- Change the embedding model
- Rebuild the graph projection
- Move Qdrant to the cloud
- Add an outbox for reliable synchronization
- Scale each database independently

The databases are important, but the boundaries between them are even more important.