import { Router } from "express";
import Route from "@interfaces/routes.interface";
import authMiddleware from "@middlewares/auth.middleware";
import validationMiddleware from "@middlewares/validation.middleware";
import { CreateUserDto } from "@dtos/users.dto";
import OtpController from "@controllers/otps.controller";

class AuthRoute implements Route {
	public path = "/api/auth";
	public router = Router();
	// public authController = new AuthController();
	// public otpController = new OtpController();

	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		
	}
}

export default AuthRoute;
