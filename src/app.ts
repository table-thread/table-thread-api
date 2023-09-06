process.env["NODE_CONFIG_DIR"] = __dirname + "/configs";

import config from "config";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import path from "path";
import morgan from "morgan";
import { connect, set } from "mongoose";
import { dbConnection } from "@databases";
import Routes from "@interfaces/routes.interface";
import errorMiddleware from "@middlewares/error.middleware";
import { logger, stream } from "@utils/logger";
import session from "cookie-session";
import flash  from "express-flash";

class App {
    public app: express.Application;
    public port: string | number;
    public env: string;

    constructor(routes: Routes[]) {
        this.app = express();
        this.port = process.env.PORT || 5000;
        this.env  = process.env.NODE_ENV || "development";

        this.connectToDatabase();
        this.initializeMiddlewares();
        this.initializeRoutes(routes);
        this.initializeErrorHandling();
    }

    public listen() {
        this.app.listen(this.port, () => {
            logger.info(`=================================`);
            logger.info(`======= ENV: ${this.env} =======`);
            logger.info(`🚀 App listening on the port ${this.port}`);
            logger.info(`=================================`);
        });
    }

    public getServer() {
        return this.app;
    }

    private connectToDatabase() {
        if (this.env !== "production") {
            set("debug", true);
        }
        connect(dbConnection.url, dbConnection.options)
        .catch((error) =>
            logger.info(`${error}`)
		);
    }

    private initializeMiddlewares() {
		if (this.env === "production") {
			this.app.use(morgan("combined", { stream }));
			this.app.use(cors({ origin: "yoursite.com", credentials: true }));
		} else {
			this.app.use(morgan("dev", { stream }));
			this.app.use(cors({ origin: true, credentials: true }));
		}
        this.app.use(hpp());
		this.app.use(
			helmet({
				contentSecurityPolicy: false,
			})
		);
		this.app.use(compression());
		this.app.use(express.json({ limit: "5mb" }));
		this.app.use(express.urlencoded({ extended: true, limit: "5mb" }));
		this.app.use(cookieParser());
		this.app.use(express.static(path.join(__dirname, "public")));
		this.app.use(
			session({
				secret: config.get("secretKey"),
				resave: false,
				saveUninitialized: true,
				cookie: {
					maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
					// secure: true, // becareful set this option, check here: https://www.npmjs.com/package/express-session#cookiesecure. In local, if you set this to true, you won't receive flash as you are using `http` in local, but http is not secure
				},
			})
		);
		this.app.use(flash());
		
        // view engine setup
		this.app.set("views", path.join(__dirname, "views"));
		this.app.set("view engine", "ejs");
	}

    private initializeRoutes(routes: Routes[]) {
        routes.forEach((route) => {
            this.app.use("/", route.router);
        });
    }

    private initializeErrorHandling() {
        this.app.use(errorMiddleware);
    }
}

export default App;
