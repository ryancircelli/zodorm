import {
  ZodArray,
  ZodDefault,
  ZodNullable,
  ZodObject,
  ZodOptional,
  ZodRawShape,
} from "zod";

type HasDefault<T> = T extends ZodDefault<any>
  ? true
  : T extends ZodOptional<any>
  ? true
  : T extends ZodNullable<any>
  ? HasDefault<T["_def"]["innerType"]>
  : T extends ZodArray<any>
  ? HasDefault<T["_def"]["type"]>
  : T extends ZodObject<any>
  ? {
      [K in keyof T["shape"]]: HasDefault<T["shape"][K]>;
    }[keyof T["shape"]]
  : false;

export type EnforceDefault<T> = HasDefault<T> extends true ? T : never;

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

export class Table<T extends ZodRawShape> {
  constructor(
    public zodObject: ZodObject<T>,
    public tableConfig: TableDefinition<T>
  ) {}
}

export class CustomType<T extends ZodRawShape> {
  constructor(public zodObject: ZodObject<T>) {}
}
