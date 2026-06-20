import userModel from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import sessionModel from "../models/session.model.js";
import { sendEmail } from "../services/email.service.js";
import { generateOTP, getOTPHtml } from "../utils/utils.js";
import OTPModel from "../models/otp.model.js";



export async function register(req, res) {

    const {username, email, password} = req.body;

    const isAlreadyRegistered = await userModel.findOne({
        $or: [
            {username},
            {email}
        ]
    })
        
    if (isAlreadyRegistered){
        return res.status(400).json({
            message: "username or email already exists"
        })
    }


    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    const user= await userModel.create({
        username,
        email,
        password: hashedPassword
    })

    const otp = generateOTP();
    const html = getOTPHtml(otp);

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    await OTPModel.create({
        email,
        user: user._id,
        otpHash 
    })
    await sendEmail(email, "OTP verification", `your OTP code is ${otp}`, html);

    res.status(201).json({
        message: "user registered successfully",
        user: {
            username: user.username,
            email: user.email,
            verified: user.verified
        },
    })

}

export async function login(req, res){
    const {email, password} = req.body;

    const user = await userModel.findOne({email});

    if (!user){
        return res.status(400).json({
            message: "invalid email or password"
        })
    }

    if(!user.verified){
        return res.status(400).json({
            message: "email not verified"
        })
    }

    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    const isPasswordValid = hashedPassword === user.password;

    if (!isPasswordValid){
        return res.status(400).json({
            message: "invalid email or password"
        })
    }

    const refreshToken = jwt.sign({
        id: user._id
    }, 
        config.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await sessionModel.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
    })

    const accessToken = jwt.sign({
        id: user._id, 
        sessionId: session._id, 
    },  config.JWT_SECRET,
        {
            expiresIn: "15m"
        }
    );

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    res.status(200).json({
        message: "logged in successfully",
        user: {
            username: user.username,
            email: user.email,
        },
        accessToken,
    })

}

export async function getMe(req, res){
    const  token = req.headers.authorization?.split(" ")[1];

    if(!token)
        return res.status(401).json({
            message: "token not founded"
    })

    const decoded = jwt.verify(token, config.JWT_SECRET);

    const user = await userModel.findById(decoded.id);

    res.status(200).json({
        message: "user fetched successfully",
        user:{
            username:user.username,
            email: user.email,
        }
    })
}

export async function refreshToken(req, res){
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
        return res.status(401).json({
            message: "refresh token not found"
        })
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked: false
    })

    if (!session){
        return res.status(401).json({
            message: "invalid refresh token"
        })
    }

    const accessToken = jwt.sign({
        id: decoded.id}, 
        config.JWT_SECRET, 
        {
            expiresIn: "15m"
        }
    );

    const newRefreshToken = jwt.sign({
        id: decoded.id}, 
        config.JWT_SECRET, 
        {
            expiresIn: "7d"
        }
    );

    const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");

    session.refreshTokenHash = newRefreshTokenHash;
    await session.save();
    
    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    res.status(200).json({
        message: "access token refreshed successfully",
        accessToken
    })
}

export async function logout(req, res){
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
        return res.status(400).json({
            message: "refresh token not found"
        })
    }

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked: false
    })

    if (!session){
        return res.status(400).json({
            message: "invalid refresh token"
        })
    }

    session.revoked = true;
    await session.save(); 

    res.clearCookie("refreshToken");

    res.status(200).json({
        message: "logged out successfully"
    })
}

export async function logoutAll(req, res){
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
        return res.status(400).json({
            message: "refresh token not found"
        })
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

    await sessionModel.updateMany({
        user: decoded.id,
        revoked: false
    }, {
        revoked: true
    })

    res.clearCookie("refreshToken");

    res.status(200).json({
        message: "logged out from all devices successfully"
    })  
}

export async function verifyEmail(req, res){
    const {otp, email} = req.body

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    const otpDoc = await OTPModel.findOne({
        email,
        otpHash
    })

    if (!otpDoc){
        return res.status(400).json({
            message: "invalid OTP"
        })
    }

    const user = await userModel.findByIdAndUpdate(otpDoc.user, 
        { verified: true },
        { new: true }

    );
    

    await OTPModel.deleteMany({
        user: otpDoc.user
    })

    await OTPModel.deleteMany({
    user: otpDoc.user
});

// 🎨 BEAUTIFUL EMAIL HTML
const html = `
<div style="font-family: Arial; background:#f4f6f8; padding:20px;">
  <div style="max-width:420px;margin:auto;background:white;padding:30px;border-radius:12px;text-align:center;">
    <h2 style="color:#22c55e;">🎉 Welcome ${user.username}</h2>
    <p style="color:#6b7280;">
      Your account has been successfully verified.
    </p>
    <p style="color:#6b7280;">
      You can now login and start using the app.
    </p>
  </div>
</div>
`;

await sendEmail(
    user.email,
    "Registration Successful 🎉",
    "Your account is verified",
    html
);
    return res.status(200).json({
        message: "email verified successfully",
        user:{
            username: user.username,
            email: user.email,
            verified: user.verified,
        }
    });
}

export async function forgotPassword(req, res) {
    try {
        const { email } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "user not found"
            });
        }

        // 🔐 Generate token
        const resetToken = crypto.randomBytes(32).toString("hex");

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

        await user.save();

        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        const html = `
<div style="font-family:Arial;background:#f4f6f8;padding:20px;">
  <div style="max-width:420px;margin:auto;background:white;padding:25px;border-radius:10px;text-align:center;">
    
    <h2 style="color:#4f46e5;">🔐 Reset Your Password</h2>

    <p style="color:#6b7280;">
      We received a request to reset your password.
    </p>

    <a href="${resetUrl}" style="
      display:inline-block;
      margin:20px 0;
      padding:12px 20px;
      background:#4f46e5;
      color:white;
      border-radius:8px;
      text-decoration:none;
      font-weight:bold;
    ">
      Reset Password
    </a>

    <p style="font-size:12px;color:#6b7280;">
      ${resetUrl}
    </p>

    <p style="color:#ef4444;font-size:12px;">
      Link expires in 10 minutes
    </p>

  </div>
</div>
`;

        console.log("Sending reset email to:", email);

        await sendEmail(
            email,
            "Reset Your Password 🔐",
            "Click the link to reset password",
            html
        );

        res.status(200).json({
            message: "reset link sent to email"
        });

    } catch (error) {
        console.log("FORGOT PASSWORD ERROR:", error);
        res.status(500).json({
            message: "something went wrong"
        });
    }
}


export async function resetPassword(req, res) {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await userModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: "invalid or expired token"
            });
        }

        const hashedPassword = crypto
            .createHash("sha256")
            .update(password)
            .digest("hex");

        user.password = hashedPassword;
        user.verified = true;

        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        const html = `
<div style="font-family:Arial;background:#f4f6f8;padding:20px;">
  <div style="max-width:420px;margin:auto;background:white;padding:25px;border-radius:10px;text-align:center;">
    
    <h2 style="color:#4f46e5;">🔐 Password Updated</h2>

    <p style="color:#6b7280;">
      Your password has been successfully changed.
    </p>

    <p style="color:#ef4444;font-size:12px;">
      If this wasn’t you, secure your account immediately.
    </p>

  </div>
</div>
`;

        console.log("Sending success email to:", user.email);

        await sendEmail(
            user.email,
            "Password Reset Successful 🔐",
            "Password changed successfully",
            html
        );

        res.status(200).json({
            message: "password reset successful"
        });

    } catch (error) {
        console.log("RESET PASSWORD ERROR:", error);
        res.status(500).json({
            message: "reset failed"
        });
    }
}