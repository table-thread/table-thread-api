import config from "config";
import { dbConfig } from "@interfaces/db.interface";

const { host, port, database, username, password }: dbConfig = config.get("dbConfig");

export const dbConnection = {
	url: `mongodb://localhost:27017/test`,
	options: {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true
	},
};
