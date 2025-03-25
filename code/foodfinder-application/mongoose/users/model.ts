/**
 * Creates the UsersModel from the UserSchema
 * and the UserInterface.
 * The UsersModel provides the interfaces
 * to the database collection "users".
 */
import mongoose,
{
  model
} from "mongoose";

import {
  UserSchema,
  UserType
} from "mongoose/users/schema";

export default mongoose.models.User ||
  model<UserType>("User", UserSchema);
