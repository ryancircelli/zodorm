import { ZodBoolean, ZodNumber, ZodObject, ZodString, z } from "zod";

export const convertToDB = (
  zodObject: ZodObject<any>,
): [boolean, ZodObject<any>] => {
  const full = {} as any;
  const keys = Object.keys(zodObject.shape);
  let changed = false;
  for (const key of keys) {
    if (
      !(
        zodObject.shape[key] instanceof ZodString ||
        zodObject.shape[key] instanceof ZodBoolean ||
        zodObject.shape[key] instanceof ZodNumber
      )
    ) {
      full[key] = z.string();
      changed = true;
    } else {
      full[key] = zodObject.shape[key];
    }
  }
  return [changed, z.object(full)];
};
