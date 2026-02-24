const Journal = require('../models/Journal.model');

// @desc    Create journal entry
// @route   POST /api/journals
// @access  Private (Customer)
exports.createJournal = async (req, res) => {
  try {
    const {
      title,
      content,
      mood,
      moodScore,
      emotions,
      activities,
      triggers,
      sleepHours,
      sleepQuality,
      sleep,
      entryDate
    } = req.body;

    const journal = await Journal.create({
      user: req.user.id,
      title,
      content,
      mood,
      moodScore,
      emotions,
      activities,
      triggers,
      sleepHours: sleep?.hours || sleepHours,
      sleepQuality: sleep?.quality || sleepQuality,
      sleep: sleep,
      entryDate: entryDate ? new Date(entryDate) : new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Tạo nhật ký thành công',
      data: journal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Get my journals
// @route   GET /api/journals
// @access  Private (Customer)
exports.getMyJournals = async (req, res) => {
  try {
    const { mood, startDate, endDate, page = 1, limit = 10 } = req.query;
    
    const query = { user: req.user.id };
    
    if (mood) query.mood = mood;
    if (startDate || endDate) {
      query.entryDate = {};
      if (startDate) query.entryDate.$gte = new Date(startDate);
      if (endDate) query.entryDate.$lte = new Date(endDate);
    }

    const journals = await Journal.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ entryDate: -1 });

    const total = await Journal.countDocuments(query);

    res.status(200).json({
      success: true,
      data: journals,
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

// @desc    Get journal by ID
// @route   GET /api/journals/:id
// @access  Private
exports.getJournalById = async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhật ký'
      });
    }

    // Check authorization
    const isOwner = journal.user.toString() === req.user.id;
    const isSharedProvider = journal.sharedWithProviders.includes(req.user.id);
    
    if (!isOwner && !isSharedProvider && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }

    res.status(200).json({
      success: true,
      data: journal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Update journal
// @route   PUT /api/journals/:id
// @access  Private (Customer)
exports.updateJournal = async (req, res) => {
  try {
    let journal = await Journal.findById(req.params.id);

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhật ký'
      });
    }

    // Check ownership
    if (journal.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền chỉnh sửa'
      });
    }

    const allowedFields = ['title', 'content', 'mood', 'moodScore', 'emotions', 'activities', 'triggers', 'sleepHours', 'sleepQuality'];
    const updateData = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    journal = await Journal.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Cập nhật nhật ký thành công',
      data: journal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Delete journal
// @route   DELETE /api/journals/:id
// @access  Private (Customer)
exports.deleteJournal = async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhật ký'
      });
    }

    // Check ownership
    if (journal.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xóa'
      });
    }

    await journal.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Xóa nhật ký thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Share journal with provider
// @route   PUT /api/journals/:id/share
// @access  Private (Customer)
exports.shareJournal = async (req, res) => {
  try {
    const { providerId } = req.body;

    const journal = await Journal.findById(req.params.id);

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhật ký'
      });
    }

    // Check ownership
    if (journal.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền chia sẻ'
      });
    }

    if (!journal.sharedWithProviders.includes(providerId)) {
      journal.sharedWithProviders.push(providerId);
      await journal.save();
    }

    res.status(200).json({
      success: true,
      message: 'Chia sẻ nhật ký thành công',
      data: journal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Get emotion statistics
// @route   GET /api/journals/stats
// @access  Private (Customer)
exports.getEmotionStats = async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;
    
    const matchQuery = { user: req.user._id };
    
    // Handle period filter
    if (period) {
      const now = new Date();
      let start;
      switch (period) {
        case 'week':
          start = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          start = new Date(now.setDate(now.getDate() - 30));
          break;
        case 'year':
          start = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          start = new Date(now.setDate(now.getDate() - 7));
      }
      matchQuery.entryDate = { $gte: start };
    } else if (startDate || endDate) {
      matchQuery.entryDate = {};
      if (startDate) matchQuery.entryDate.$gte = new Date(startDate);
      if (endDate) matchQuery.entryDate.$lte = new Date(endDate);
    }

    // Mood distribution
    const moodStats = await Journal.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$mood',
          count: { $sum: 1 },
          avgScore: { $avg: '$moodScore' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Daily mood trend
    const moodTrend = await Journal.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$entryDate' } },
          avgMoodScore: { $avg: '$moodScore' },
          entries: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);

    // Top emotions
    const topEmotions = await Journal.aggregate([
      { $match: matchQuery },
      { $unwind: '$emotions' },
      {
        $group: {
          _id: '$emotions',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Sleep statistics
    const sleepStats = await Journal.aggregate([
      { $match: { ...matchQuery, sleepHours: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: null,
          avgSleepHours: { $avg: '$sleepHours' },
          minSleepHours: { $min: '$sleepHours' },
          maxSleepHours: { $max: '$sleepHours' }
        }
      }
    ]);

    // Calculate overall stats
    const totalJournals = await Journal.countDocuments(matchQuery);
    const avgMoodResult = await Journal.aggregate([
      { $match: matchQuery },
      { $group: { _id: null, avg: { $avg: '$moodScore' } } }
    ]);
    
    // Build mood distribution object
    const moodDistribution = {};
    moodStats.forEach(stat => {
      moodDistribution[stat._id] = stat.count;
    });

    // Calculate top activities
    const topActivities = await Journal.aggregate([
      { $match: matchQuery },
      { $unwind: '$activities' },
      { $group: { _id: '$activities', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { name: '$_id', count: 1, _id: 0 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalJournals,
        averageMoodScore: avgMoodResult[0]?.avg || 0,
        moodDistribution,
        moodStats,
        moodTrend,
        topEmotions,
        topActivities,
        averageSleep: sleepStats[0]?.avgSleepHours || 0,
        goodSleepDays: 0, // Calculate this if needed
        streak: 0, // Calculate this if needed
        trend: 0, // Calculate this if needed
        sleepStats: sleepStats[0] || null
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

// @desc    Get patient journals (Doctor)
// @route   GET /api/journals/patient/:patientId
// @access  Private (Doctor)
exports.getPatientJournals = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Find journals shared with this doctor
    const query = {
      user: patientId,
      sharedWithProviders: req.user.id
    };

    const journals = await Journal.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ entryDate: -1 });

    const total = await Journal.countDocuments(query);

    res.status(200).json({
      success: true,
      data: journals,
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
