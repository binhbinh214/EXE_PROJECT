const jwt = require("jsonwebtoken");
const Message = require("../models/Message.model");
const User = require("../models/User.model");

module.exports = (io) => {
  // Authentication middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      console.error("Socket auth error:", error);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(
      `✅ User connected: ${socket.user.fullName} (${socket.user._id})`
    );

    // Join personal room
    socket.join(socket.user._id.toString());

    // Join conversation
    socket.on("join_conversation", (conversationId) => {
      console.log(
        `User ${socket.user.fullName} joined conversation: ${conversationId}`
      );
      socket.join(conversationId);
    });

    // Send message
    socket.on("send_message", async (data, callback) => {
      try {
        console.log("📤 Sending message:", data);

        const { receiverId, content, type = "text" } = data;

        // Validate receiver
        const receiver = await User.findById(receiverId);
        if (!receiver) {
          return callback({
            success: false,
            message: "Người nhận không tồn tại",
          });
        }

        // Generate conversation ID
        const conversationId = Message.getConversationId(
          socket.user._id,
          receiverId
        );

        // Create message
        const message = await Message.create({
          sender: socket.user._id,
          receiver: receiverId,
          conversationId,
          content,
          type,
          isDelivered: true,
          deliveredAt: new Date(),
        });

        // Populate sender and receiver
        await message.populate([
          { path: "sender", select: "fullName email avatar role" },
          { path: "receiver", select: "fullName email avatar role" },
        ]);

        console.log("✅ Message created:", message._id);

        // Emit to receiver
        io.to(receiverId.toString()).emit("new_message", message);
        io.to(receiverId.toString()).emit("message_notification", {
          from: socket.user.fullName,
          message: content,
          conversationId,
        });

        // Emit to sender (for other devices)
        io.to(socket.user._id.toString()).emit("new_message", message);

        // Send success response
        callback({ success: true, data: message });
      } catch (error) {
        console.error("Send message error:", error);
        callback({ success: false, message: "Không thể gửi tin nhắn" });
      }
    });

    // Typing indicators
    socket.on("typing_start", (data) => {
      console.log(`User ${socket.user.fullName} typing to ${data.receiverId}`);
      io.to(data.receiverId.toString()).emit("user_typing", {
        userId: socket.user._id,
        userName: socket.user.fullName,
      });
    });

    socket.on("typing_stop", (data) => {
      console.log(`User ${socket.user.fullName} stopped typing`);
      io.to(data.receiverId.toString()).emit("user_stop_typing", {
        userId: socket.user._id,
      });
    });

    // Mark message as read
    socket.on("mark_read", async (data) => {
      try {
        const { messageId } = data;
        const message = await Message.findByIdAndUpdate(
          messageId,
          { isRead: true, readAt: new Date() },
          { new: true }
        );

        if (message) {
          io.to(message.sender.toString()).emit("message_read", {
            messageId,
            readAt: message.readAt,
          });
        }
      } catch (error) {
        console.error("Mark read error:", error);
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.user.fullName}`);
    });
  });
};
