const Appointment = require("../models/Appointment.model");
const User = require("../models/User.model");
const Payment = require("../models/Payment.model");
const { sendAppointmentEmail } = require("../utils/email.utils");
const { v4: uuidv4 } = require("uuid");

// @desc    Create appointment - PAY IMMEDIATELY
// @route   POST /api/appointments
// @access  Private (Customer)
exports.createAppointment = async (req, res) => {
  try {
    const {
      providerId,
      providerType,
      appointmentType,
      sessionType,
      scheduledDate,
      scheduledTime,
      duration,
      reasonForVisit,
      patientNotes,
    } = req.body;

    console.log("=== CREATE APPOINTMENT & PROCESS PAYMENT ===");
    console.log("Patient ID:", req.user.id || req.user._id);
    console.log("Provider ID:", providerId);

    // Validate required fields
    if (!providerId || !scheduledDate || !scheduledTime || !reasonForVisit) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin",
      });
    }

    // Check if provider exists and is available
    const provider = await User.findOne({
      _id: providerId,
      role: providerType,
      status: "active",
      isProfileVerified: true,
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bác sĩ/chuyên gia",
      });
    }

    const consultationFee = provider.consultationFee || 0;

    // Get current patient data (use _id or id)
    const userId = req.user._id || req.user.id;
    const patient = await User.findById(userId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin người dùng",
      });
    }

    console.log("Patient found:", patient.email);
    console.log("Patient balance BEFORE:", patient.balance);
    console.log("Fee:", consultationFee);

    // Check patient balance
    if (patient.balance < consultationFee) {
      return res.status(400).json({
        success: false,
        message: `Số dư không đủ. Vui lòng nạp thêm ${(
          consultationFee - patient.balance
        ).toLocaleString()}đ`,
      });
    }

    // Check for conflicting appointments
    const existingAppointment = await Appointment.findOne({
      provider: providerId,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "Khung giờ này đã được đặt. Vui lòng chọn thời gian khác.",
      });
    }

    // ============ PROCESS PAYMENT IMMEDIATELY ============
    const platformFee = Math.round(consultationFee * 0.1);
    const providerAmount = consultationFee - platformFee;

    // Deduct from patient balance
    patient.balance = patient.balance - consultationFee;
    await patient.save();
    console.log("Patient balance AFTER:", patient.balance);

    // Add to provider balance
    provider.balance = (provider.balance || 0) + providerAmount;
    await provider.save();
    console.log("Provider balance AFTER:", provider.balance);
    console.log("Platform fee:", platformFee);

    // Create payment record
    const payment = await Payment.create({
      user: patient._id,
      type: "appointment",
      transactionType: "appointment",
      appointment: null,
      provider: provider._id,
      amount: consultationFee,
      finalAmount: consultationFee,
      platformFee,
      providerAmount,
      paymentMethod: "wallet",
      status: "completed",
      description: `Thanh toán lịch hẹn với ${provider.fullName}`,
      processedAt: new Date(),
    });

    console.log("Payment created:", payment._id);

    // Create appointment with isPaid = true
    const appointment = await Appointment.create({
      patient: patient._id,
      provider: providerId,
      providerType,
      appointmentType: appointmentType || "online",
      sessionType: sessionType || "consultation",
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      duration: duration || 60,
      reasonForVisit,
      patientNotes,
      fee: consultationFee,
      status: "pending",
      isPaid: true,
      paymentId: payment._id,
      meetingLink:
        appointmentType === "online"
          ? `https://meet.mentalhealthcare.com/${uuidv4()}`
          : null,
    });

    // Update payment with appointment ID
    payment.appointment = appointment._id;
    await payment.save();

    console.log("Appointment created:", appointment._id);

    // Populate
    await appointment.populate([
      { path: "patient", select: "fullName email phone avatar balance" },
      {
        path: "provider",
        select: "fullName email phone avatar specialization",
      },
    ]);

    // Send email
    try {
      if (typeof sendAppointmentEmail === "function") {
        await sendAppointmentEmail(provider.email, appointment, "new");
      }
    } catch (emailError) {
      console.error("Email error:", emailError);
    }

    res.status(201).json({
      success: true,
      message: `Đặt lịch hẹn thành công! Đã thanh toán ${consultationFee.toLocaleString()}đ. Vui lòng chờ bác sĩ xác nhận.`,
      data: appointment,
    });
  } catch (error) {
    console.error("Create appointment error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// @desc    Get my appointments (Patient)
// @route   GET /api/appointments/my-appointments
// @access  Private (Customer)
exports.getMyAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const userId = req.user._id || req.user.id;
    const query = { patient: userId };
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate(
        "provider",
        "fullName email phone avatar specialization rating totalRatings"
      )
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ scheduledDate: -1 });

    const total = await Appointment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: appointments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get my appointments error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// @desc    Get provider appointments (Doctor/Healer)
// @route   GET /api/appointments/provider-appointments
// @access  Private (Doctor, Healer)
exports.getProviderAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const userId = req.user._id || req.user.id;
    console.log("=== GET PROVIDER APPOINTMENTS ===");
    console.log("Provider ID:", userId);
    console.log("Status filter:", status);

    const query = { provider: userId };
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate("patient", "fullName email phone avatar")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ scheduledDate: -1 });

    const total = await Appointment.countDocuments(query);

    console.log("Found appointments:", appointments.length);

    res.status(200).json({
      success: true,
      data: appointments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get provider appointments error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patient", "fullName email phone avatar")
      .populate("provider", "fullName email phone avatar specialization");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch hẹn",
      });
    }

    const userId = req.user._id || req.user.id;
    const isPatient = appointment.patient._id.toString() === userId.toString();
    const isProvider =
      appointment.provider._id.toString() === userId.toString();
    const isAdmin = req.user.role === "admin";

    if (!isPatient && !isProvider && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập",
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error("Get appointment error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private (Doctor, Healer, Admin)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["confirmed", "rejected", "completed", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate("patient", "fullName email phone balance")
      .populate("provider", "fullName email phone balance");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch hẹn",
      });
    }

    const userId = req.user._id || req.user.id;
    const isProvider =
      appointment.provider._id.toString() === userId.toString();
    const isAdmin = req.user.role === "admin";

    if (!isProvider && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền cập nhật",
      });
    }

    // Refund if rejected
    if (status === "rejected" && appointment.isPaid) {
      console.log("=== PROCESSING REFUND FOR REJECTION ===");

      const currentPatient = await User.findById(appointment.patient._id);
      currentPatient.balance += appointment.fee;
      await currentPatient.save();
      console.log("Patient refunded:", appointment.fee);

      const currentProvider = await User.findById(appointment.provider._id);
      const platformFee = Math.round(appointment.fee * 0.1);
      const providerAmount = appointment.fee - platformFee;
      currentProvider.balance = Math.max(
        0,
        (currentProvider.balance || 0) - providerAmount
      );
      await currentProvider.save();
      console.log("Provider deducted:", providerAmount);

      await Payment.create({
        user: appointment.patient._id,
        type: "refund",
        transactionType: "refund",
        appointment: appointment._id,
        provider: appointment.provider._id,
        amount: appointment.fee,
        finalAmount: appointment.fee,
        platformFee: 0,
        providerAmount: 0,
        paymentMethod: "wallet",
        status: "completed",
        description: "Hoàn tiền do bác sĩ/chuyên gia từ chối lịch hẹn",
        refundReason: "Lịch hẹn bị từ chối",
        originalPayment: appointment.paymentId,
        processedAt: new Date(),
      });

      appointment.isPaid = false;
    }

    appointment.status = status;

    if (status === "confirmed") {
      appointment.confirmedAt = new Date();
    } else if (status === "completed") {
      appointment.completedAt = new Date();
    }

    await appointment.save();

    await appointment.populate([
      { path: "patient", select: "fullName email phone avatar balance" },
      {
        path: "provider",
        select: "fullName email phone avatar specialization balance",
      },
    ]);

    try {
      if (typeof sendAppointmentEmail === "function") {
        const emailType =
          status === "confirmed"
            ? "confirmed"
            : status === "rejected"
            ? "rejected"
            : status === "completed"
            ? "completed"
            : "update";
        await sendAppointmentEmail(
          appointment.patient.email,
          appointment,
          emailType
        );
      }
    } catch (emailError) {
      console.error("Email error:", emailError);
    }

    const message =
      status === "confirmed"
        ? "Xác nhận lịch hẹn thành công"
        : status === "rejected"
        ? "Từ chối lịch hẹn thành công. Đã hoàn tiền cho bệnh nhân."
        : "Cập nhật trạng thái thành công";

    res.status(200).json({
      success: true,
      message,
      data: appointment,
    });
  } catch (error) {
    console.error("Update appointment status error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// @desc    Cancel appointment (by patient)
// @route   PUT /api/appointments/:id/cancel
// @access  Private (Customer)
exports.cancelAppointment = async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    const appointment = await Appointment.findById(req.params.id)
      .populate("patient", "fullName email phone balance")
      .populate("provider", "fullName email phone balance");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch hẹn",
      });
    }

    const userId = req.user._id || req.user.id;
    if (appointment.patient._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền hủy lịch hẹn này",
      });
    }

    if (
      appointment.status === "completed" ||
      appointment.status === "cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message: "Không thể hủy lịch hẹn này",
      });
    }

    const appointmentTime = new Date(appointment.scheduledDate);
    const [hours, minutes] = appointment.scheduledTime.split(":");
    appointmentTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const now = new Date();
    const hoursUntilAppointment = (appointmentTime - now) / (1000 * 60 * 60);

    if (appointment.isPaid) {
      console.log("=== PROCESSING REFUND FOR CANCELLATION ===");

      let refundAmount = appointment.fee;
      let refundPercentage = 100;

      if (hoursUntilAppointment < 24) {
        refundPercentage = 50;
        refundAmount = Math.round(appointment.fee * 0.5);
      }

      console.log("Hours until appointment:", hoursUntilAppointment);
      console.log("Refund percentage:", refundPercentage);
      console.log("Refund amount:", refundAmount);

      const currentPatient = await User.findById(appointment.patient._id);
      currentPatient.balance += refundAmount;
      await currentPatient.save();

      const currentProvider = await User.findById(appointment.provider._id);
      const platformFee = Math.round(appointment.fee * 0.1);
      const providerAmount = appointment.fee - platformFee;
      const providerRefundAmount = Math.round(
        providerAmount * (refundPercentage / 100)
      );

      currentProvider.balance = Math.max(
        0,
        (currentProvider.balance || 0) - providerRefundAmount
      );
      await currentProvider.save();

      await Payment.create({
        user: appointment.patient._id,
        type: "refund",
        transactionType: "refund",
        appointment: appointment._id,
        provider: appointment.provider._id,
        amount: refundAmount,
        finalAmount: refundAmount,
        platformFee: 0,
        providerAmount: 0,
        paymentMethod: "wallet",
        status: "completed",
        description: `Hoàn ${refundPercentage}% tiền do bệnh nhân hủy lịch hẹn`,
        refundReason:
          cancellationReason ||
          `Bệnh nhân hủy lịch hẹn (hoàn ${refundPercentage}%)`,
        originalPayment: appointment.paymentId,
        processedAt: new Date(),
        metadata: {
          refundPercentage,
          originalAmount: appointment.fee,
          hoursBeforeAppointment: hoursUntilAppointment,
        },
      });

      appointment.isPaid = false;
    }

    appointment.status = "cancelled";
    appointment.cancellationReason = cancellationReason;
    appointment.cancelledBy = userId;
    appointment.cancelledAt = new Date();

    await appointment.save();

    try {
      if (typeof sendAppointmentEmail === "function") {
        await sendAppointmentEmail(
          appointment.provider.email,
          appointment,
          "cancelled"
        );
      }
    } catch (emailError) {
      console.error("Email error:", emailError);
    }

    const refundMessage =
      hoursUntilAppointment < 24
        ? "Đã hoàn 50% tiền vào tài khoản (hủy trong vòng 24h)."
        : "Đã hoàn 100% tiền vào tài khoản.";

    res.status(200).json({
      success: true,
      message: `Hủy lịch hẹn thành công. ${refundMessage}`,
      data: appointment,
    });
  } catch (error) {
    console.error("Cancel appointment error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// @desc    Update consultation notes
// @route   PUT /api/appointments/:id/notes
// @access  Private (Doctor, Healer)
exports.updateConsultationNotes = async (req, res) => {
  try {
    const { diagnosis, treatment, prescription, followUpInstructions } =
      req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch hẹn",
      });
    }

    const userId = req.user._id || req.user.id;
    if (appointment.provider.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền cập nhật",
      });
    }

    appointment.consultationNotes = {
      diagnosis,
      treatment,
      prescription,
      followUpInstructions,
      updatedAt: new Date(),
    };

    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật ghi chú thành công",
      data: appointment,
    });
  } catch (error) {
    console.error("Update notes error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// @desc    Send recommendation/homework
// @route   POST /api/appointments/:id/recommendations
// @access  Private (Doctor, Healer)
exports.sendRecommendation = async (req, res) => {
  try {
    const { type, title, description, fileUrl, link, dueDate } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch hẹn",
      });
    }

    const userId = req.user._id || req.user.id;
    if (appointment.provider.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền thêm bài tập",
      });
    }

    appointment.recommendations.push({
      type,
      title,
      description,
      fileUrl,
      link,
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Thêm bài tập thành công",
      data: appointment,
    });
  } catch (error) {
    console.error("Send recommendation error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// @desc    Rate appointment
// @route   POST /api/appointments/:id/rate
// @access  Private (Customer)
exports.rateAppointment = async (req, res) => {
  try {
    const { score, review } = req.body;

    if (!score || score < 1 || score > 5) {
      return res.status(400).json({
        success: false,
        message: "Điểm đánh giá phải từ 1-5",
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch hẹn",
      });
    }

    const userId = req.user._id || req.user.id;
    if (appointment.patient.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền đánh giá",
      });
    }

    if (appointment.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể đánh giá sau khi buổi tư vấn hoàn thành",
      });
    }

    if (appointment.rating && appointment.rating.score) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã đánh giá lịch hẹn này rồi",
      });
    }

    appointment.rating = {
      score,
      review,
      ratedAt: new Date(),
    };

    await appointment.save();

    const provider = await User.findById(appointment.provider);
    const currentRating = provider.rating || 0;
    const currentTotalRatings = provider.totalRatings || 0;
    const newTotalRatings = currentTotalRatings + 1;
    const newRating =
      (currentRating * currentTotalRatings + score) / newTotalRatings;

    provider.rating = Math.round(newRating * 10) / 10;
    provider.totalRatings = newTotalRatings;
    await provider.save();

    res.status(200).json({
      success: true,
      message: "Đánh giá thành công",
      data: appointment,
    });
  } catch (error) {
    console.error("Rate appointment error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// @desc    Get all appointments (Admin)
// @route   GET /api/appointments
// @access  Private (Admin)
exports.getAllAppointments = async (req, res) => {
  try {
    const { status, providerType, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (providerType) query.providerType = providerType;

    const appointments = await Appointment.find(query)
      .populate("patient", "fullName email phone")
      .populate("provider", "fullName email phone specialization")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Appointment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: appointments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all appointments error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};
