import mongoose, {
    model,
    Schema,
    InferSchemaType
} from "mongoose";

export const LocationSchema: Schema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        auto: true
    },
    name: {
        type: String,
        unique: true,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
});

export type LocationType = InferSchemaType<typeof LocationSchema>;
const Location = mongoose.models.Location || 
model<LocationType>("Location", LocationSchema);

export default Location;