const Content = require('../models/Content.model');

// @desc    Get all published content
// @route   GET /api/content
// @access  Public
exports.getContent = async (req, res) => {
  try {
    const { type, category, difficulty, search, page = 1, limit = 10 } = req.query;
    
    const query = { status: 'published' };

    if (type) query.type = type;
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) query.$text = { $search: search };

    const content = await Content.find(query)
      .select('-previousVersions')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ isFeatured: -1, order: 1, publishedAt: -1 });

    const total = await Content.countDocuments(query);

    res.status(200).json({
      success: true,
      data: content,
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

// @desc    Get featured content
// @route   GET /api/content/featured
// @access  Public
exports.getFeaturedContent = async (req, res) => {
  try {
    const content = await Content.find({ 
      status: 'published', 
      isFeatured: true 
    })
      .select('-previousVersions')
      .limit(10)
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Get content by ID
// @route   GET /api/content/:id
// @access  Public
exports.getContentById = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id)
      .populate('author', 'fullName avatar');

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nội dung'
      });
    }

    // Increment view count
    content.views += 1;
    await content.save();

    res.status(200).json({
      success: true,
      data: content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Record content completion
// @route   POST /api/content/:id/complete
// @access  Private
exports.recordCompletion = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nội dung'
      });
    }

    content.completions += 1;
    await content.save();

    res.status(200).json({
      success: true,
      message: 'Đã ghi nhận hoàn thành',
      data: { completions: content.completions }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Like content
// @route   POST /api/content/:id/like
// @access  Private
exports.likeContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nội dung'
      });
    }

    content.likes += 1;
    await content.save();

    res.status(200).json({
      success: true,
      message: 'Đã thích',
      data: { likes: content.likes }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Rate content
// @route   POST /api/content/:id/rate
// @access  Private
exports.rateContent = async (req, res) => {
  try {
    const { score } = req.body;

    if (score < 1 || score > 5) {
      return res.status(400).json({
        success: false,
        message: 'Điểm đánh giá phải từ 1 đến 5'
      });
    }

    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nội dung'
      });
    }

    // Calculate new average
    const newCount = content.rating.count + 1;
    const newAverage = ((content.rating.average * content.rating.count) + score) / newCount;

    content.rating = {
      average: Math.round(newAverage * 10) / 10,
      count: newCount
    };
    await content.save();

    res.status(200).json({
      success: true,
      message: 'Đánh giá thành công',
      data: { rating: content.rating }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// ============== ADMIN/PROVIDER ROUTES ==============

// @desc    Create content
// @route   POST /api/content
// @access  Private (Admin, Doctor, Healer)
exports.createContent = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      category,
      mediaType,
      mediaUrl,
      thumbnailUrl,
      duration,
      difficulty,
      language,
      tags,
      isPremium
    } = req.body;

    const content = await Content.create({
      title,
      description,
      type,
      category,
      mediaType,
      mediaUrl,
      thumbnailUrl,
      duration,
      difficulty,
      language,
      tags,
      isPremium,
      author: req.user.id,
      authorName: req.user.fullName,
      status: req.user.role === 'admin' ? 'published' : 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Tạo nội dung thành công',
      data: content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Update content
// @route   PUT /api/content/:id
// @access  Private (Admin)
exports.updateContent = async (req, res) => {
  try {
    let content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nội dung'
      });
    }

    // Store previous version if media URL changed
    if (req.body.mediaUrl && req.body.mediaUrl !== content.mediaUrl) {
      content.previousVersions.push({
        mediaUrl: content.mediaUrl,
        updatedAt: new Date(),
        version: content.version
      });
      req.body.version = content.version + 1;
    }

    content = await Content.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Cập nhật nội dung thành công',
      data: content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Update content status
// @route   PUT /api/content/:id/status
// @access  Private (Admin)
exports.updateContentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nội dung'
      });
    }

    content.status = status;
    if (status === 'published' && !content.publishedAt) {
      content.publishedAt = new Date();
    }
    await content.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Delete content
// @route   DELETE /api/content/:id
// @access  Private (Admin)
exports.deleteContent = async (req, res) => {
  try {
    const content = await Content.findByIdAndDelete(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nội dung'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Xóa nội dung thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Get all content (Admin)
// @route   GET /api/content/admin/all
// @access  Private (Admin)
exports.getAllContentAdmin = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const content = await Content.find(query)
      .populate('author', 'fullName')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Content.countDocuments(query);

    res.status(200).json({
      success: true,
      data: content,
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
