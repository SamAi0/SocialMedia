// Mock database for development purposes
import mongoose from 'mongoose';

// Mock connection function that resolves immediately
export const db = Promise.resolve().then(() => {
  console.log("Mock database connected successfully - using in-memory storage");
});

// Mock mongoose models
export const mockModels = {
  User: {
    findById: (id) => Promise.resolve(null), // Return null for now
    findOne: (query) => Promise.resolve(null),
    create: (data) => Promise.resolve({ _id: 'mock-id', ...data }),
    find: (query) => Promise.resolve([])
  },
  Post: {
    find: (query) => Promise.resolve([]),
    create: (data) => Promise.resolve({ _id: 'mock-post-id', ...data })
  },
  // Add other models as needed
};

// Export a flag to indicate if we're using mock DB
export const isUsingMockDB = true;