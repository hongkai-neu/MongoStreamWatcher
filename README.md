# Mongo Stream Watcher

An easy-to-use wrapper around MongoDB's Change Streams feature to monitor and react to database changes in real-time.

## Prerequisites

- **MongoDB 3.6+**: Requires a Replica Set or Sharded Cluster for Change Streams.
- **[Bun](https://bun.sh/) Runtime** or **Node.js**

## Features

- 🔄 **Real-time Monitoring**: Continuously watch MongoDB collections for changes.
- 🛡️ **Automatic Reconnection**: Handles disconnections gracefully and resumes watching.
- 🎯 **Custom Event Handlers**: Define specific actions for insert, update, and delete operations.
- 🚀 **Built with TypeScript and Bun**: Leverage type safety and performance optimizations.

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/mongo-stream-watcher

# Navigate to the project directory
cd mongo-stream-watcher

# Install dependencies
bun install
```

## Usage

1. **Set Up MongoDB Replica Set or Cluster**

   Ensure you have a MongoDB replica set or sharded cluster configured. Refer to the [MongoDB Change Streams Documentation](https://www.mongodb.com/docs/manual/changeStreams/) for setup guidance.

2. **Configure Environment Variables**

   Create a `.env.local` file from the example:

   ```bash
   cp .env.local.example .env.local
   ```

   Then, edit the file with your configuration:

   ```env
   # Use directConnection=true to only connect to the primary node
   MONGODB_URI=mongodb://localhost:27017/?directConnection=true
   DATABASE_NAME=YourDB
   COLLECTION_NAME=YourCollection
   ```

3. **Create Custom Handlers**

   Define custom handlers for different operation types (Insert, Update, Delete). Refer to [basic-usage.ts](basic-usage.ts) for an example implementation.

4. **Run the Watcher**

   ```bash
   bun run your-handler.ts
   ```

## Example Usage - Run with Docker Compose

Leverage Docker Compose to quickly set up a MongoDB replica set along with the watcher.

1. **Navigate to Deployment Directory**

   ```bash
   cd deployment
   ```

2. **Start Services**

   ```bash
   docker compose up
   ```

   This will:
   - Start a MongoDB replica set with primary and secondary nodes.
   - Launch a watcher container that monitors the "test" database and "documents" collection.

3. **Interact with MongoDB**

   The primary node is exposed on port `27017`. Connect using your MongoDB client to perform operations and observe real-time changes.

4. **View Watcher Logs**

   ```bash
   docker compose logs -f mongodb-watcher
   ```

5. **Test the Watcher**

   Execute the test operations script to perform insert, update, and delete actions:

   ```bash
   bun run test-ops.ts
   ```

6. **Stop Services**

   ```bash
   docker compose down
   ```

## Project Structure

```
mongo-stream-watcher/
├── src/
│   └── StreamWatcher.ts          # Main watcher implementation
├── deployment/
│   ├── docker-compose.yml        # Docker deployment setup
│   ├── mongo-init-replica.sh     # Script to initialize the replica set
│   └── test-ops.ts               # Test operations script for insert/update/delete
├── basic-usage.ts                # Example implementation of the watcher
├── .env.local.example            # Example .env.local configuration
├── Dockerfile.mongodb-watcher    # Dockerfile for the watcher implementation
├── package.json                  # Project metadata and dependencies
├── bun.lockb                     # Bun lockfile for dependency management
├── tsconfig.json                 # TypeScript configuration
└── .gitignore                    # Git ignore rules
```


[Learn more about MongoDB Change Streams](https://www.mongodb.com/docs/manual/changeStreams/)
