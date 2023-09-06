import config from "config";
import { Router } from "express";
import Route from "@interfaces/routes.interface";
// import AjaxController from "@controllers/ajax.controller";


class AjaxRoute implements Route {
	public path = "/ajax";
	public router = Router();
	// public ajaxController = new AjaxController();

	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		
	}

    
}

export default AjaxRoute;
