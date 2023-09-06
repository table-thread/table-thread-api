import { IsNumber, IsNotEmpty, IsString } from 'class-validator';

export class CreateOtpDto {
  @IsNotEmpty()
  @IsString()
  public mobile: string;

  @IsNumber()
  public otp: number;
}
