const User = require('../models/User.model');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user.toPublicJSON()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ['fullName', 'phone', 'avatar', 'bio', 'specialization', 'qualifications', 'experienceYears', 'consultationFee', 'chatRatePerMinute'];
    const updateData = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: user.toPublicJSON()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Update availability (for doctors/healers)
// @route   PUT /api/users/availability
// @access  Private (Doctor, Healer)
exports.updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { availability },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Cập nhật lịch làm việc thành công',
      data: user.toPublicJSON()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Get all doctors
// @route   GET /api/users/doctors
// @access  Public
exports.getDoctors = async (req, res) => {
  try {
    const { specialization, search, page = 1, limit = 10 } = req.query;
    
    // In development, don't require isProfileVerified
    const query = { 
      role: { $in: ['doctor', 'healer'] }, // Include both doctors and healers
      status: 'active'
    };
    
    // Only require verification in production
    if (process.env.NODE_ENV === 'production') {
      query.isProfileVerified = true;
    }

    if (specialization) {
      query.specialization = specialization;
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }

    const doctors = await User.find(query)
      .select('-password -otp -otpExpires -resetPasswordToken -resetPasswordExpires')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ rating: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: doctors,
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

// @desc    Get all healers
// @route   GET /api/users/healers
// @access  Public
exports.getHealers = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
    const query = { 
      role: 'healer', 
      status: 'active'
    };
    
    if (process.env.NODE_ENV === 'production') {
      query.isProfileVerified = true;
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }

    const healers = await User.find(query)
      .select('-password -otp -otpExpires -resetPasswordToken -resetPasswordExpires')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ rating: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: healers,
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

// @desc    Get single doctor/healer by ID
// @route   GET /api/users/provider/:id
// @access  Public
exports.getProviderById = async (req, res) => {
  try {
    const query = {
      _id: req.params.id,
      role: { $in: ['doctor', 'healer'] }
    };
    
    // Only require active status in production
    if (process.env.NODE_ENV === 'production') {
      query.status = 'active';
    }

    const user = await User.findOne(query)
      .select('-password -otp -otpExpires -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bác sĩ/chuyên gia'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getProviderById:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Get user balance
// @route   GET /api/users/balance
// @access  Private
exports.getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('balance');
    res.status(200).json({
      success: true,
      data: { balance: user.balance }
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

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 10 } = req.query;
    
    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) query.$text = { $search: search };

    const users = await User.find(query)
      .select('-password -otp -otpExpires -resetPasswordToken -resetPasswordExpires')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
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

// @desc    Get user by ID (Admin)
// @route   GET /api/users/:id
// @access  Private (Admin)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -otp -otpExpires -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Update user role (Admin)
// @route   PUT /api/users/:id/role
// @access  Private (Admin)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật role thành công',
      data: user.toPublicJSON()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Toggle suspend user (Admin)
// @route   PUT /api/users/:id/suspend
// @access  Private (Admin)
exports.toggleSuspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    user.status = user.status === 'suspended' ? 'active' : 'suspended';
    await user.save();

    res.status(200).json({
      success: true,
      message: user.status === 'suspended' ? 'Đã tạm khóa tài khoản' : 'Đã mở khóa tài khoản',
      data: user.toPublicJSON()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Verify provider profile (Admin)
// @route   PUT /api/users/:id/verify-profile
// @access  Private (Admin)
exports.verifyProviderProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    if (!['doctor', 'healer'].includes(user.role)) {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể xác thực tài khoản doctor hoặc healer'
      });
    }

    user.isProfileVerified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Đã xác thực hồ sơ',
      data: user.toPublicJSON()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Đã xóa người dùng'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};
