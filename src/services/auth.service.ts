import bcrypt from "bcryptjs";
import config from "config";
import jwt from "jsonwebtoken";
import HttpException from "@exceptions/HttpException";
import { DataStoredInToken, TokenData } from "@interfaces/auth.interface";
import { User } from "@interfaces/users.interface";
import { Admin } from "@interfaces/admins.interface";
import { CreateUserDto } from "@dtos/users.dto";
import { CreateAdminDto } from "@dtos/admins.dto";
import userModel from "@models/users.model";
import adminModel from "@models/admins.model";
import otpModel from "@models/otps.model";
import UserService from "@services/users.service";
import AdminService from "@services/admins.service";
import { isEmpty } from "@utils/util";
import moment from "moment";

import MSG from "@utils/locale.en.json";
import { truncate } from "fs";

class AuthService {
	public userService = new UserService();
	public adminService = new AdminService();
	public users = userModel;
	public otps = otpModel;

	public async signup(
		userData: CreateUserDto
	): Promise<{ cookie: string; createUserData: User; tokenData: any }> {
		if (isEmpty(userData)) throw new HttpException(400, MSG.FIELDS_MISSING);

		const otpCount: number = await this.otps.countDocuments({
			_id: userData.otpId,
		});
		if (otpCount == 0) throw new HttpException(409, MSG.OTP_EXPIRED);

		const hashedPassword = await bcrypt.hash(userData.password, 10);
		const createUserData: User = await this.users.create({
			...userData,
			password: hashedPassword,
			status: true,
		});
		const tokenData = this.createToken(createUserData);
		const cookie = this.createCookie(tokenData);
		return { cookie, createUserData, tokenData };
	}

	public async login(
		userData: CreateUserDto
	): Promise<{ cookie: string; findUser: User; tokenData: any }> {
		if (isEmpty(userData)) throw new HttpException(400, MSG.FIELDS_MISSING);
		const role: string = userData.role;

		const findUser: User = await this.userService.findUserByEmail(
			userData.email
		);
		if (!findUser) throw new HttpException(409, MSG.NOT_REGISTERED);

		if (findUser && findUser.role != role)
			throw new HttpException(
				409,
				MSG.DIFFERENT_ROLE.replace(
					"%role%",
					role === "trainer" ? "user" : "trainer"
				)
			);

		if (findUser && findUser.status === false)
			throw new HttpException(409, MSG.ACCOUNT_INACTIVE);

		// if (findUser && !isEmpty(findUser.social.type))
		// 	throw new HttpException(409, MSG.SOCIAL_LOGIN_ALLOWED);

		const isPasswordMatching: boolean = await bcrypt.compare(
			userData.password,
			findUser.password
		);
		if (!isPasswordMatching)
			throw new HttpException(409, MSG.PASSWORD_WRONG);

		const tokenData = this.createToken(findUser);
		const cookie = this.createCookie(tokenData);

		return { cookie, findUser, tokenData };
	}

	public async socialogin(
		userData: CreateUserDto
	): Promise<{ cookie: string; findUser: User; tokenData: any }> {
		if (isEmpty(userData)) throw new HttpException(400, MSG.FIELDS_MISSING);

		const role: string = userData.role;
		//validation for already registered social user
		let countUser: number = 0;
		let updateData = null;
		switch (role) {
			case "trainer":
				countUser = await this.userService.getUserCount(
					"role",
					"user",
					{
						$or: [
							{
								"social.type": userData.social.type,
								"social.token": userData.social.token,
							},
							{
								email: userData.email,
							},
						],
					}
				);
				updateData = {
					status: true,
					isDeleted: false,
					emailVerified: false,
					...userData,
				};
                if(countUser === 0){
                    updateData = {
                        profileApproval: {
                            status: "pending",
                        },
                        ...updateData
                    }
                }
				break;
			case "user":
				countUser = await this.userService.getUserCount(
					"role",
					"trainer",
					{
						$or: [
							{
								"social.type": userData.social.type,
								"social.token": userData.social.token,
							},
							{
								email: userData.email,
							},
						],
					}
				);
				updateData = {
					status: true,
					isDeleted: false,
					emailVerified: false,
					...userData,
				};
				break;
			default:
				break;
		}
		if (isEmpty(updateData))
			throw new HttpException(400, MSG.FIELDS_MISSING);

		if (countUser > 0)
			throw new HttpException(
				409,
				MSG.DIFFERENT_ROLE.replace(
					"%role%",
					role === "trainer" ? "user" : "trainer"
				)
			);

		let findUser = null;
		//first update if found
		findUser = await this.users.findOneAndUpdate(
			{
				role: userData.role,
				$or: [
					{
						"social.type": userData.social.type,
						"social.token": userData.social.token,
					},
					{
						email: userData.email,
					},
				],
			},
			updateData,
			{
				new: true,
			}
		);

		//insert if not found
		if (!findUser && isEmpty(userData.email))
			throw new HttpException(400, MSG.FIELDS_MISSING);

		findUser = await this.users.findOneAndUpdate(
			{
				role: userData.role,
				$or: [
					{
						"social.type": userData.social.type,
						"social.token": userData.social.token,
					},
					{
						email: userData.email,
					},
				],
			},
			updateData,
			{
				new: true,
				upsert: true,
			}
		);
		if (!findUser)
			throw new HttpException(
				409,
				MSG.EMAIL_NOT_FOUND.replace("%email%", userData.email)
			);

		const tokenData = this.createToken(findUser);
		const cookie = this.createCookie(tokenData);
        findUser = findUser.toObject();
        findUser.dob = moment(findUser.dob).format('YYYY-MM-DD');        
		return { cookie, findUser, tokenData };
	}

	public async logout(userData: User): Promise<User> {
		if (isEmpty(userData)) throw new HttpException(400, MSG.FIELDS_MISSING);

		const findUser: User = await this.users.findOne({
			email: userData.email,
			password: userData.password,
		});
		if (!findUser)
			throw new HttpException(
				409,
				MSG.EMAIL_NOT_FOUND.replace("%email%", userData.email)
			);

		return findUser;
	}

	public async adminlogin(
		userData: CreateAdminDto
	): Promise<{ cookie: string; findUser: Admin; tokenData: any }> {
		if (isEmpty(userData)) throw new HttpException(400, MSG.FIELDS_MISSING);
		const findUser: Admin = await this.adminService.findAdminByEmail(
			userData.email
		);
		const isPasswordMatching: boolean = await bcrypt.compare(
			userData.password,
			findUser.password 
		);
		if (!isPasswordMatching)
			throw new HttpException(409, MSG.PASSWORD_WRONG);

		const tokenData = this.createToken(findUser);
		const cookie = this.createCookie(tokenData);

		return { cookie, findUser, tokenData };
	}

	public createToken(user: User): TokenData {
		const dataStoredInToken: DataStoredInToken = { _id: user._id };
		const secret: string = config.get("secretKey");
		const expiresIn: number = 30 * 24 * 60 * 60;

		return {
			expiresIn,
			token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
		};
	}

	public createCookie(tokenData: TokenData): string {
		return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
	}
}

export default AuthService;
