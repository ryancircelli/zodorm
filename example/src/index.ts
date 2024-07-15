import {
  InheritsUserGsi,
  UserZod,
  type InheritsUser,
  type InheritsUserByNameEmailKey,
  type InheritsUserKey,
  type User,
  type UsesUser,
} from "../zodorm/exports";

const user: User = {
  email: "",
  name: "",
  userID: "",
};

const inheritsUser: InheritsUser = {
  email: "",
  name: "",
  userID: "",
  phoneNumber: "",
};

const usesUser: UsesUser = {
  nestedUser: {
    email: "",
    name: "",
    userID: "",
  },
  phoneNumber: "",
};

const inheritsUserKey: InheritsUserKey = {
  name: "",
  userID: "",
};

const inheritsUserGSI1: InheritsUserByNameEmailKey = {
  name: "",
  email: "",
};

const userGSI1Name = InheritsUserGsi.InheritsUserByNameEmail;

const notUser = {
  wow: "cool!",
};

const parsedUser = UserZod.parse(user);
