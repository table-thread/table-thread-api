import { NextFunction, Request, Response } from "express";
import config from "config";
import { RequestWithUser } from "@interfaces/auth.interface";
import userService from "@services/users.service";
import categoriesService from "@services/categories.service";
import goalsService from "@services/goals.service";
import queriesService from "@services/queries.service";
import pagesService from "@services/pages.service";
import emailsService from "@services/emails.service";
import coursesService from "@services/courses.service";
import { CreateUserDto } from "@dtos/users.dto";
import { User } from "@interfaces/users.interface";
import moment from 'moment'
import Helper from "@utils/helper";
import MSG from "@utils/web.locale.en.json";
import ContentData from "@utils/contents.json";
import { Category } from "@/interfaces/categories.interface";
import { Goal } from "@/interfaces/goals.interface";

var ObjectId = require("mongoose").Types.ObjectId;

class AdminController {
	public userService = new userService();
	public categoriesService = new categoriesService();
	public goalsService = new goalsService();
	public queriesService = new queriesService();
	public coursesService = new coursesService();
	public pagesService = new pagesService();
	public emailsService = new emailsService();


	public index = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {
			const usersCount = await this.userService.getUserCount("","",{role: 'user'});
			const trainersCount = await this.userService.getUserCount("","",{role: 'trainer'});
			const coursesCount = await this.coursesService.getCoursesCount({});
			const dashboardData = { users: usersCount, trainers: trainersCount, courses: coursesCount };
			res.render("admin/dashboard", {
				title: config.get("siteTitle"),
				siteUrl: config.get("siteUrl"),
				awsS3Url: config.get("awsS3.url"),
				loginUser: req.user,
				data: dashboardData
			});
		} catch (error) {
			req.flash("error", error.message || MSG.SOMETHING_WRONG);
			res.redirect("/login");
		}
	};

	public trainers = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {
			let trainers = await this.userService.findAllUser({
				role: "trainer",
			});

			res.render("admin/trainers", {
				title: config.get("siteTitle"),
				siteUrl: config.get("siteUrl"),
				awsS3Url: config.get("awsS3.url"),
				loginUser: req.user,
				trainers,
			});
		} catch (error) {
			req.flash("error", error.message || MSG.SOMETHING_WRONG);
			res.redirect("/login");
		}
	};


	public trainerView = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {
			let trainer = await this.userService.findUserById(
				req.params.id
			);

			res.render("admin/trainers/view", {
				title: config.get("siteTitle"),
				siteUrl: config.get("siteUrl"),
				awsS3Url: config.get("awsS3.url"),
				loginUser: req.user,
				trainer,
			});
		} catch (error) {
			req.flash("error", error.message || MSG.SOMETHING_WRONG);
			res.redirect("/login");
		}
	};

	public users = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {
			let users = await this.userService.findAllUser({
				role: "user",
			});

			res.render("admin/users", {
				title: config.get("siteTitle"),
				siteUrl: config.get("siteUrl"),
				awsS3Url: config.get("awsS3.url"),
				loginUser: req.user,
				users,
			});
		} catch (error) {
			req.flash("error", error.message || MSG.SOMETHING_WRONG);
			res.redirect("/login");
		}
	};


	public userView = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {
			let user: any = await this.userService.findUserById(
				req.params.id
			);

			res.render("admin/users/view", {
				title: config.get("siteTitle"),
				siteUrl: config.get("siteUrl"),
				awsS3Url: config.get("awsS3.url"),
				loginUser: req.user,
				user,
			});
		} catch (error) {
			req.flash("error", error.message || MSG.SOMETHING_WRONG);
			res.redirect("/login");
		}
	};

	public trainerUpdate = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {
			if (req.method == "POST") {
				const prefix: string = config.get("awsS3.prefix");
				//req.body.profileImage = prefix+"trainers/"+req.body.profileImage;
				const userData: CreateUserDto = req.body;
				req.body.profileApproval = { status: req.body.profileStatus };
				if(!Array.isArray(req.body.categories)) {
					req.body.categories = [req.body.categories];
				}
				req.body.isFeatured = req.body.featured=='yes' ? true : false ;
				
				const updateUserData: User = await this.userService.updateUser(
					req.params.id,
					userData
				);
				if (updateUserData) {
					req.flash("success", MSG.SUCCESS);
				} else {
					req.flash("error", MSG.ERROR);
				}
				return res.redirect(`/admin/trainers/edit/${req.params.id}`);
			} else {
				let trainer: any = await this.userService.findUserById(
					req.params.id
				); 


				if(trainer.profileImage) {
					const fileName = trainer.profileImage.split("/").find((node: any) => {
						if(node.indexOf(".") > -1) {
							return node;
						}
					});
					trainer.fileExists = fileName;
					trainer.filePath = trainer.profileImage;
					trainer.profileImage = await Helper.getSignedUrlAWS(trainer.profileImage);
				}
				
				if(trainer.documents) {
					trainer.documents.certificate = await Helper.getSignedUrlAWS(trainer.documents.certificate)
					trainer.documents.address = await Helper.getSignedUrlAWS(trainer.documents.address)
					trainer.documents.identity = await Helper.getSignedUrlAWS(trainer.documents.identity)
					// trainer.profileImage = await Helper.getSignedUrlAWS(trainer.profileImage);
				}

				
					
				let categories = await this.categoriesService.findAllCategories({role: 'trainer'});

				if (!trainer) throw MSG.NO_DATA;
				res.render("admin/trainers/edit", {
					title: config.get("siteTitle"),
					siteUrl: config.get("siteUrl"),
					awsS3Url: config.get("awsS3.url"),
					loginUser: req.user,
					trainer,
					categories,
				});
			}
		} catch (error) {
			req.flash("error", error.message || MSG.SOMETHING_WRONG);
			res.redirect(`/admin/trainers/`);
		}
	};

	public userUpdate = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {
			if (req.method == "POST") {
				if(!Array.isArray(req.body.goals)) {
					req.body.goals = [req.body.goals];
				}
				const userData: CreateUserDto = req.body;
				const updateUserData: User = await this.userService.updateUser(
					req.params.id,
					userData
				);
				if (updateUserData) {
					req.flash("success", MSG.SUCCESS);
				} else {
					req.flash("error", MSG.ERROR);
				}
				return res.redirect(`/admin/users/edit/${req.params.id}`); 
			} else {
				
				let user:any = await this.userService.findUserById(req.params.id);
				let goals = await this.goalsService.findAllGoals({});
				// user.fileName="default.png";
				if(user.profileImage) {
					const fileName = user.profileImage.split("/").find((node: any) => {
						if(node.indexOf(".") > -1) {
							return node;
						}
					});
					user.fileExists = fileName;
					user.filePath = user.profileImage;
					user.profileImage = await Helper.getSignedUrlAWS(user.profileImage);
				}
			
				

					

				if (!user) throw MSG.NO_DATA;
				res.render("admin/users/edit", {
					title: config.get("siteTitle"),
					siteUrl: config.get("siteUrl"),
					awsS3Url: config.get("awsS3.url"),
					loginUser: req.user,
					user,
					goals,
					status: ContentData["status"],
				});
			}
		} catch (error) {
			req.flash("error", error.message || MSG.SOMETHING_WRONG);
			res.redirect("/admin/users");
		}
	};

	public categories = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {
			let role = req.route.path
					.split("/admin/")[1]
					.split("-categories")[0];
			let categories = await this.categoriesService.findAllCategories({
				role: role
			});

			res.render("admin/categories", {
				title: config.get("siteTitle"),
				siteUrl: config.get("siteUrl"),
				awsS3Url: config.get("awsS3.url"),
				loginUser: req.user,
				categories,
				categoryRole: role
			});
		} catch (error) {
			req.flash("error", error.message || MSG.SOMETHING_WRONG);
			res.redirect("/login");
		}
	};

	public categoryUpdate = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {
			if (req.method == "POST") {
				let categoryData: any = req.body;
				const updateCategoryData: Category =
					await this.categoriesService.updateCategoryById(
						req.params.id,
						categoryData
					);
				if (updateCategoryData) {
					req.flash("success", MSG.SUCCESS);
				} else {
					req.flash("error", MSG.ERROR);
				}
				return res.redirect(`/admin/category/edit/${req.params.id}`);
			} else {
				const path = req.route.path;
				if (path.indexOf("delete") > -1) {
					const counts = await this.userService.getUserCount('categories', req.params.id, null);
					if(counts) {
						req.flash("error", MSG.CATEGORY_IN_USE);
						return res.redirect(`/admin/trainer-categories/`);
						
					}
					const deletedCategoryData: any =
						await this.categoriesService.updateCategoryById(req.params.id, {
							isDeleted: true,
							adminId: req.user._id, 
						});

					return res.redirect(`/admin/${deletedCategoryData.role}-categories/`);
				}
				let category: any = await this.categoriesService.findCategoryById(
					req.params.id
				);
				

				if(category && category.bgImage) {
					const fileName = category.bgImage.split("/").find((node: any) => {
						if(node.indexOf(".") > -1) {
							return node;
						}
					});
					category.fileExists = fileName
					category.filePath = category.bgImage
					category.bgImage = await Helper.getSignedUrlAWS(category.bgImage);
				};
				if (!category) throw MSG.NO_DATA;
				res.render("admin/categories/edit", {
					title: config.get("siteTitle"),
					siteUrl: config.get("siteUrl"),
					awsS3Url: config.get("awsS3.url"),
					loginUser: req.user,
					category,
					status: ContentData["status"],
				});
			}
		} catch (error) {
			req.flash("error", error.message || MSG.SOMETHING_WRONG);
			res.redirect("/login");
		}
	};

	public addCategory = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {
			if (req.method == "POST") {
				req.body.role = req.body.category;
				req.body.editable = true
				const createCategoryData =
					await this.categoriesService.createCategory(req.body);
				if (createCategoryData) {
					req.flash("success", MSG.SUCCESS);
				} else {
					req.flash("error", MSG.ERROR);
				}
				return res.redirect(`/admin/${req.body.category}-categories`);
			} else {
				res.render("admin/categories/add", {
					title: config.get("siteTitle"),
					siteUrl: config.get("siteUrl"),
					awsS3Url: config.get("awsS3.url"),
					loginUser: req.user,
					role: req.query.role
				});
			}
		} catch (error) {
			req.flash("error", error.message || MSG.SOMETHING_WRONG);
			res.redirect("/login");
		}
	};

	public goals = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {
			let goals = await this.goalsService.findAllGoals({
				//role: req.route.path.split("/admin/")[1].split("-goals")[0],
			});


			res.render("admin/goals", {
				title: config.get("siteTitle"),
				siteUrl: config.get("siteUrl"),
				awsS3Url: config.get("awsS3.url"),
				loginUser: req.user,
				goals,
			});
		} catch (error) {
			req.flash("error", error.message || MSG.SOMETHING_WRONG);
			//	res.redirect("/login");
		}
	};

	public goalUpdate = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {
			if (req.method == "POST") {
				const goalData: any = req.body;
				const updateGoalData: Goal = await this.goalsService.updateGoal(
					req.params.id,
					goalData
				);
 
				if (updateGoalData) {
					req.flash("success", MSG.SUCCESS);
				} else {
					req.flash("error", MSG.ERROR);
				}
				return res.redirect(`/admin/goals/edit/${req.params.id}`);
			} else {
				const path = req.route.path;
				if (path.indexOf("delete") > -1) {
					// const counts = await this.userService.countUserByGoal(req.params.id);
					const counts = await this.userService.getUserCount("goals", req.params.id, null);
					if(counts) {
						req.flash("error", MSG.GOAL_IN_USE);
						return res.redirect(`/admin/user-goals/`);
					}
					const deletedGoalData: any =
						await this.goalsService.updateGoal(req.params.id, {
							isDeleted: true,
							adminId: req.user._id,
						});

					return res.redirect(`/admin/user-goals/`);
				}

				let goal = await this.goalsService.getGoalDetail(req.params.id);
				if (!goal) throw MSG.NO_DATA;
				res.render("admin/goals/edit", {
					title: config.get("siteTitle"),
					siteUrl: config.get("siteUrl"),
					awsS3Url: config.get("awsS3.url"),
					loginUser: req.user,
					goal,
					status: ContentData["status"],
				});
			}
		} catch (error) {
			req.flash("error", error.message || MSG.SOMETHING_WRONG);
			res.redirect("/login");
		}
	};

	public addGoal = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {
			if (req.method == "POST") {
				const createGoalData = await this.goalsService.createGoal(
					req.body
				);
				if (createGoalData) {
					req.flash("success", MSG.SUCCESS);
				} else {
					req.flash("error", MSG.ERROR);
				}
				return res.redirect(`/admin/user-goals`);
			} else {
				res.render("admin/goals/add", {
					title: config.get("siteTitle"),
					siteUrl: config.get("siteUrl"),
					awsS3Url: config.get("awsS3.url"),
					loginUser: req.user,
				});
			}
		} catch (error) {
			req.flash("error", error.message || MSG.SOMETHING_WRONG);
			res.redirect("/login");
		}
	};

	public queries = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {
			let queries = await this.queriesService.findAllQueries({}); 

			res.render("admin/queries", {
				title: config.get("siteTitle"),
				siteUrl: config.get("siteUrl"),
				awsS3Url: config.get("awsS3.url"),
				loginUser: req.user,
				queries,
			});
		} catch (error) {
			req.flash("error", error.message || MSG.SOMETHING_WRONG);
			res.redirect("/login");
		}
	};

	public viewQuery = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {
			let queryId: string = req.params._id;
			let query = await this.queriesService.findQueryById(queryId);
			// query.date = moment(query.createdAt).format("YYYY-MM-DD")

			res.render("admin/queries/view", {
				title: config.get("siteTitle"),
				siteUrl: config.get("siteUrl"),
				awsS3Url: config.get("awsS3.url"),
				loginUser: req.user,
				query,
			});
		} catch (error) {
			req.flash("error", error.message || MSG.SOMETHING_WRONG);
			res.redirect("/login");
		}
	};

	public updateQuery = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {
			const upatedQueryData: any = await this.queriesService.updateQuery(
				req.params._id,
				{ reply: req.query.reply, status: "close" }
			);
			return res.redirect(`/admin/queries`);
		} catch (error) {
			req.flash("error", error.message || MSG.SOMETHING_WRONG);
			res.redirect("/login");
		}
	};

	public courses = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {
			let courses = await this.coursesService.findAllCourses({});

			res.render("admin/courses", {
				title: config.get("siteTitle"),
				siteUrl: config.get("siteUrl"),
				awsS3Url: config.get("awsS3.url"),
				loginUser: req.user,
				courses,
			});
		} catch (error) {
			req.flash("error", error.message || MSG.SOMETHING_WRONG);
			res.redirect("/login");
		}
	};

	public addCourse = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {
			let course = null;

			if (req.method == "POST") {
				if (ObjectId.isValid(req.params._id)) {
					if(req.body.status=="true") {
						req.body.status=true;
					} else {
						req.body.status=false
					}
					course = await this.coursesService.updateCourse(
						req.params._id,
						req.body
					);
				} else {
					course = await this.coursesService.createCourse(req.body);
				}


				if (course) {
					req.flash("success", MSG.SUCCESS);
				} else {
					req.flash("error", MSG.ERROR);
				}
				return res.redirect(`/admin/courses`);
			} else {
				if (req.params._id)
					course = await this.coursesService.findCourseById(
						req.params._id
					);

				if(course && course.bgImage) {
					const fileName = course.bgImage.split("/").find((node: any) => {
						if(node.indexOf(".") > -1) {
							return node;
						}
					});
					course.fileExists = fileName
					course.filePath = course.bgImage
					course.bgImage = await Helper.getSignedUrlAWS(course.bgImage);
				};
				res.render("admin/courses/action", {
					title: config.get("siteTitle"),
					siteUrl: config.get("siteUrl"),
					awsS3Url: config.get("awsS3.url"),
					loginUser: req.user,
					course,
				});
			}
		} catch (error) {
			req.flash("error", error.message || MSG.SOMETHING_WRONG);
			res.redirect("/admin/courses");
		}
	};

	public deleteCourse = async(
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try{
			let course = await this.coursesService.updateCourse(
													req.params._id,
													{isDeleted: true}
												);
			return res.redirect(`/admin/courses`);
		}catch(error) {
			req.flash("error", error.message || MSG.SOMETHING_WRONG);
			res.redirect("/admin/courses");
		}
	}


	public pages = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {
			let pages = await this.pagesService.findAllPages({});

			res.render("admin/pages", {
				title: config.get("siteTitle"),
				siteUrl: config.get("siteUrl"),
				awsS3Url: config.get("awsS3.url"),
				loginUser: req.user,
				pages,
			});
		} catch (error) {
			req.flash("error", error.message || MSG.SOMETHING_WRONG);
			res.redirect("/login");
		}
	};

	public pageUpdate = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {
			if (req.method == "POST") {
				const pageData: any = req.body;
				const upatePageData: any = await this.pagesService.updatePage(
					req.params.id,
					pageData
				);
 
				if (upatePageData) {
					req.flash("success", MSG.SUCCESS);
				} else {
					req.flash("error", MSG.ERROR);
				}
				return res.redirect(`/admin/pages/edit/${req.params.id}`);
			} else {
				let page = await this.pagesService.getPageDetail(req.params.id);
				if (!page) throw MSG.NO_DATA;
				res.render("admin/pages/edit", {
					title: config.get("siteTitle"),
					siteUrl: config.get("siteUrl"),
					awsS3Url: config.get("awsS3.url"),
					loginUser: req.user,
					page,
					// status: ContentData["status"],
				});
			}
		} catch (error) {
			req.flash("error", error.message || MSG.SOMETHING_WRONG);
			res.redirect("/login");
		}
	};

	public emails = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {
			let emails = await this.emailsService.findAllEmails({});
			console.log('emails', emails)
			

			res.render("admin/emails", {
				title: config.get("siteTitle"),
				siteUrl: config.get("siteUrl"),
				awsS3Url: config.get("awsS3.url"),
				loginUser: req.user,
				emails,
			});
		} catch (error) {
			req.flash("error", error.message || MSG.SOMETHING_WRONG);
			res.redirect("/login");
		}
	};

	public addEmail = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) => {
		try {
			if (req.method == "POST") {
				const emailData: any = req.body;
				const data = await this.emailsService.addEmail(emailData);
				return res.redirect(`/admin/emails/`);
			} else {
				let email=null;
				// let email = await this.emailsService.getEmailDetail(req.params.id);
				// console.log("single emails dada", email)
				// if (!email) throw MSG.NO_DATA;
				
				res.render("admin/emails/edit", {
					title: config.get("siteTitle"),
					siteUrl: config.get("siteUrl"),
					awsS3Url: config.get("awsS3.url"),
					loginUser: req.user,
					email
				});
			}
		} catch (error) {
			req.flash("error", error.message || MSG.SOMETHING_WRONG);
			res.redirect("/login");
		}
	};


	public emailUpdate = async (
		req: RequestWithUser,
		res: Response,
		next: NextFunction 
	) => {
		try {
			if (req.method == "POST") {
				const emailData: any = req.body;
				console.log("this is emaildata", emailData)
				const upateEmailData: any = await this.emailsService.updateEmail(
					req.params.id,
					emailData
				);
 
				if (upateEmailData) {
					req.flash("success", MSG.SUCCESS);
				} else {
					req.flash("error", MSG.ERROR);
				}
				return res.redirect(`/admin/emails/edit/${req.params.id}`);
			} else {
				let email = await this.emailsService.getEmailDetail(req.params.id);
				console.log("single emails dada", email)
				if (!email) throw MSG.NO_DATA;
				
				res.render("admin/emails/edit", {
					title: config.get("siteTitle"),
					siteUrl: config.get("siteUrl"),
					awsS3Url: config.get("awsS3.url"),
					loginUser: req.user,
					email
				});
			}
		} catch (error) {
			req.flash("error", error.message || MSG.SOMETHING_WRONG);
			res.redirect("/login");
		}
	};

	// public updateCourse = async (
	// 	req: RequestWithUser,
	// 	res: Response,
	// 	next: NextFunction
	// ) => {
	// 	try {
	// 		if (req.method == "POST") {
	// 			const goalData: any = req.body;
	// 			const updateGoalData: Goal = await this.goalsService.updateGoal(
	// 				req.params.id,
	// 				goalData
	// 			);

	// 			if (updateGoalData) {
	// 				req.flash("success", MSG.SUCCESS);
	// 			} else {
	// 				req.flash("error", MSG.ERROR);
	// 			}
	// 			return res.redirect(`/admin/goals/edit/${req.params.id}`);
	// 		} else {
	// 			let course = await this.coursesService.findCourseById(
	// 				req.params._id
	// 			);

	// 			console.log("this is course", course);
	// 			if (!course) throw MSG.NO_DATA;
	// 			res.render("admin/courses/action", {
	// 				title: config.get("siteTitle"),
	// 				siteUrl: config.get("siteUrl"),
	// 				awsS3Url: config.get("awsS3.url"),
	// 				loginUser: req.user,
	// 				course,
	// 				status: ContentData["status"],
	// 			});
	// 		}
	// 	} catch (error) {
	// 		// console.log("error", error);
	// 		req.flash("error", error.message || MSG.SOMETHING_WRONG);
	// 		res.redirect("/login");
	// 	}
	// };
}

export default AdminController;
