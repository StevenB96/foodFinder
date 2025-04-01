import mongoose, {
    model,
    Schema,
    InferSchemaType
} from "mongoose";

export const CitySchema: Schema = new Schema({
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

export type CityType = InferSchemaType<typeof CitySchema>;
const City = mongoose.models.City || 
model<CityType>("City", CitySchema);

export default City;