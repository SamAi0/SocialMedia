import { randomBytes } from 'crypto';

/**
 * Generate a proper 24-character hexadecimal ObjectId string
 * This mimics MongoDB's ObjectId format for mock database usage
 * @returns {string} 24-character hex string
 */
export const generateObjectId = () => {
  // Method 1: Using crypto.randomBytes (most reliable)
  return randomBytes(12).toString('hex');
  
  // Alternative methods if needed:
  // Method 2: Using timestamp + random (similar to real ObjectId structure)
  // const timestamp = Math.floor(Date.now() / 1000).toString(16);
  // const random = randomBytes(8).toString('hex');
  // return (timestamp + random).substring(0, 24);
  
  // Method 3: Pad Math.random() to ensure 24 characters
  // let result = '';
  // while (result.length < 24) {
  //   result += Math.random().toString(16).substr(2);
  // }
  // return result.substring(0, 24);
};

/**
 * Validate if a string is a valid ObjectId format
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid ObjectId format
 */
export const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Generate multiple ObjectIds
 * @param {number} count - Number of IDs to generate
 * @returns {string[]} - Array of ObjectId strings
 */
export const generateObjectIds = (count) => {
  return Array.from({ length: count }, () => generateObjectId());
};