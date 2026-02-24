import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.REACT_APP_API_URL?.replace("/api", "") || "http://localhost:5000";

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
  }

  /**
   * Connect to socket server
   * @param {string} token - JWT token for authentication
   */
  connect(token) {
    if (this.socket && this.connected) {
      console.log("🔌 Socket already connected");
      return;
    }

    console.log("🔌 Connecting to socket server:", SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    // Connection events
    this.socket.on("connect", () => {
      console.log("✅ Socket connected:", this.socket.id);
      this.connected = true;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      this.connected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
      this.connected = false;
    });

    this.socket.on("error", (error) => {
      console.error("❌ Socket error:", error);
    });

    // Restore event listeners after reconnection
    this.socket.on("reconnect", () => {
      console.log("🔄 Socket reconnected");
      this.restoreListeners();
    });
  }

  /**
   * Disconnect from socket server
   */
  disconnect() {
    if (this.socket) {
      console.log("🔌 Disconnecting socket...");
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.listeners.clear();
    }
  }

  /**
   * Emit event to server
   * @param {string} event - Event name
   * @param {*} data - Data to send
   * @param {function} callback - Optional callback function
   */
  emit(event, data, callback) {
    if (this.socket && this.connected) {
      console.log("📤 Emitting event:", event, data);
      this.socket.emit(event, data, callback);
    } else {
      console.error("❌ Socket not connected. Cannot emit:", event);
      if (callback) {
        callback({ success: false, message: "Socket not connected" });
      }
    }
  }

  /**
   * Listen to event from server
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   */
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      // Store listener for re-registration after reconnection
      this.listeners.set(event, callback);
    } else {
      console.error("❌ Socket not initialized. Cannot listen to:", event);
    }
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {function} callback - Optional specific callback to remove
   */
  off(event, callback) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Restore all event listeners (after reconnection)
   */
  restoreListeners() {
    console.log("🔄 Restoring event listeners...");
    this.listeners.forEach((callback, event) => {
      if (this.socket) {
        this.socket.on(event, callback);
      }
    });
  }

  /**
   * Check if socket is connected
   * @returns {boolean}
   */
  isConnected() {
    return this.connected && this.socket?.connected;
  }

  /**
   * Get socket ID
   * @returns {string|null}
   */
  getSocketId() {
    return this.socket?.id || null;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
