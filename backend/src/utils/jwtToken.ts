import { Response } from "express";
import { CookieOptions } from "express";

export const sendToken = (user: any, statusCode: number, res: Response) => {
    const token = user.getSignedJwtToken();

    const options: CookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    };

    res
        .status(statusCode)
        .cookie("token", token, options)
        .json({
            success: true,
            token,
            user
        });
};
