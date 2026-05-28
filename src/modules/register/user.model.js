import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },
});

// ลบตัวแปร next ออกจากวงเล็บเลยครับ
userSchema.pre("save", async function () {
  // ถ้าไม่ได้แก้ไข password ให้ข้ามไป
  if (!this.isModified("password")) return;

  // ทำการ hash โดยไม่ต้องมี next
  const hashedPassword = await bcrypt.hash(this.password, 10);
  this.password = hashedPassword;
});

export const User = mongoose.model("User", userSchema);