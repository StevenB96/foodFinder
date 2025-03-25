import mongoose,
{
    model,
    Schema,
    InferSchemaType
} from "mongoose";

export const UserSchema: Schema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        auto: true
    },
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    accessToken: {
        type: String,
        default: null
    },
    refreshToken: {
        type: String,
        default: null
    },
});

export type UserType = InferSchemaType<typeof UserSchema>;
const User = mongoose.models.User ||
    model<UserType>("User", UserSchema);
    
export default User;