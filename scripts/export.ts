import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { argv, env } from "node:process";
import { HeadObjectCommand, S3 } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { Prisma, PrismaClient } from "@db/client.js";
import parquet from "@dsnp/parquetjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { DiscordSnowflake } from "@sapphire/snowflake";
import { load } from "dotenv-extended";

load({
	path: env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});

const dryRun = argv.includes("--dry");
const shouldReupload = argv.includes("--reupload");
const skipUpload = argv.includes("--skipupload");

const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
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

	if (!dryRun) {
		await prisma.snowflakeMigrations.update({
			where: { id: migration.id },
			data: { endedAt: new Date(), success: true },
		});
	}
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
		// Generate schema by analyzing ALL records, not just the first one
		const schema = generateParquetSchemaFromAllRecords(data);

		const writer = await parquet.ParquetWriter.openFile(schema, filepath);

		for (let i = 0; i < data.length; i++) {
			const record = data[i];
			try {
				const parquetRecord = convertToParquetRecord(record, schema);
				await writer.appendRow(parquetRecord);
			} catch (recordError) {
				console.error(`Error processing record ${i} for table ${tableName}:`, recordError);
				throw recordError;
			}
		}

		await writer.close();

		console.log(`Successfully exported ${tableName} to ${filepath}`);

		// Upload to S3
		if (!skipUpload) {
			await uploadToS3(tableName, filename, filepath);
		}

		return filepath;
	} catch (error) {
		console.error(`Error exporting ${tableName} to Parquet:`, error);
		throw error;
	}
}

async function uploadToS3(tablename: string, filename: string, filepath: string) {
	const fileContent = readFileSync(filepath);
	const bucket = env.EXPORTER_BUCKET_NAME!;
	const key = `${env.EXPORTER_FILE_PATH!}/${tablename}/${filename}`;

	const result = await new Upload({
		client: s3,
		params: {
			Bucket: bucket,
			Key: key,
			Body: fileContent,
			ContentType: "application/octet-stream",
		},
	}).done();

	return result.Location;
}

function generateParquetSchemaFromAllRecords(data: any[]) {
	const allFields: Record<string, Set<string>> = {};

	// Analyze all records to find all possible fields and their types
	for (const record of data) {
		for (const [key, value] of Object.entries(record)) {
			if (!allFields[key]) {
				allFields[key] = new Set();
			}

			if (key === "editedAt" && value != null) {
				console.log(key, value);
			}

			let type: string;
			if (typeof value === "string") {
				type = "UTF8";
			} else if (typeof value === "number") {
				type = Number.isInteger(value) ? "INT64" : "DOUBLE";
			} else if (typeof value === "boolean") {
				type = "BOOLEAN";
			} else if (value instanceof Date) {
				type = "UTF8";
			} else if (value === null || value === undefined) {
				type = "UTF8"; // Default to UTF8 for null values
			} else if (typeof value === "object") {
				type = "UTF8"; // Objects will be stringified
			} else {
				type = "UTF8"; // Default fallback
			}

			allFields[key].add(type);
		}
	}

	const schemaFields: Record<string, any> = {};

	// Build schema with consistent types for each field
	for (const [key, types] of Object.entries(allFields)) {
		const typeArray = Array.from(types);

		if (typeArray.length > 1) {
			schemaFields[key] = { type: "UTF8", optional: true };
		} else {
			schemaFields[key] = { type: typeArray[0], optional: true };
		}
	}

	return new parquet.ParquetSchema(schemaFields);
}

function convertToParquetRecord(record: any, schema: any) {
	const parquetRecord: Record<string, any> = {};

	// Ensure we handle ALL schema fields
	for (const [key, schemaField] of Object.entries(schema.fields)) {
		const fieldType = (schemaField as any).type;

		if (!(key in record)) {
			// Field is completely missing from record - use defaults
			if (fieldType === "UTF8") {
				parquetRecord[key] = "00000000000000000";
			} else if (fieldType === "INT64") {
				parquetRecord[key] = 0;
			} else if (fieldType === "DOUBLE") {
				parquetRecord[key] = 0.0;
			} else if (fieldType === "BOOLEAN") {
				parquetRecord[key] = false;
			} else {
				parquetRecord[key] = null;
			}
		} else {
			// Field exists in record - use actual value (including null/undefined)
			const value = record[key];
			if (typeof value === "object" && value !== null) {
				parquetRecord[key] = JSON.stringify(value);
			} else if (value instanceof Date) {
				parquetRecord[key] = value.getUTCSeconds().toString();
			} else {
				parquetRecord[key] = value; // This preserves null/undefined values
			}
		}
	}

	return parquetRecord;
}

const s3 = new S3({
	credentials: {
		accessKeyId: env.EXPORTER_ACCESS_KEY!,
		secretAccessKey: env.EXPORTER_SECRET_KEY!,
	},
	region: "us-east-1",
});

async function fileExistsInS3(bucket: string, key: string): Promise<boolean> {
	try {
		await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
		return true;
	} catch {
		return false;
	}
}

async function reuploadAllFiles() {
	const exportDir = "./.exports";
	const files = readdirSync(exportDir).filter((file) => file.endsWith(".parquet"));
	const bucket = env.EXPORTER_BUCKET_NAME!;
	const filePath = env.EXPORTER_FILE_PATH!;

	console.log(`Processing ${files.length} files`);

	let processed = 0;
	let uploaded = 0;
	let skipped = 0;

	for (const filename of files) {
		processed++;

		if (processed % 10 === 0 || processed === files.length) {
			console.log(`Progress: ${processed}/${files.length} processed`);
		}

		const tablename = filename.replace(/_\d{10}\.parquet$/, "");
		const key = `${filePath}/${tablename}/${filename}`;

		if (await fileExistsInS3(bucket, key)) {
			skipped++;
			continue;
		}

		const filepath = join(exportDir, filename);
		await uploadToS3(tablename, filename, filepath);
		uploaded++;
	}

	console.log(`Completed: ${uploaded} uploaded, ${skipped} skipped`);
}

if (shouldReupload) {
	await reuploadAllFiles();
} else {
	await exportData();
}
