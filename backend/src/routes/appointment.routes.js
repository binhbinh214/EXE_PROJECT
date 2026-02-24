const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointment.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

// Customer routes
router.post(
  "/",
  protect,
  authorize("customer"),
  appointmentController.createAppointment
);
router.get(
  "/my-appointments",
  protect,
  authorize("customer"),
  appointmentController.getMyAppointments
);
router.put(
  "/:id/cancel",
  protect,
  authorize("customer"),
  appointmentController.cancelAppointment
);
router.post(
  "/:id/rate",
  protect,
  authorize("customer"),
  appointmentController.rateAppointment
);

// Provider routes (Doctor, Healer)
router.get(
  "/provider-appointments",
  protect,
  authorize("doctor", "healer"),
  appointmentController.getProviderAppointments
);
router.put(
  "/:id/status",
  protect,
  authorize("doctor", "healer", "admin"),
  appointmentController.updateAppointmentStatus
);
router.put(
  "/:id/notes",
  protect,
  authorize("doctor", "healer"),
  appointmentController.updateConsultationNotes
);
router.post(
  "/:id/recommendations",
  protect,
  authorize("doctor", "healer"),
  appointmentController.sendRecommendation
);

// Shared routes
router.get("/:id", protect, appointmentController.getAppointmentById);

// Admin routes
router.get(
  "/",
  protect,
  authorize("admin"),
  appointmentController.getAllAppointments
);

module.exports = router;
