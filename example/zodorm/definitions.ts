import { exportTable, exportType } from "zodorm/generator";

import { z } from "zod";

export const User = exportTable({
  tableDefinition: z.object({
    userID: z.string().default(""),
    name: z.string().default(""),
    email: z.string().default(""),
  }),
  tableConfig: {
    key: {
      primaryKey: "userID",
      sortKey: "name",
    },
    gsi: [
      {
        primaryKey: "name",
        sortKey: "email",
      },
    ],
  },
});

export const InheritsUser = exportTable({
  tableDefinition: z.object({
    ...User.zodObject.shape,
    phoneNumber: z.string().default(""),
  }),
  tableConfig: {
    key: {
      primaryKey: "userID",
      sortKey: "name",
    },
    gsi: [
      {
        primaryKey: "name",
        sortKey: "email",
      },
    ],
  },
});

export const UsesUser = exportTable({
  tableDefinition: z.object({
    nestedUser: User.zodObject,
    phoneNumber: z.string().default(""),
  }),
  tableConfig: {
    key: {
      primaryKey: "phoneNumber",
    },
  },
});
