import config from "config";
import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import HttpException from "@exceptions/HttpException";
import { DataStoredInToken, RequestWithUser } from "@interfaces/auth.interface";
import userModel from "@models/users.model";
import MSG from "@utils/locale.en.json";

const authMiddleware = async (
	req: RequestWithUser,
	res: Response,
	next: NextFunction
) => {
	try {
		const Authorization =
			req.header("Authorization").split("Bearer ")[1] ||
			req.cookies["Authorization"] ||
			null;

		if (Authorization) {
			const secretKey: string = config.get("secretKey");
			const verificationResponse = (await jwt.verify(
				Authorization,
				secretKey
			)) as DataStoredInToken;
			const userId = verificationResponse._id;
			const findUser = await userModel.findById(userId);

			if (findUser) {
				req.user = findUser;
				next();
			} else {
				next(new HttpException(401, MSG.UNAUTHORIZED));
				next();
			}
		} else {
			next(new HttpException(404, MSG.AUTH_MISSING));
		}
	} catch (error) {
		next(new HttpException(401, MSG.AUTH_WRONG));
	}
};

export default authMiddleware;
