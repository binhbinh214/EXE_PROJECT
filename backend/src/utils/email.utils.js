const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email
exports.sendEmail = async (options) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `Mental Healthcare <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error: ', error);
    return { success: false, error: error.message };
  }
};

// Send OTP email
exports.sendOTPEmail = async (email, otp, purpose = 'verification') => {
  const subjects = {
    verification: 'Xác thực tài khoản - Mental Healthcare',
    reset: 'Đặt lại mật khẩu - Mental Healthcare'
  };

  const messages = {
    verification: `Mã OTP để xác thực tài khoản của bạn là: <strong>${otp}</strong>`,
    reset: `Mã OTP để đặt lại mật khẩu của bạn là: <strong>${otp}</strong>`
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp { font-size: 32px; font-weight: bold; color: #667eea; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; letter-spacing: 5px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
        .warning { color: #e74c3c; font-size: 14px; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🧠 Mental Healthcare</h1>
          <p>Chăm sóc sức khỏe tinh thần của bạn</p>
        </div>
        <div class="content">
          <h2>Xin chào!</h2>
          <p>${messages[purpose]}</p>
          <div class="otp">${otp}</div>
          <p class="warning">⚠️ Mã OTP này sẽ hết hạn sau 10 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Mental Healthcare. All rights reserved.</p>
          <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await exports.sendEmail({
    email,
    subject: subjects[purpose],
    html
  });
};

// Send welcome email
exports.sendWelcomeEmail = async (email, fullName) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .feature { padding: 10px 0; border-bottom: 1px solid #eee; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🧠 Mental Healthcare</h1>
          <p>Chào mừng bạn đến với cộng đồng của chúng tôi!</p>
        </div>
        <div class="content">
          <h2>Xin chào ${fullName}!</h2>
          <p>Cảm ơn bạn đã đăng ký tài khoản tại Mental Healthcare. Chúng tôi rất vui được đồng hành cùng bạn trên hành trình chăm sóc sức khỏe tinh thần.</p>
          
          <div class="features">
            <h3>🌟 Các tính năng dành cho bạn:</h3>
            <div class="feature">📝 Nhật ký cảm xúc - Ghi lại tâm trạng hàng ngày</div>
            <div class="feature">🧘 Thiền & Thư giãn - Các bài tập giảm stress</div>
            <div class="feature">👨‍⚕️ Tư vấn chuyên gia - Đặt lịch với bác sĩ/chuyên gia tâm lý</div>
            <div class="feature">🤖 AI Chatbot - Hỗ trợ 24/7</div>
            <div class="feature">📊 Thống kê cảm xúc - Theo dõi sức khỏe tinh thần</div>
          </div>
          
          <center>
            <a href="${process.env.FRONTEND_URL}" class="button">Bắt đầu ngay</a>
          </center>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Mental Healthcare. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await exports.sendEmail({
    email,
    subject: 'Chào mừng đến với Mental Healthcare! 🧠',
    html
  });
};

// Send appointment confirmation email
exports.sendAppointmentEmail = async (email, appointment, type = 'confirmation') => {
  const subjects = {
    confirmation: 'Xác nhận lịch hẹn - Mental Healthcare',
    reminder: 'Nhắc nhở lịch hẹn - Mental Healthcare',
    cancelled: 'Hủy lịch hẹn - Mental Healthcare'
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #eee; }
        .label { font-weight: bold; width: 40%; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🧠 Mental Healthcare</h1>
          <p>${subjects[type]}</p>
        </div>
        <div class="content">
          <div class="info-box">
            <div class="info-row"><span class="label">Ngày:</span> ${new Date(appointment.scheduledDate).toLocaleDateString('vi-VN')}</div>
            <div class="info-row"><span class="label">Giờ:</span> ${appointment.scheduledTime}</div>
            <div class="info-row"><span class="label">Loại:</span> ${appointment.sessionType}</div>
            <div class="info-row"><span class="label">Hình thức:</span> ${appointment.appointmentType === 'online' ? 'Trực tuyến' : 'Trực tiếp'}</div>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Mental Healthcare. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await exports.sendEmail({
    email,
    subject: subjects[type],
    html
  });
};
