import * as fs from "fs";

import type { CustomType, Table } from "../index.js";
import { ZodObject, z } from "zod";
import { createTypeAlias, printNode, zodToTs } from "zod-to-ts";

import { build } from "tsup";
import chalk from "chalk";
import { createGsiName } from "./createGsiName.js";
import { generateTerraform } from "./generateTerraform.js";
import path from "path";
import { pathToFileURL } from "url";

const printSchema = (zodObject: ZodObject<any>, name: string) => {
  const { node } = zodToTs(zodObject, name);
  const typeAlias = createTypeAlias(node, name);
  const nodeString = printNode(typeAlias);
  return "export " + nodeString;
};

const importTypeObjects = async () => {
  const definitionsPath = path.join(process.cwd(), "/zodorm/definitions.ts");
  const distDir = path.join(process.cwd(), "/zodorm/dist/");

  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
  await build({
    entry: { definitions: definitionsPath },
    outDir: distDir,
    format: ["esm"],
    tsconfig: path.join(process.cwd(), "/tsconfig.json"),
    dts: true,
    external: ["esbuild"],
    splitting: false,
    clean: true,
    silent: true,
  });

  const compiledDefinitionsPath = path.join(distDir, "definitions.js");
  const fileUrl = pathToFileURL(compiledDefinitionsPath).href;
  return import(fileUrl);
};

function instanceOfTable(object: any): object is Table<any> {
  return object._discriminator === "ZodormTable";
}
function instanceOfCustomType(object: any): object is CustomType<any> {
  return object._discriminator === "ZodormCustomType";
}

export const generate = async () => {
  const executionPath = process.cwd();
  const typeObjects = await importTypeObjects();

  let tableTypes = "";
  let zodTypes =
    "import { convertToDB } from '@ryancircelli/zodorm/generator/internal';\n";
  const tables: {
    [name: string]: Table<any>;
  } = {};
  for (const [name, _exportedObject] of Object.entries(typeObjects)) {
    let exportedObject: Table<any> | CustomType<any>;
    if (instanceOfTable(_exportedObject)) exportedObject = _exportedObject;
    else if (instanceOfCustomType(_exportedObject))
      exportedObject = _exportedObject;
    else {
      console.log(_exportedObject, typeof _exportedObject);
      throw new Error("Expected Table or CustomType");
    }
    zodTypes += `import {${name} as _${name}} from './definitions';\n`;
    zodTypes += `export const ${name}Zod = _${name}.zodObject;\n`;
    zodTypes += `export type ${name} = typeof ${name}Zod._type;\n`;
    zodTypes += `export const ${name}DBZod = convertToDB(_${name}.zodObject)[1];\n`;
    zodTypes += `export type ${name}DB = typeof ${name}DBZod._type;\n`;

    if (instanceOfTable(exportedObject)) {
      tables[name] = exportedObject;
      if ((exportedObject.tableConfig?.gsi?.length ?? 0) > 0) {
        let gsiNames = "export enum " + name + "Gsi {\n";
        exportedObject.tableConfig?.gsi?.forEach((gsi: any) => {
          const gsiName = createGsiName(
            name,
            gsi.primaryKey as string,
            gsi.sortKey as string
          );
          gsiNames += `  ${gsiName} = '${gsiName}',\n`;

          tableTypes +=
            printSchema(
              z.object({
                [gsi.primaryKey]:
                  exportedObject.zodObject.shape[gsi.primaryKey],
                [gsi.sortKey]: exportedObject.zodObject.shape[gsi.sortKey],
              }),
              gsiName + "Key"
            ) + "\n";
        });
        gsiNames += "}\n";
        tableTypes += gsiNames;
      }
      tableTypes +=
        printSchema(
          z.object({
            [exportedObject.tableConfig.key.primaryKey]:
              exportedObject.zodObject.shape[
                exportedObject.tableConfig.key.primaryKey
              ],
            ...(exportedObject.tableConfig.key.sortKey && {
              [exportedObject.tableConfig.key.sortKey]:
                exportedObject.zodObject.shape[
                  exportedObject.tableConfig.key.sortKey
                ],
            }),
          }),
          name + "Key"
        ) + "\n";
    }
  }
  const typeObjectsFile = fs.readFileSync(
    executionPath + "/zodorm/definitions.ts",
    "utf8"
  );
  fs.mkdirSync(executionPath + "/zodorm/dist/", { recursive: true });
  fs.writeFileSync(
    executionPath + "/zodorm/dist/definitions.ts",
    "/* Zodorm - This is an auto-generated file. Do not modify this file manually. */\n" +
      typeObjectsFile
  );
  fs.writeFileSync(
    executionPath + "/zodorm/dist/zodTypes.ts",
    "/* Zodorm - This is an auto-generated file. Do not modify this file manually. */\n" +
      zodTypes
  );
  fs.writeFileSync(
    executionPath + "/zodorm/dist/tableTypes.ts",
    "/* Zodorm - This is an auto-generated file. Do not modify this file manually. */\n" +
      tableTypes
  );
  fs.writeFileSync(
    executionPath + "/zodorm/exports.ts",
    "/* Zodorm - This is an auto-generated file. Do not modify this file manually. */\n" +
      "export * from './dist/zodTypes';\n" +
      "export * from './dist/tableTypes';"
  );

  // TODO Generate Terraform Schema
  const terraformSchema = generateTerraform(tables);
  let terraformChanged = false;
  if (fs.existsSync(executionPath + "/zodorm/terraformSchema.lock.json")) {
    const oldTerraformSchema = fs.readFileSync(
      executionPath + "/zodorm/terraformSchema.lock.json",
      "utf8"
    );
    if (terraformSchema !== oldTerraformSchema) terraformChanged = true;
  } else {
    terraformChanged = true;
  }
  if (terraformChanged) {
    console.log(
      chalk.yellow(
        "Terraform schema has changed. We recommend running Terraform to update your deployment."
      )
    );
  }
  fs.writeFileSync(
    executionPath + "/zodorm/terraformSchema.lock.json",
    terraformSchema
  );
  fs.writeFileSync(
    executionPath + "/zodorm/terraformSchema.json",
    terraformSchema
  );
};
