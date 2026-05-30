import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { User } from '../register/user.model.js'; 

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  
  // 1. ย้ายการประกาศตัวแปร user ออกมาไว้ตรงนี้ เพื่อให้ catch มองเห็นด้วย
  let user; 

  try {
    // 2. เปลี่ยนจาก const user = ... เป็นแค่ user = ...
    user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้อีเมลนี้ในระบบ' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 3600000; 
    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`; 

    const message = `
      คุณได้รับอีเมลนี้เนื่องจากคุณได้ทำการขอรีเซ็ตรหัสผ่าน
      โปรดคลิกที่ลิงก์ด้านล่างเพื่อรีเซ็ตรหัสผ่านของคุณ:
      \n\n
      ${resetUrl}
      \n\n
      หากคุณไม่ได้เป็นผู้ร้องขอ โปรดเพิกเฉยต่ออีเมลฉบับนี้
    `;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: 'คำขอรีเซ็ตรหัสผ่าน',
      text: message,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'ส่งอีเมลสำหรับรีเซ็ตรหัสผ่านเรียบร้อยแล้ว' });
  } catch (error) {
    // 3. เช็คก่อนว่ามีตัวแปร user ให้เคลียร์ข้อมูลไหม
    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
    }
    // 4. ส่งข้อความ Error กลับไปหาหน้าบ้านให้ชัดเจน
    res.status(500).json({ success: false, message: error.message || 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
  }
};