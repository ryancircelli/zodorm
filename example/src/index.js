import { InheritsUserGsi, UserZod, } from "../zodorm/exports";
const user = {
    email: "",
    name: "",
    userID: "",
};
const inheritsUser = {
    email: "",
    name: "",
    userID: "",
    phoneNumber: "",
};
const usesUser = {
    nestedUser: {
        email: "",
        name: "",
        userID: "",
    },
    phoneNumber: "",
};
const inheritsUserKey = {
    name: "",
    userID: "",
};
const inheritsUserGSI1 = {
    name: "",
    email: "",
};
const userGSI1Name = InheritsUserGsi.InheritsUserByNameEmail;
const notUser = {
    wow: "cool!",
};
const parsedUser = UserZod.parse(user);
