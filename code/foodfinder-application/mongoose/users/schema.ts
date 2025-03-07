/**
 * Creates the LocationSchema for the LocationsModel.
 * It defines the properties of a location document
 * from the locations collection in the foodfinder database
 */
import { Schema, InferSchemaType } from "mongoose";

// create the Schema corresponding to the document interface.
export const UserSchema: Schema = new Schema<UserType>({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
});

export declare type UserType = InferSchemaType<typeof UserSchema>;
