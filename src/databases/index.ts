import config from "config";
import { dbConfig } from "@interfaces/db.interface";

const { host, port, database, username, password }: dbConfig = config.get("dbConfig");

export const dbConnection = {
	url: `mongodb+srv://vaseem:Kn5XmCTQfh36E5DV@cluster0.09qzb0y.mongodb.net/tableThreads-dev`,
	options: {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true
	},
};
