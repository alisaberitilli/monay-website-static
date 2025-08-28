import { mergeRouters, router } from "#server/trpc";

import { gpsLogin, gpsRegisterUser } from "../../services/gps/auth";
import { createUserRouter } from "./create-user";
import {
  assignUserToAcc,
  deleteUser,
  inviteUser,
  signinUser,
  signoutUser,
  updateAssignUserToAcc,
} from "./mutations";
import { checkExistingOrganization, checkValidEmail, getUser } from "./queries";
import { onUserNotify, onUserUpdate } from "./subscriptions";
import { updateUserRouter } from "./update-user";

const userRouter = mergeRouters(
  router({
    get: getUser,
    checkValidEmail,
    signIn: signinUser,
    signOut: signoutUser,
    invite: inviteUser,
    checkOrgExists: checkExistingOrganization,
    // deactivateUser: deactivateUser, //FIXME:I had implemented this but not able to find
    //GPS reg/login etc...
    gpsLogin: gpsLogin,
    registerToGps: gpsRegisterUser,
    onUpdate: onUserUpdate,
    userAssignToAcc: assignUserToAcc,
    updateAssignUserToAcc: updateAssignUserToAcc,
    onUserNotify: onUserNotify,
  }),
  createUserRouter,
  updateUserRouter
);

export default userRouter;
