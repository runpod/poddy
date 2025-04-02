import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { env } from "node:process";
import { S3 } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import parquet from "@dsnp/parquetjs";
import { Prisma, PrismaClient } from "@prisma/client";
import { DiscordSnowflake } from "@sapphire/snowflake";
import { load } from "dotenv-extended";

load({
	path: env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});

const prisma = new PrismaClient({
	errorFormat: "pretty",
	log: [
		{ level: "warn", emit: "stdout" },
		{ level: "error", emit: "stdout" },
		{ level: "query", emit: "event" },
	],
}).$extends({
	model: {
		$allModels: {
			async getTableName<T>(this: T) {
				const context = Prisma.getExtensionContext(this);
				return (prisma as any)._runtimeDataModel.models[context.$name!].dbName;
			},
		},
	},
});

const TARGET_TABLES = [
	{ model: prisma.auditLog, sortBy: "id" },
	{ model: prisma.ban, sortBy: "createdAt" },
	{ model: prisma.channel, sortBy: "id" },
	{ model: prisma.invite, sortBy: "createdAt" },
	{ model: prisma.memberEvent, sortBy: "timestamp" },
	{ model: prisma.message, sortBy: "id" },
	{ model: prisma.role, sortBy: "id" },
	{ model: prisma.scheduledEvent, sortBy: "id" },
	{ model: prisma.threadEvent, sortBy: "threadId" },
];

async function exportData() {
	const currentTime = new Date();

	const currentSnowflake = DiscordSnowflake.generate({ timestamp: currentTime });

	const lastMigration = await prisma.snowflakeMigrations.findFirst({
		where: { success: true },
		orderBy: { endedAt: "desc" },
	});

	const lastSnowflake = lastMigration?.endedAt
		? DiscordSnowflake.generate({ timestamp: lastMigration.endedAt })
		: "0000000000000000";

	const lastTimestamp = lastMigration?.endedAt || new Date("2015-01-01T00:00:00.000Z");

	console.log(`Exporting data from ${lastTimestamp.toISOString()} to ${currentTime.toISOString()}...`);
	console.log(`Last snowflake: ${lastSnowflake.toString()}, Current snowflake: ${currentSnowflake.toString()}`);

	const migration = await prisma.snowflakeMigrations.create({
		data: {
			startedAt: currentTime,
			success: false,
		},
	});

	for (const table of TARGET_TABLES) {
		const tableName = await table.model.getTableName();
		let data = {};

		data = await prisma.$transaction(async (tx) => {
			if (table.sortBy.toLowerCase().endsWith("id")) {
				return await tx.$queryRawUnsafe(
					`SELECT * FROM "${tableName}" WHERE "${table.sortBy}" > $1::text AND "${table.sortBy}" <= $2::text`,
					lastSnowflake.toString(),
					currentSnowflake.toString(),
				);
			}
			if (table.sortBy === "createdAt" || table.sortBy === "timestamp") {
				return await tx.$queryRawUnsafe(
					`SELECT * FROM "${tableName}" WHERE "${table.sortBy}" > $1::timestamp AND "${table.sortBy}" <= $2::timestamp`,
					lastTimestamp,
					currentTime,
				);
			}
			return await tx.$queryRawUnsafe(
				`SELECT * FROM "${tableName}" WHERE "${table.sortBy}" > $1 AND "${table.sortBy}" <= $2`,
				lastTimestamp,
				currentTime,
			);
		});

		await exportToParquet(data, tableName);
	}

	await prisma.snowflakeMigrations.update({
		where: { id: migration.id },
		data: { endedAt: new Date(), success: true },
	});
}

async function exportToParquet(data: any, tableName: string) {
	if (!data || data.length === 0) {
		console.log(`No data to export for table ${tableName}`);
		return "";
	}

	console.log(`Exporting ${data.length} records from ${tableName} to Parquet`);

	const exportDir = "./.exports";
	if (!existsSync(exportDir)) {
		mkdirSync(exportDir, { recursive: true });
	}

	const timestamp = Math.floor(Date.now() / 1000);
	const filename = `${tableName}_${timestamp}.parquet`;
	const filepath = join(exportDir, filename);

	try {
		const sampleRecord = data[0];
		const schema = generateParquetSchema(sampleRecord);

		const writer = await parquet.ParquetWriter.openFile(schema, filepath);

		for (const record of data) {
			await writer.appendRow(convertToParquetRecord(record, schema));
		}

		await writer.close();

		console.log(`Successfully exported ${tableName} to ${filepath}`);

		// Upload to S3
		await uploadToS3(tableName, filename, filepath);

		return filepath;
	} catch (error) {
		console.error(`Error exporting ${tableName} to Parquet:`, error);
		throw error;
	}
}

async function uploadToS3(tablename: string, filename: string, filepath: string) {
	const s3 = new S3({
		credentials: {
			accessKeyId: env.EXPORTER_ACCESS_KEY!,
			secretAccessKey: env.EXPORTER_SECRET_KEY!,
		},
		region: "us-east-1",
	});
	const fileContent = readFileSync(filepath);

	const bucket = env.EXPORTER_BUCKET_NAME!;
	const key = `${env.EXPORTER_FILE_PATH!}/${tablename}/${filename}`;

	const params = {
		Bucket: bucket,
		Key: key,
		Body: fileContent,
		ContentType: "application/octet-stream",
	};

	console.log(`Uploading ${filename} to s3://${bucket}/${key}...`);
	const result = await new Upload({
		client: s3,
		params,
	}).done();
	console.log(`Successfully uploaded ${filename} to ${result.Location}`);

	return result.Location;
}

function generateParquetSchema(record: any) {
	const schemaFields: Record<string, any> = {};

	for (const [key, value] of Object.entries(record)) {
		if (typeof value === "string") {
			schemaFields[key] = { type: "UTF8" };
		} else if (typeof value === "number") {
			if (Number.isInteger(value)) {
				schemaFields[key] = { type: "INT64" };
			} else {
				schemaFields[key] = { type: "DOUBLE" };
			}
		} else if (typeof value === "boolean") {
			schemaFields[key] = { type: "BOOLEAN" };
		} else if (value instanceof Date) {
			schemaFields[key] = { type: "TIMESTAMP_MILLIS" };
		} else if (value === null || value === undefined) {
			schemaFields[key] = { type: "UTF8" };
		} else if (typeof value === "object") {
			schemaFields[key] = { type: "UTF8" };
		}
	}

	return new parquet.ParquetSchema(schemaFields);
}

function convertToParquetRecord(record: any, schema: any) {
	const parquetRecord: Record<string, any> = {};

	for (const [key, value] of Object.entries(record)) {
		if (schema.fields[key]) {
			if (value === null || value === undefined) {
				parquetRecord[key] = null;
			} else if (typeof value === "object" && !(value instanceof Date)) {
				parquetRecord[key] = JSON.stringify(value);
			} else {
				parquetRecord[key] = value;
			}
		}
	}

	return parquetRecord;
}

await exportData();
