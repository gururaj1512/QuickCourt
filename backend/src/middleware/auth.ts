import { Request, Response, NextFunction } from 'express';
import { AuthRequest, JwtPayload } from '../types';
import ErrorHander from '../utils/errorHander';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const isAuthenticatedUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        let token: string | undefined;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return next(new ErrorHander("Please login to access this feature", 401));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return next(new ErrorHander("User not found", 401));
        }
        
        req.user = user as any;
        next();
    } catch (error: any) {
        return next(new ErrorHander("Invalid token", 401));
    }
}

export const authorizeRoles = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authorized to access this route' });
            return;
        }

        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorHander(`Role: ${req.user.role} is not allowed to access this resource`, 403)
            )
        }
        next();
    };
};