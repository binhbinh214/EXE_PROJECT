const Message = require('../models/Message.model');
const User = require('../models/User.model');

// @desc    Send message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content, type, attachment, appointmentId } = req.body;

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người nhận'
      });
    }

    // Generate conversation ID
    const conversationId = Message.getConversationId(req.user.id, receiverId);

    const message = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      conversationId,
      content,
      type: type || 'text',
      attachment,
      appointment: appointmentId
    });

    await message.populate([
      { path: 'sender', select: 'fullName avatar' },
      { path: 'receiver', select: 'fullName avatar' }
    ]);

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Get conversation messages
// @route   GET /api/messages/conversation/:userId
// @access  Private
exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const conversationId = Message.getConversationId(req.user.id, userId);

    const messages = await Message.find({
      conversationId,
      $or: [
        { deletedBySender: false, sender: req.user.id },
        { deletedByReceiver: false, receiver: req.user.id }
      ]
    })
      .populate('sender', 'fullName avatar')
      .populate('receiver', 'fullName avatar')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Message.countDocuments({ conversationId });

    res.status(200).json({
      success: true,
      data: messages.reverse(),
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Get all conversations
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    // Get all unique conversations for current user
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', req.user._id] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    // Populate user info
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId = conv.lastMessage.sender.toString() === req.user.id 
          ? conv.lastMessage.receiver 
          : conv.lastMessage.sender;
        
        const otherUser = await User.findById(otherUserId)
          .select('fullName avatar role');

        return {
          conversationId: conv._id,
          otherUser,
          lastMessage: {
            content: conv.lastMessage.content,
            type: conv.lastMessage.type,
            createdAt: conv.lastMessage.createdAt,
            isMine: conv.lastMessage.sender.toString() === req.user.id
          },
          unreadCount: conv.unreadCount
        };
      })
    );

    res.status(200).json({
      success: true,
      data: populatedConversations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/read/:userId
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const conversationId = Message.getConversationId(req.user.id, userId);

    await Message.updateMany(
      {
        conversationId,
        receiver: req.user.id,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.status(200).json({
      success: true,
      message: 'Đã đánh dấu đã đọc'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin nhắn'
      });
    }

    // Mark as deleted for current user
    if (message.sender.toString() === req.user.id) {
      message.deletedBySender = true;
    } else if (message.receiver.toString() === req.user.id) {
      message.deletedByReceiver = true;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xóa'
      });
    }

    await message.save();

    res.status(200).json({
      success: true,
      message: 'Đã xóa tin nhắn'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Get unread count
// @route   GET /api/messages/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user.id,
      isRead: false
    });

    res.status(200).json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};
