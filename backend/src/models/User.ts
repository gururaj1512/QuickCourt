import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import validator from 'validator';
import { User } from '../types';


export interface UserDocument extends User, Document {
    matchPassword(enteredPassword: string): Promise<boolean>;
    getSignedJwtToken(): string;
    getResetPasswordToken(): string;
    isVerified?: boolean;
    verificationReason?: string;
    phone?: string;
    avatar: {
        public_id: string;
        url: string;
    };
}

const userSchema = new Schema<UserDocument>({
    name: {
        type: String,
        required: [true, "Please Enter Your Name"],
        trim: true,
        maxLength: [30, "Name cannot exceed 30 characters"],
        minLength: [4, "Name should have more than 4 characters"],
    },
    email: {
        type: String,
        required: [true, "Please Enter Your Email"],
        unique: true,
        validate: [validator.isEmail, "Please Enter a valid Email"],
    },
    password: {
        type: String,
        required: [true, "Please Enter Your Password"],
        minLength: [8, "Password should be greater than 8 characters"],
        select: false,
    },
    role: {
        type: String,
        enum: ['User', 'Owner', 'Admin'],
        default: 'User'
    },
    avatar: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
    phone: {
        type: String,
        trim: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationReason: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, {
    timestamps: true
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.getSignedJwtToken = function (): string {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }
    return jwt.sign(
        { userId: this._id, email: this.email, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' } as any
    );
};

userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function (): string {
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

    return resetToken;
};

export default mongoose.model<UserDocument>('User', userSchema);
