import { MongoClient } from 'mongodb';

/**
 * Test Operations Script for MongoDB Stream Watcher
 * 
 * This script demonstrates the functionality of the MongoDB Stream Watcher by performing
 * a sequence of database operations (insert, update, delete) with delays between them.
 * It's designed to work in conjunction with the StreamWatcher class to showcase real-time
 * change detection.
 * 
 * Prerequisites:
 * - MongoDB running locally on port 27017
 * - MongoDB replica set configured (required for change streams)
 * - StreamWatcher instance running (see basic-usage.ts)
 * 
 * Usage:
 * 1. Start the StreamWatcher (run basic-usage.ts)
 * 2. Run this script: bun run test-ops.ts
 * 3. Observe the change events in the StreamWatcher output
 */
async function testOperations() {
    const client = await MongoClient.connect('mongodb://localhost:27017/?directConnection=true');
    const db = client.db('test');
    const collection = db.collection('documents');

    try {
        // Insert
        console.log('Inserting document...');
        const insertResult = await collection.insertOne({
            name: "Test Document",
            timestamp: new Date()
        });
        console.log('Inserted:', insertResult.insertedId);

        // Wait 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Update
        console.log('Updating document...');
        await collection.updateOne(
            { _id: insertResult.insertedId },
            { $set: { status: 'updated' } }
        );

        // Wait 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Delete
        console.log('Deleting document...');
        await collection.deleteOne({ _id: insertResult.insertedId });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

// Execute the test operations
testOperations(); 