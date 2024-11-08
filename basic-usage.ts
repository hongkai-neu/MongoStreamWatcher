import { StreamWatcher } from "./src/StreamWatcher";

const watcher = new StreamWatcher({
  onInsert: (doc) => {
    console.log("✨ New document inserted:", doc);
  },
  onUpdate: (doc) => {
    console.log("📝 Document updated:", doc);
  },
  onDelete: (doc) => {
    console.log("🗑️ Document deleted:", doc);
  },
  onError: (error) => {
    console.error("❌ Error:", error);
  }
});

// Handle process termination
process.on("SIGTERM", async () => {
  console.log("Shutting down...");
  await watcher.stop();
  process.exit(0);
});

watcher.start(); 