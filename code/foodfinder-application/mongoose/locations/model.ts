/**
 * Creates the LocationsModel from the LocationSchema
 * and the LocationInterface.
 * The LocationsModel provides the interfaces
 * to the database collection "locations".
 */
import mongoose, {
  model
} from "mongoose";

import {
  LocationSchema,
  LocationType
} from "mongoose/locations/schema";

export default mongoose.models.Location ||
  model<LocationType>("Location", LocationSchema);
