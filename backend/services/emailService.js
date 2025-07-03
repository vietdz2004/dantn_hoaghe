const nodemailer = require('nodemailer');

// Tạo transporter với Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Template email đặt lại mật khẩu
const getPasswordResetEmailTemplate = (userName, resetUrl) => {
  return {
    subject: 'Đặt lại mật khẩu - HoaShop',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Đặt lại mật khẩu HoaShop</h2>
        <p>Xin chào <b>${userName || 'bạn'}</b>!</p>
        <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản HoaShop.</p>
        <p>Nhấp vào liên kết dưới đây để đặt lại mật khẩu (liên kết chỉ có hiệu lực 15 phút):</p>
        <a href="${resetUrl}" style="background: #e91e63; color: #fff; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Đặt lại mật khẩu</a>
        <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
        <hr />
        <p style="font-size: 12px; color: #888;">HoaShop - Đội ngũ hỗ trợ khách hàng</p>
      </div>
    `
  };
};

// Hàm gửi email đặt lại mật khẩu
const sendResetPasswordEmail = async (toEmail, resetUrl, userName) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'HoaShop'} <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
      to: toEmail,
      ...getPasswordResetEmailTemplate(userName, resetUrl)
    };
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('❌ Failed to send email:', err.message);
    // Fallback: mock email
    return { success: false, message: 'Mock email sent (fallback)' };
  }
};

module.exports = { sendResetPasswordEmail };
 