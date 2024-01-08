import { NextFunction, Request, Response } from "express";
import HttpException from "@exceptions/HttpException";
import { CreateOtpDto } from "@dtos/otps.dto";
import { Otp } from "@interfaces/otps.interface";
import otpService from "@services/otps.service";
// import userService from "@services/users.service";
import MSG from "@utils/locale.en.json";
import Helper from "@/utils/helper";
import config from "config";

class OtpsController {
	public otpService = new otpService();
	// public userService = new userService();

	public verifyOtp = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			const otpData: Otp = req.body;
			const findOneOtpData: Otp = await this.otpService.verifyOtp(
				otpData
			);
			if (!findOneOtpData) throw new HttpException(409, MSG.OTP_EXPIRED);


			res.status(200).json({
				data: "",
				message: MSG.OTP_VERIFY_SUCCESS,
			});
		} catch (error) {
			next(error);
		}
	};

	public createOtp = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
            
            
			res.status(201).json({
				data: "",
				message: MSG.OTP_SENT_SUCCESS,
			});
		} catch (error) {
			next(error);
		}
	};
}

export default OtpsController;
