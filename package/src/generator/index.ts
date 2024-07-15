import {
  CustomType,
  EnforceDefault,
  Table,
  TableDefinition,
} from "./internal/definition";
import { ZodObject, ZodRawShape, z } from "zod";

export const exportTable = <T extends ZodRawShape>({
  tableDefinition,
  tableConfig,
}: {
  tableDefinition: EnforceDefault<ZodObject<T>>;
  tableConfig: TableDefinition<T>;
}): Table<T> => {
  const zodObjectStrict = tableDefinition.strict();
  const table = new Table(zodObjectStrict, tableConfig);
  return table;
};

export const exportType: <T extends z.ZodRawShape>({
  zodObject,
}: {
  zodObject: EnforceDefault<ZodObject<T>>;
}) => CustomType<T> = ({ zodObject }) => {
  const zodObjectStrict = zodObject.strict();
  const customType = new CustomType(zodObjectStrict);
  return customType;
};
