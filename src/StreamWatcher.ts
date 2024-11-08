import { MongoClient, ChangeStream, Document } from "mongodb";
import { EventEmitter } from "events";

export interface WatcherOptions {
  mongoUrl?: string;
  dbName?: string;
  collectionName?: string;
  onInsert?: (document: Document) => void;
  onUpdate?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  onError?: (error: Error) => void;
}

export class StreamWatcher extends EventEmitter {
  private client: MongoClient;
  private changeStream: ChangeStream | null = null;
  private options: Required<WatcherOptions>;

  constructor(options: WatcherOptions) {
    super();
    this.options = {
      mongoUrl: process.env.MONGODB_URI || "mongodb://localhost:27017/?directConnection=true",
      dbName: process.env.DATABASE_NAME || "test",
      collectionName: process.env.COLLECTION_NAME || "documents",
      onInsert: () => {},
      onUpdate: () => {},
      onDelete: () => {},
      onError: (error: Error) => console.error("Stream error:", error),
      ...options
    };

    this.client = new MongoClient(this.options.mongoUrl, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
  }

  async start() {
    try {
      await this.client.connect();
      console.log("📡 Connected to MongoDB");

      const collection = this.client.db(this.options.dbName)
        .collection(this.options.collectionName);

      this.changeStream = collection.watch([], {
        fullDocument: 'updateLookup'
      });
      console.log("👀 Change stream opened. Waiting for changes...");

      this.changeStream.on("change", this.handleChange.bind(this));
      this.changeStream.on("error", this.handleError.bind(this));

      // Keep the stream alive
      await new Promise(() => {});
    } catch (error) {
      this.handleError(error as Error);
      // Attempt to reconnect after a delay
      setTimeout(() => this.start(), 5000);
    }
  }

  private handleChange(change: Document) {
    switch (change.operationType) {
      case "insert":
        this.options.onInsert(change.fullDocument);
        this.emit("insert", change.fullDocument);
        break;
      case "update":
        this.options.onUpdate(change.fullDocument);
        this.emit("update", change.fullDocument);
        break;
      case "delete":
        this.options.onDelete(change.documentKey);
        this.emit("delete", change.documentKey);
        break;
    }
  }

  private handleError(error: Error) {
    this.options.onError(error);
    this.emit("error", error);
  }

  async stop() {
    if (this.changeStream) {
      await this.changeStream.close();
    }
    await this.client.close();
  }
} 