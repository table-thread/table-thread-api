import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { RequestHandler } from 'express';
import HttpException from '@exceptions/HttpException';
import { DataStoredInToken, RequestWithUser } from "@interfaces/auth.interface";


const webValidation = (
  type: any,
  value: string | 'body' | 'query' | 'params' = 'body',
  skipMissingProperties = false,
  whitelist = true,
  forbidNonWhitelisted = true,
): RequestHandler => {
  return (req: RequestWithUser, res, next) => {
    validate(plainToClass(type, req[value]), { skipMissingProperties, whitelist, forbidNonWhitelisted }).then((errors: ValidationError[]) => {
      if (errors.length > 0) {
        const message = errors.map((error: ValidationError) => Object.values(error.constraints)).join(', ');
        req.flash("error", message);
        next(new HttpException(400, message));
      } else {
        next();
      }
    });
  };
};

export default webValidation;
