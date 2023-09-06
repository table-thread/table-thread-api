process.env["NODE_CONFIG_DIR"] = __dirname + "/configs";

import "dotenv/config";
import App from "./app";

//api routes
import AuthRoute from "@routes/auth.route";
import IndexRoute from "@routes/index.route";
import AjaxRoute from "@routes/ajax.route";

//web routes

import validateEnv from "@utils/validateEnv";
validateEnv();

const app = new App([
	//api routes
	new AuthRoute(),
	new IndexRoute(),
	new AjaxRoute(),

	//web routes
]);

app.listen();
