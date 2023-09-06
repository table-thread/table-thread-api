import { CreateOtpDto } from "@dtos/otps.dto";
import HttpException from "@exceptions/HttpException";
import { Otp } from "@interfaces/otps.interface";
import otpModel from "@models/otps.model";
import { isEmpty } from "@utils/util";
import MSG from "@utils/locale.en.json";

class OtpService {
	public otps = otpModel;

	public async createOtp(otpData: CreateOtpDto): Promise<Otp> {
		if (isEmpty(otpData)) throw new HttpException(400, MSG.FIELDS_MISSING);
		await this.otps.deleteOne({ mobile: otpData.mobile });
		const createOtpData: Otp = await this.otps.create(otpData);
		return createOtpData;
	}

	public async verifyOtp(otpData: any): Promise<Otp> {
		if (isEmpty(otpData._id) || isEmpty(otpData.otp))
			throw new HttpException(400, MSG.FIELDS_MISSING);
		const findOtp: Otp = await this.otps.findOne({
			_id: otpData._id,
			otp: otpData.otp,
		});
		if (!findOtp) throw new HttpException(409, MSG.OTP_EXPIRED);
		return findOtp;
	}
}

export default OtpService;
