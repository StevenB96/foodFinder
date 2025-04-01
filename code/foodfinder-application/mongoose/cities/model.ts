/**
 * Creates the CitysModel from the CitySchema
 * and the CityInterface.
 * The CitysModel provides the interfaces
 * to the database collection "citys".
 */
import mongoose, {
  model
} from "mongoose";

import {
  CitySchema,
  CityType
} from "mongoose/cities/schema";

export default mongoose.models.City ||
  model<CityType>("City", CitySchema);
