import type { PathLike } from "fs";
import { readFile } from "fs/promises";

export async function readTestDataFile(filePath: PathLike): Promise<string> {
	return await readFile(`${import.meta.dirname}/data/${filePath}`, "utf8");
}

export async function readTestJSONFile(filePath: PathLike): Promise<unknown> {
	const fileContent = await readTestDataFile(filePath);
	return JSON.parse(fileContent);
}