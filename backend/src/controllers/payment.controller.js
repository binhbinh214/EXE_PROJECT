const Payment = require('../models/Payment.model');
const User = require('../models/User.model');
const Appointment = require('../models/Appointment.model');

// @desc    Deposit money to wallet
// @route   POST /api/payments/deposit
// @access  Private (Customer)
exports.deposit = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    if (amount < 10000) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền nạp tối thiểu là 10,000 VND'
      });
    }

    // Create payment record
    const payment = await Payment.create({
      user: req.user.id,
      type: 'deposit',
      amount,
      finalAmount: amount,
      paymentMethod: paymentMethod || 'stripe',
      status: 'pending',
      description: 'Nạp tiền vào ví',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // In real implementation, integrate with payment gateway
    // For demo, auto-complete the payment
    payment.status = 'completed';
    payment.processedAt = new Date();
    await payment.save();

    // Update user balance
    const user = await User.findById(req.user.id);
    user.balance += amount;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Nạp tiền thành công',
      data: {
        payment,
        newBalance: user.balance
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

// @desc    Make payment for appointment
// @route   POST /api/payments/pay-appointment
// @access  Private (Customer)
exports.payForAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch hẹn'
      });
    }

    if (appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền thanh toán'
      });
    }

    if (appointment.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'Lịch hẹn đã được thanh toán'
      });
    }

    // Check user balance
    const user = await User.findById(req.user.id);
    if (user.balance < appointment.fee) {
      return res.status(400).json({
        success: false,
        message: 'Số dư không đủ. Vui lòng nạp thêm tiền.'
      });
    }

    // Create payment record
    const payment = await Payment.create({
      user: req.user.id,
      type: 'appointment',
      appointment: appointmentId,
      provider: appointment.provider,
      amount: appointment.fee,
      finalAmount: appointment.fee,
      paymentMethod: 'wallet',
      status: 'completed',
      description: `Thanh toán lịch hẹn ${appointment._id}`,
      processedAt: new Date()
    });

    // Deduct from user balance
    user.balance -= appointment.fee;
    await user.save();

    // Update appointment payment status
    appointment.isPaid = true;
    appointment.paymentId = payment._id;
    await appointment.save();

    // Add to provider balance (minus platform fee, e.g., 10%)
    const platformFee = appointment.fee * 0.1;
    const providerAmount = appointment.fee - platformFee;
    await User.findByIdAndUpdate(appointment.provider, {
      $inc: { balance: providerAmount }
    });

    res.status(200).json({
      success: true,
      message: 'Thanh toán thành công',
      data: {
        payment,
        newBalance: user.balance
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

// @desc    Get my payments
// @route   GET /api/payments/my-payments
// @access  Private
exports.getMyPayments = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;
    
    const query = { user: req.user.id };
    if (type) query.type = type;
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .populate('appointment', 'scheduledDate scheduledTime')
      .populate('provider', 'fullName')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: payments,
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

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('user', 'fullName email')
      .populate('appointment')
      .populate('provider', 'fullName');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giao dịch'
      });
    }

    // Check authorization
    if (payment.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Get balance
// @route   GET /api/payments/balance
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

// @desc    Get all payments (Admin)
// @route   GET /api/payments
// @access  Private (Admin)
exports.getAllPayments = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 10, startDate, endDate } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const payments = await Payment.find(query)
      .populate('user', 'fullName email')
      .populate('provider', 'fullName')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Payment.countDocuments(query);

    // Calculate totals
    const stats = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$finalAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: payments,
      stats,
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

// @desc    Process refund (Admin)
// @route   POST /api/payments/:id/refund
// @access  Private (Admin)
exports.processRefund = async (req, res) => {
  try {
    const { reason } = req.body;

    const originalPayment = await Payment.findById(req.params.id);
    if (!originalPayment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giao dịch'
      });
    }

    if (originalPayment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể hoàn tiền cho giao dịch đã hoàn thành'
      });
    }

    // Create refund record
    const refund = await Payment.create({
      user: originalPayment.user,
      type: 'refund',
      amount: originalPayment.finalAmount,
      finalAmount: originalPayment.finalAmount,
      paymentMethod: originalPayment.paymentMethod,
      status: 'completed',
      description: `Hoàn tiền cho giao dịch ${originalPayment.transactionId}`,
      refundReason: reason,
      originalPayment: originalPayment._id,
      refundedAt: new Date(),
      processedAt: new Date()
    });

    // Update user balance
    await User.findByIdAndUpdate(originalPayment.user, {
      $inc: { balance: originalPayment.finalAmount }
    });

    // Update original payment
    originalPayment.status = 'refunded';
    await originalPayment.save();

    res.status(200).json({
      success: true,
      message: 'Hoàn tiền thành công',
      data: refund
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};
