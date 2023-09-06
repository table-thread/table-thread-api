import config from "config";
import {
	IsEmail,
	IsString,
	IsNotEmpty,
	IsObject,
	IsOptional,
	Contains,
	IsNumber,
	IsArray,
	IsMongoId,
} from "class-validator";

export class CreateUserDto {
	@IsNotEmpty()
	public name: string;

	@IsNotEmpty()
	@IsString()
	public role: string;

	@IsEmail()
	public email: string;

	@IsNotEmpty()
	public mobile: string;

	@IsNotEmpty()
	public password: string;

	@IsOptional()
	@IsString()
	public gender: string;

	@IsOptional()
	@IsNumber()
	public dob: string;

	@IsOptional()
	@IsString()
	// @Contains(config.get("env"))
	public profileImage: string;

    @IsOptional()
	@IsString()
	// @Contains(config.get("env"))
	public bgImage: string;

    @IsOptional()
	@IsString()
	public address: string;

	@IsOptional()
	@IsObject()
	public location: {
		type: string;
		coordinates: [];
	};

	@IsOptional()
	@IsArray()
	@IsMongoId({
		each: true,
	})
	public categories: [];

	@IsOptional()
	@IsString()
	public description;

	@IsOptional()
	@IsArray()
	public speciality: [];

	@IsOptional()
	@IsNumber()
	public hourlyRate: number;

	@IsOptional()
	@IsNumber()
	public experienceYear: number;

	@IsOptional()
	@IsObject()
	public documents: {
		certificate: string;
		address: string;
		identity: string;
	};

	@IsOptional()
	@IsArray()
	@IsMongoId({
		each: true,
	})
	public goals: [];

	@IsOptional()
	@IsString()
	public height: string;

	@IsOptional()
	@IsNumber()
	public weight: number;

	@IsOptional()
	@IsObject()
	public device: {
		id: string;
		token: string;
	};

	@IsOptional()
	@IsObject()
	public social: {
		type: string;
		token: string;
	};

	@IsOptional()
	public otpId: string;

	@IsOptional()
	public resetToken: string;
}
