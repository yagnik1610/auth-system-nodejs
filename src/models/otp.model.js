import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "email is required"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: [true, "user is required"],
  },
  otpHash: {
    type: String,
    required: [true, "otp is required"],
  },
  
},{
    timestamps: true,
});

const OTPModel = mongoose.model("OTP", otpSchema);

export default OTPModel;