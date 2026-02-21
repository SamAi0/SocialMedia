import { generateObjectId } from '../utils/ObjectIdGenerator.js';

class LiveStreamService {
  constructor(io) {
    this.io = io;
    this.activeStreams = new Map();
  }

  // Start a new live stream
  async startLiveStream(userId, streamData) {
    try {
      const streamId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const stream = {
        streamId,
        userId,
        title: streamData.title,
        description: streamData.description,
        productLinks: streamData.productLinks || [],
        isActive: true,
        viewers: [],
        createdAt: new Date(),
        _id: generateObjectId()
      };

      this.activeStreams.set(streamId, stream);
      
      // Notify in Socket.IO room
      if (this.io) {
        this.io.emit('live-stream-started', stream);
      }

      return stream;
    } catch (error) {
      throw new Error(`Failed to start live stream: ${error.message}`);
    }
  }

  // Add product to live stream
  async addProductToStream(streamId, productData) {
    try {
      const stream = this.activeStreams.get(streamId);
      if (!stream) {
        throw new Error('Stream not found');
      }

      stream.productLinks.push({
        ...productData,
        addedAt: new Date()
      });

      // Notify viewers
      if (this.io) {
        this.io.to(streamId).emit('product-added', productData);
      }

      return stream;
    } catch (error) {
      throw new Error(`Failed to add product to stream: ${error.message}`);
    }
  }

  // Get active streams
  async getActiveStreams() {
    return Array.from(this.activeStreams.values()).filter(stream => stream.isActive);
  }

  // Join a live stream
  async joinStream(streamId, userId, username) {
    const stream = this.activeStreams.get(streamId);
    if (stream) {
      const viewer = {
        userId,
        username,
        joinedAt: new Date()
      };
      stream.viewers.push(viewer);
      
      if (this.io) {
        this.io.to(streamId).emit('viewer-joined', viewer);
      }
    }
    return stream;
  }
}

export default LiveStreamService;