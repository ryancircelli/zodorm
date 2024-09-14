import { ZodObject, ZodRawShape, z } from "zod";

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
type ExtractPrimaryKey<
  T extends ZodRawShape,
  D extends TableDefinition<T>
> = D["key"]["primaryKey"];
type ExtractSortKey<
  T extends ZodRawShape,
  D extends TableDefinition<T>
> = D["key"]["sortKey"];
type KeyZodObject<
  T extends ZodRawShape,
  D extends TableDefinition<T>
> = ExtractSortKey<T, D> extends keyof T
  ? {
      [K in ExtractPrimaryKey<T, D>]: ZodObject<T>["shape"][K];
    } & {
      [K in ExtractSortKey<T, D>]: ZodObject<T>["shape"][K];
    }
  : {
      [K in ExtractPrimaryKey<T, D>]: ZodObject<T>["shape"][K];
    };
export type Table<T extends ZodRawShape, D extends TableDefinition<T>> = {
  _discriminator: "ZodormTable";
  zodObject: ZodObject<T>;
  tableConfig: D;
  keyZodObject: ZodObject<KeyZodObject<T, D>>;
};
export type CustomType<T extends z.ZodRawShape> = {
  _discriminator: "ZodormCustomType";
  zodObject: ZodObject<T>;
};

export const exportTable = <
  T extends ZodRawShape,
  D extends TableDefinition<T>
>({
  tableDefinition,
  tableConfig,
}: {
  tableDefinition: ZodObject<T>;
  tableConfig: D;
}): Table<T, D> => {
  const zodObjectStrict = tableDefinition.strict();
  const { primaryKey, sortKey } = tableConfig.key;

  const keyZodObject = z.object({
    [primaryKey]: zodObjectStrict.shape[primaryKey],
    ...(sortKey
      ? {
          [sortKey]: zodObjectStrict.shape[sortKey],
        }
      : {}),
  }) as ZodObject<KeyZodObject<T, D>>;

  const table: Table<T, D> = {
    _discriminator: "ZodormTable",
    zodObject: zodObjectStrict,
    tableConfig: tableConfig,
    keyZodObject: keyZodObject,
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
