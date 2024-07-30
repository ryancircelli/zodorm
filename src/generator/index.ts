import { ZodObject, z } from "zod";

export type TableDefinition<T> = {
  key: {
    primaryKey: keyof T;
    sortKey?: keyof T;
  };
  gsi?: {
    primaryKey: keyof T;
    sortKey: keyof T;
  }[];
};
export type Table<T extends z.ZodRawShape> = {
  _discriminator: "ZodormTable";
  zodObject: ZodObject<T>;
  tableConfig: TableDefinition<T>;
};
export type CustomType<T extends z.ZodRawShape> = {
  _discriminator: "ZodormCustomType";
  zodObject: ZodObject<T>;
};

export const exportTable = <T extends z.ZodRawShape>({
  tableDefinition,
  tableConfig,
}: {
  tableDefinition: ZodObject<T>;
  tableConfig: TableDefinition<T>;
}): Table<T> => {
  const zodObjectStrict = tableDefinition.strict();
  const table: Table<T> = {
    _discriminator: "ZodormTable",
    zodObject: zodObjectStrict,
    tableConfig: tableConfig,
  };
  return table;
};

export const exportType = <T extends z.ZodRawShape>({
  zodObject,
}: {
  zodObject: ZodObject<T>;
}): CustomType<T> => {
  const zodObjectStrict = zodObject.strict();
  const customType: CustomType<T> = {
    _discriminator: "ZodormCustomType",
    zodObject: zodObjectStrict,
  };
  return customType;
};
