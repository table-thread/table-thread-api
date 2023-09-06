import { NextFunction, Request, Response } from "express";
import config from "config";
import { RequestWithUser } from "../../interfaces/auth.interface";
import MSG from "../../utils/web.locale.en.json";

class IndexController {

	public index = async (req: Request, res: Response, next: NextFunction) => {
		try {
			res.render("index", {
				title: `${config.get("siteTitle")}`,
				siteUrl: config.get("siteUrl"),
				awsS3Url: config.get("awsS3.url"),
				loginUser: null,
			});
		} catch (error) {
			next(error);
		}
	};

	public logIn = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {

			res.render("login", {
				title: `${config.get("siteTitle")}`,
				siteUrl: config.get("siteUrl"),
				awsS3Url: config.get("awsS3.url"),
				loginUser: null,
			});
		} catch (error) {
			req.flash("error", error.message || MSG.SOMETHING_WRONG);
			res.redirect("/login");
		}
	};


}

export default IndexController;
