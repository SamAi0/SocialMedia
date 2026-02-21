import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

let dbConnection;

if (process.env.USE_MOCK_DB === 'true') {
  // Mock database connection
  dbConnection = Promise.resolve().then(() => {
    console.log("Using mock database - in-memory storage");
  });
} else {
  // Real MongoDB connection - construct the full URI properly
  const fullURI = process.env.MONGO_URI ? process.env.MONGO_URI : 'mongodb://localhost:27017/socialmedia';
  
  // MongoDB connection options for a robust connection
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  
  dbConnection = mongoose.connect(fullURI, options).then(() => {
    console.log("Database has been connected successfully");
    console.log("Connected to:", fullURI);
  }).catch((error) => {
    console.log("Database connection error:", error.message);
    console.log("Set USE_MOCK_DB=true in .env to use mock database instead");
    console.log("Attempting to connect to:", fullURI);
  });
  
  // Add connection event listeners for better monitoring
  mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
  });
  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected successfully');
  });
  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
  });
}

export { dbConnection as db };