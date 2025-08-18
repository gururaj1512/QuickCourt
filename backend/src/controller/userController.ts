import { Request, Response } from 'express';
import crypto from 'crypto';
import cloudinary from 'cloudinary';
import fs from 'fs';
import path from 'path';
import User from '../models/User';
import { sendToken } from '../utils/jwtToken';
import { sendEmail } from '../utils/sendEmail';


// Register a User
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, confirmPassword, role } = req.body;

        // Validate required fields
        if (!name || !email || !password || !role) {
            res.status(400).json({
                success: false,
                error: 'Please provide name, email, password, and role'
            });
            return;
        }

        // Validate role
        if (!['User', 'Owner'].includes(role)) {
            res.status(400).json({
                success: false,
                error: 'Invalid role. Must be either "User" or "Owner"'
            });
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            res.status(400).json({
                success: false,
                error: 'Passwords do not match'
            });
            return;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                error: 'User with this email already exists'
            });
            return;
        }

        let avatarData = {
            public_id: 'default_avatar',
            url: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
        };

        // Handle avatar upload if file is provided
        if ((req as any).file && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
            try {
                const myCloud = await cloudinary.v2.uploader.upload((req as any).file.path, {
                    folder: "avatars",
                    width: 500,
                    crop: "scale",
                    public_id: `${Date.now()}`,
                    resource_type: "auto"
                });
                avatarData = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                };

                // Delete the temporary file after upload
                fs.unlinkSync((req as any).file.path);
            } catch (cloudinaryError) {
                console.error('Cloudinary upload error:', cloudinaryError);
                // Delete the temporary file if upload fails
                if ((req as any).file && (req as any).file.path) {
                    fs.unlinkSync((req as any).file.path);
                }
                // Continue with default avatar if Cloudinary fails
            }
        } else if ((req as any).file) {
            // If Cloudinary is not configured, delete the uploaded file
            fs.unlinkSync((req as any).file.path);
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            avatar: avatarData,
        });

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto
            .createHash('sha256')
            .update(verificationToken)
            .digest('hex');
        
        user.resetPasswordToken = tokenHash;
        user.resetPasswordExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await user.save();

        console.log('Registration - Original token:', verificationToken);
        console.log('Registration - Token hash:', tokenHash);
        console.log('Registration - User saved with token hash:', user.resetPasswordToken);

        // Only send email if email configuration is available
        if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
            const roleText = user.role === 'Owner' ? 'court owner' : 'sports enthusiast';
            const message = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Welcome to QuickCourt!</h2>
                    <p>Thank you for registering with QuickCourt as a <strong>${roleText}</strong>. Please verify your email address by clicking the button below:</p>
                    <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">Verify Email</a>
                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                    <p>${verificationUrl}</p>
                    <p>This link will expire in 24 hours.</p>
                    <p><strong>Account Type:</strong> ${user.role}</p>
                </div>
            `;
            try {
                await sendEmail({
                    email: user.email,
                    subject: `Verify Your QuickCourt Account`,
                    html: message,
                });
            } catch (emailError: any) {
                console.error('Email sending error:', emailError);
                // Continue without email verification if email fails
            }
        }

        sendToken(user, 201, res);
    } catch (error: any) {
        console.error('Registration error:', error);
        // Clean up uploaded file if it exists
        if ((req as any).file && (req as any).file.path) {
            try {
                fs.unlinkSync((req as any).file.path);
            } catch (unlinkError) {
                console.error('Error deleting uploaded file:', unlinkError);
            }
        }
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error during registration'
        });
    }
};

// Verify Email
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.params;

        console.log('Verification attempt with token:', token);

        if (!token) {
            res.status(400).json({
                success: false,
                error: 'Verification token is required'
            });
            return;
        }

        // Create hash of the token
        const verificationToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        console.log('Looking for user with token hash:', verificationToken);

        const user = await User.findOne({
            resetPasswordToken: verificationToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        console.log('User found:', user ? 'Yes' : 'No');

        if (!user) {
            // Let's also check if there's a user with this token but expired
            const expiredUser = await User.findOne({
                resetPasswordToken: verificationToken,
            });
            
            if (expiredUser) {
                res.status(400).json({
                    success: false,
                    error: 'Verification token has expired. Please request a new verification email.'
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: 'Invalid verification token'
                });
            }
            return;
        }

        // Update user verification status
        user.isVerified = true;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Email verified successfully! You can now log in to your account.',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified
            }
        });
    } catch (error: any) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error during email verification'
        });
    }
};

// Resend Verification Email
export const resendVerificationEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({
                success: false,
                error: 'Email is required'
            });
            return;
        }

        const user = await User.findOne({ email });

        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found'
            });
            return;
        }

        if (user.isVerified) {
            res.status(400).json({
                success: false,
                error: 'Email is already verified'
            });
            return;
        }

        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(verificationToken)
            .digest('hex');
        user.resetPasswordExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await user.save();

        // Send verification email
        if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
            const roleText = user.role === 'Owner' ? 'court owner' : 'sports enthusiast';
            const message = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Verify Your QuickCourt Account</h2>
                    <p>Please verify your email address for your <strong>${roleText}</strong> account by clicking the button below:</p>
                    <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">Verify Email</a>
                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                    <p>${verificationUrl}</p>
                    <p>This link will expire in 24 hours.</p>
                    <p><strong>Account Type:</strong> ${user.role}</p>
                    <p>If you didn't request this verification, please ignore this email.</p>
                </div>
            `;
            
            try {
                await sendEmail({
                    email: user.email,
                    subject: `Verify Your QuickCourt Account`,
                    html: message,
                });

                res.status(200).json({
                    success: true,
                    message: 'Verification email sent successfully'
                });
            } catch (emailError: any) {
                console.error('Email sending error:', emailError);
                res.status(500).json({
                    success: false,
                    error: 'Failed to send verification email'
                });
            }
        } else {
            res.status(500).json({
                success: false,
                error: 'Email service not configured'
            });
        }
    } catch (error: any) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error while resending verification'
        });
    }
};

// Login User
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: 'Please provide an email and password'
            });
            return;
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
            return;
        }

        const isPasswordMatched = await user.matchPassword(password);
        if (!isPasswordMatched) {
            res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
            return;
        }

        // Check if email is verified
        if (!user.isVerified) {
            res.status(401).json({
                success: false,
                error: 'Please verify your email address before logging in. Check your inbox for a verification link.',
                requiresVerification: true,
                email: user.email
            });
            return;
        }

        sendToken(user, 200, res);
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error during login'
        });
    }
};

// Logout User
export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        res.cookie("token", null, {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true,
        });

        res.status(200).json({
            success: true,
            message: "Logged Out",
        });
    } catch (error: any) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error during logout'
        });
    }
};

// Forgot Password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({
                success: false,
                error: 'Email is required'
            });
            return;
        }

        const user = await User.findOne({ email });

        if (!user) {
            res.status(404).json({
                success: false,
                error: 'There is no user with that email'
            });
            return;
        }

        // Get ResetPassword Token
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
        const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>You requested a password reset for your QuickCourt account. Click the button below to reset your password:</p>
            <a href="${resetUrl}" style="background-color: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">Reset Password</a>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
        </div>
        `;

        // Only send email if email configuration is available
        if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            try {
                await sendEmail({
                    email: user.email,
                    subject: `Password Reset - QuickCourt`,
                    html: html,
                });

                res.status(200).json({
                    success: true,
                    message: `Email sent to ${user.email} successfully`,
                });
            } catch (emailError) {
                user.resetPasswordToken = undefined;
                user.resetPasswordExpire = undefined;
                await user.save({ validateBeforeSave: false });

                res.status(500).json({
                    success: false,
                    error: 'Email could not be sent'
                });
            }
        } else {
            res.status(200).json({
                success: true,
                message: `Password reset token generated. Email service not configured.`,
                resetToken: resetToken // Only for development/testing
            });
        }
    } catch (error: any) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error during password reset'
        });
    }
};

// Reset Password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        if (!token) {
            res.status(400).json({
                success: false,
                error: 'Reset token is required'
            });
            return;
        }

        if (!password || !confirmPassword) {
            res.status(400).json({
                success: false,
                error: 'Password and confirm password are required'
            });
            return;
        }

        if (password !== confirmPassword) {
            res.status(400).json({
                success: false,
                error: 'Passwords do not match'
            });
            return;
        }

        // creating token hash
        const resetPasswordToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            // Check if token exists but is expired
            const expiredUser = await User.findOne({
                resetPasswordToken,
            });
            
            if (expiredUser) {
                res.status(400).json({
                    success: false,
                    error: 'Password reset token has expired. Please request a new password reset.'
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: 'Invalid password reset token'
                });
            }
            return;
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();
        sendToken(user, 200, res);
    } catch (error: any) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error during password reset'
        });
    }
};

// Get User Detail
export const getUserDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById((req as any).user.id);
        
        if (!user) {
            res.status(404).json({
                success: false,
                error: "User not found",
            });
            return;
        }
        
        res.status(200).json({
            success: true,
            user,
        });
    } catch (error: any) {
        console.error('Get user details error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error while fetching user details'
        });
    }
};

// Update User password
export const updatePassword = async (req: Request, res: Response): Promise<void> => {
    const user = await User.findById((req as any).user.id).select("+password");

    if (!user) {
        res.status(404).json({
            success: false,
            error: "User not found"
        });
        return;
    }

    const isPasswordMatched = await user?.matchPassword(req.body.oldPassword);
    if (!isPasswordMatched) {
        res.status(400).json({
            success: false,
            error: "Old password is incorrect"
        });
        return;
    }
    if (req.body.newPassword !== req.body.confirmPassword) {
        res.status(400).json({
            success: false,
            error: "password does not match"
        });
        return;
    }

    user.password = req.body.newPassword;
    await user.save();
    sendToken(user, 200, res);
};

// Update User Details
export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const newUserData: {
            name?: string;
            email?: string;
            phone?: string;
            avatar?: {
                public_id: string;
                url: string;
            };
        } = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phonephone,
        };

        // Handle avatar upload if file is provided
        if ((req as any).file && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
            const user = await User.findById((req as any).user.id);

            if (!user) {
                res.status(404).json({
                    success: false,
                    error: "User not found",
                });
                return;
            }

            // Destroy old avatar only if it exists and Cloudinary is configured
            if (user.avatar?.public_id && process.env.CLOUDINARY_CLOUD_NAME) {
                try {
                    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
                } catch (cloudinaryError) {
                    console.error('Error destroying old avatar:', cloudinaryError);
                }
            }

            try {
                const myCloud = await cloudinary.v2.uploader.upload((req as any).file.path, {
                    folder: "avatars",
                    width: 500,
                    crop: "scale",
                });

                newUserData.avatar = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                };

                // Delete the temporary file after upload
                fs.unlinkSync((req as any).file.path);
            } catch (cloudinaryError) {
                console.error('Error uploading new avatar:', cloudinaryError);
                // Delete the temporary file if upload fails
                if ((req as any).file && (req as any).file.path) {
                    fs.unlinkSync((req as any).file.path);
                }
                res.status(500).json({
                    success: false,
                    error: "Failed to upload avatar"
                });
                return;
            }
        } else if ((req as any).file) {
            // If Cloudinary is not configured, delete the uploaded file
            fs.unlinkSync((req as any).file.path);
        }

        const updatedUser = await User.findByIdAndUpdate(
            (req as any).user.id,
            newUserData,
            {
                new: true,
                runValidators: true,
                useFindAndModify: false,
            }
        );

        if (!updatedUser) {
            res.status(404).json({
                success: false,
                error: "User not found",
            });
            return;
        }

        res.status(200).json({
            success: true,
            user: updatedUser,
        });
    } catch (error: any) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error during profile update'
        });
    }
};


// Get all users --> Admin
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await User.find();
        res.status(200).json({
            success: true,
            users: users,
        });
    } catch (error: any) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error while fetching users'
        });
    }
};

// Get single users --> Admin
export const getSingleUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404).json({
                success: false,
                error: "User not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            user: user,
        });
    } catch (error: any) {
        console.error('Get single user error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error while fetching user'
        });
    }
};

// update User Role -- Admin
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
    try {
        const newUserData = {
            name: req.body.name,
            email: req.body.email,
            role: req.body.role,
        };

        const updatedUser = await User.findByIdAndUpdate(req.params.id, newUserData, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });

        if (!updatedUser) {
            res.status(404).json({
                success: false,
                error: "User not found",
            });
            return;
        }

        res.status(200).json({
            success: true,
            user: updatedUser,
        });
    } catch (error: any) {
        console.error('Update user role error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error while updating user role'
        });
    }
};

// Delete User -- Admin
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            res.status(404).json({
                success: false,
                error: "User not found",
            });
            return;
        }

        // Deleting from cloudinary if configured and image exists
        const imageId = user.avatar?.public_id;
        if (imageId && process.env.CLOUDINARY_CLOUD_NAME) {
            try {
                await cloudinary.v2.uploader.destroy(imageId);
            } catch (cloudinaryError) {
                console.error('Error deleting avatar from Cloudinary:', cloudinaryError);
                // Continue with user deletion even if avatar deletion fails
            }
        }

        await user.deleteOne();
        res.status(200).json({
            success: true,
            message: "User Deleted Successfully",
        });
    } catch (error: any) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error during user deletion'
        });
    }
};