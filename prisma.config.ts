import { load } from "dotenv-extended";
import { env, type PrismaConfig } from "prisma/config";

load({
	path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});

export default {
	datasource: {
		url: env("DATABASE_URL"),
	},
} satisfies PrismaConfig;
