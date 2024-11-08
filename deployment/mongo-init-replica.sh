#!/bin/bash

# Function to check MongoDB connection
check_mongodb_connection() {
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        echo "Attempt $attempt: Checking MongoDB connection..."
        if MONGO_VERSION=$(mongosh --host mongodb-primary:27017 --eval "print(db.version())" --quiet 2>/dev/null); then
            echo "MongoDB is connected. Version: $MONGO_VERSION"
            return 0
        else
            echo "Connection attempt failed. Retrying in 5 seconds..."
            sleep 5
            attempt=$((attempt + 1))
        fi
    done

    echo "Failed to connect to MongoDB after $max_attempts attempts."
    return 1
}

# Check MongoDB connection
if ! check_mongodb_connection; then
    echo "Exiting script due to connection failure."
    exit 1
fi

# Check if the replica set is already initialized
IS_INITIALIZED=$(mongosh --host mongodb-primary:27017 --eval "rs.status().ok" --quiet 2>/dev/null)

if [ "$IS_INITIALIZED" != "1" ]; then
    echo "Initializing replica set..."
    # Initialize the replica set
    mongosh --host mongodb-primary:27017 <<EOF
    use admin
    db.runCommand({
      replSetInitiate: {
        _id: "rs0",
        members: [
          { _id: 0, host: "mongodb-primary:27017", priority: 2 },
          { _id: 1, host: "mongodb-secondary:27017", priority: 1 }
        ]
      }
    })
EOF
    echo "Replica set initialization attempted."
    
    # Wait for replica set to be fully initialized
    echo "Waiting for replica set to be fully initialized..."
    sleep 10  # Initial sleep to allow initialization to begin
    
    max_attempts=30
    attempt=1
    while [ $attempt -le $max_attempts ]; do
        REPLICA_STATUS=$(mongosh --host mongodb-primary:27017 --eval "rs.status().members.every(m => m.health === 1)" --quiet 2>/dev/null)
        PRIMARY_STATUS=$(mongosh --host mongodb-primary:27017 --eval "rs.isMaster().ismaster" --quiet 2>/dev/null)
        
        if [ "$REPLICA_STATUS" == "true" ] && [ "$PRIMARY_STATUS" == "true" ]; then
            echo "Replica set is fully initialized and primary is ready!"
            break
        else
            echo "Waiting for replica set to be ready... Attempt $attempt of $max_attempts"
            sleep 5
            attempt=$((attempt + 1))
        fi
    done
else
    echo "Replica set is already initialized."
fi

# Final check of replica set status
FINAL_STATUS=$(mongosh --host mongodb-primary:27017 --eval "rs.status().ok" --quiet 2>/dev/null)
if [ "$FINAL_STATUS" == "1" ]; then
    echo "Replica set is properly initialized and functioning."
    
    # Additional verification of primary status
    PRIMARY_CHECK=$(mongosh --host mongodb-primary:27017 --eval "rs.isMaster().ismaster" --quiet 2>/dev/null)
    if [ "$PRIMARY_CHECK" == "true" ]; then
        echo "Primary node is confirmed and ready for writes."
    else
        echo "Warning: Primary node is not ready. Current replica set may still be settling."
    fi
else
    echo "Warning: Replica set may not be properly initialized. Please check manually."
fi