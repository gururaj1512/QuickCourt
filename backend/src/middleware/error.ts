import { Request, Response, NextFunction } from 'express';


export interface CustomError extends Error {
    statusCode?: number,
    code?: string
}

export const errorHandler = (
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    let error = { ...err };
    error.message = err.message;

    console.log(err);

    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = { ...error, message, statusCode: 404 };
    }

    if (err.code === '11000') {
        const message = 'Duplicate field value entered';
        error = { ...error, message, statusCode: 400 };
    }

    if (err.name === 'ValidationError') {
        const message = Object.values((err as any).errors).map((val: any) => val.message).join(', ');
        error = { ...error, message, statusCode: 400 };
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    });
}

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
    const error = new Error(`Not Found - ${req.originalUrl}`) as CustomError;
    res.status(404);
    next(error);
};