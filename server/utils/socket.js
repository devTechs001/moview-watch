// Socket.IO Helper Functions

/**
 * Safely emit Socket.IO event to all connected clients
 * @param {Object} req - Express request object
 * @param {String} eventName - Name of the event
 * @param {Object} data - Data to emit
 * @returns {Boolean} - Success status
 */
export const emitSocketEvent = (req, eventName, data) => {
  try {
    const io = req.app.get('io')
    if (io && typeof io.emit === 'function') {
      io.emit(eventName, data)
      console.log(`📡 Socket event emitted: ${eventName}`)
      return true
    } else {
      console.warn(`⚠️  Socket.IO not available for event: ${eventName}`)
      return false
    }
  } catch (error) {
    console.error(`❌ Socket.IO emit error (${eventName}):`, error.message)
    return false
  }
}

/**
 * Emit Socket.IO event to specific room
 * @param {Object} req - Express request object
 * @param {String} room - Room name/ID
 * @param {String} eventName - Name of the event
 * @param {Object} data - Data to emit
 * @returns {Boolean} - Success status
 */
export const emitToRoom = (req, room, eventName, data) => {
  try {
    const io = req.app.get('io')
    if (io && typeof io.to === 'function') {
      io.to(room).emit(eventName, data)
      console.log(`📡 Socket event emitted to room ${room}: ${eventName}`)
      return true
    } else {
      console.warn(`⚠️  Socket.IO not available for room event: ${eventName}`)
      return false
    }
  } catch (error) {
    console.error(`❌ Socket.IO room emit error (${eventName}):`, error.message)
    return false
  }
}

/**
 * Get Socket.IO instance
 * @param {Object} req - Express request object
 * @returns {Object|null} - Socket.IO instance or null
 */
export const getIO = (req) => {
  try {
    return req.app.get('io')
  } catch (error) {
    console.error('❌ Failed to get Socket.IO instance:', error.message)
    return null
  }
}

/**
 * Emit to multiple rooms
 * @param {Object} req - Express request object
 * @param {Array} rooms - Array of room names/IDs
 * @param {String} eventName - Name of the event
 * @param {Object} data - Data to emit
 * @returns {Boolean} - Success status
 */
export const emitToRooms = (req, rooms, eventName, data) => {
  try {
    const io = req.app.get('io')
    if (io && Array.isArray(rooms)) {
      rooms.forEach(room => {
        io.to(room).emit(eventName, data)
      })
      console.log(`📡 Socket event emitted to ${rooms.length} rooms: ${eventName}`)
      return true
    }
    return false
  } catch (error) {
    console.error(`❌ Socket.IO multi-room emit error (${eventName}):`, error.message)
    return false
  }
}

/**
 * Emit to all except specific socket
 * @param {Object} req - Express request object
 * @param {String} socketId - Socket ID to exclude
 * @param {String} eventName - Name of the event
 * @param {Object} data - Data to emit
 * @returns {Boolean} - Success status
 */
export const broadcastExcept = (req, socketId, eventName, data) => {
  try {
    const io = req.app.get('io')
    if (io && socketId) {
      io.except(socketId).emit(eventName, data)
      console.log(`📡 Socket broadcast (except ${socketId}): ${eventName}`)
      return true
    }
    return false
  } catch (error) {
    console.error(`❌ Socket.IO broadcast error (${eventName}):`, error.message)
    return false
  }
}

export default {
  emitSocketEvent,
  emitToRoom,
  getIO,
  emitToRooms,
  broadcastExcept,
}
