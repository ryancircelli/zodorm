import type { Table } from "../index.js";
import { createGsiName } from "./createGsiName.js";

const getAWSType = (type: any): string => {
  switch (type.constructor.name) {
    case "ZodString":
      return "S";
    case "ZodNumber":
      return "N";
    case "ZodBoolean":
      return "B";
    default:
      return "S";
  }
};

export const generateTerraform = (tables: {
  [name: string]: Table<any, any>;
}) => {
  const terraformTypes: {
    [key: string]: any;
  } = {};
  for (const [name, table] of Object.entries(tables)) {
    terraformTypes[name] = {
      hash_key: {
        name: table.tableConfig.key.primaryKey,
        type: getAWSType(
          table.zodObject.shape[table.tableConfig.key.primaryKey]
        ),
      },
      range_key: table.tableConfig.key.sortKey
        ? {
            name: table.tableConfig.key.sortKey,
            type: getAWSType(
              table.zodObject.shape[table.tableConfig.key.sortKey]
            ),
          }
        : null,
      gsi:
        table.tableConfig.gsi?.map((gsi: any) => ({
          name: createGsiName(
            name,
            gsi.primaryKey as string,
            gsi.sortKey as string
          ),
          hash_key: {
            name: gsi.primaryKey,
            type: getAWSType(table.zodObject.shape[gsi.primaryKey]),
          },
          range_key: {
            name: gsi.sortKey,
            type: getAWSType(table.zodObject.shape[gsi.sortKey]),
          },
        })) ?? [],
      stream: null,
    };
  }
  return JSON.stringify(terraformTypes);
};
