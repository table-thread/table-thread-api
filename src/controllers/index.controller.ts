import { NextFunction, Request, Response } from "express";
import config from "config";
import HttpException from "@exceptions/HttpException";
import Helper from "@/utils/helper";




class IndexController {

    public index = async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(200).send(`<center>${config.get(
                "siteTitle"
            )} ${config.get("env")}
            REST API Server is running. 
            <br />
            `);
        } catch (error) {
            next(error);
        }
    };

    
}

export default IndexController;
