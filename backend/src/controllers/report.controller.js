const Report = require('../models/Report.model');

// @desc    Create report
// @route   POST /api/reports
// @access  Private
exports.createReport = async (req, res) => {
  try {
    const {
      type,
      priority,
      subject,
      description,
      relatedUser,
      relatedAppointment,
      relatedPayment,
      relatedContent,
      isAnonymous
    } = req.body;

    const report = await Report.create({
      reporter: req.user.id,
      type,
      priority: priority || 'medium',
      subject,
      description,
      relatedUser,
      relatedAppointment,
      relatedPayment,
      relatedContent,
      isAnonymous
    });

    res.status(201).json({
      success: true,
      message: 'Báo cáo đã được gửi thành công',
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Get my reports
// @route   GET /api/reports/my-reports
// @access  Private
exports.getMyReports = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { reporter: req.user.id };
    if (status) query.status = status;

    const reports = await Report.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      data: reports,
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

// @desc    Get report by ID
// @route   GET /api/reports/:id
// @access  Private
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reporter', 'fullName email')
      .populate('relatedUser', 'fullName email')
      .populate('assignedTo', 'fullName')
      .populate('resolution.resolvedBy', 'fullName');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy báo cáo'
      });
    }

    // Check authorization
    const isReporter = report.reporter._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isReporter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// ============== ADMIN ROUTES ==============

// @desc    Get all reports (Admin)
// @route   GET /api/reports
// @access  Private (Admin)
exports.getAllReports = async (req, res) => {
  try {
    const { type, status, priority, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const reports = await Report.find(query)
      .populate('reporter', 'fullName email')
      .populate('assignedTo', 'fullName')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ priority: -1, createdAt: -1 });

    const total = await Report.countDocuments(query);

    // Get counts by status
    const statusCounts = await Report.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: reports,
      statusCounts,
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

// @desc    Update report status (Admin)
// @route   PUT /api/reports/:id/status
// @access  Private (Admin)
exports.updateReportStatus = async (req, res) => {
  try {
    const { status, resolutionNotes, action } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy báo cáo'
      });
    }

    report.status = status;

    if (status === 'resolved' || status === 'dismissed') {
      report.resolution = {
        notes: resolutionNotes,
        action,
        resolvedBy: req.user.id,
        resolvedAt: new Date()
      };
    }

    await report.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Assign report to admin (Admin)
// @route   PUT /api/reports/:id/assign
// @access  Private (Admin)
exports.assignReport = async (req, res) => {
  try {
    const { adminId } = req.body;

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { 
        assignedTo: adminId,
        status: 'in_progress'
      },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy báo cáo'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Phân công thành công',
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Add communication to report (Admin)
// @route   POST /api/reports/:id/communicate
// @access  Private (Admin)
exports.addCommunication = async (req, res) => {
  try {
    const { message } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy báo cáo'
      });
    }

    report.communications.push({
      from: req.user.id,
      message
    });

    await report.save();

    res.status(200).json({
      success: true,
      message: 'Đã gửi tin nhắn',
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};
