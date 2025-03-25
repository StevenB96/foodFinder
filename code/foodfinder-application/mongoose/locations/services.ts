/**
 * Creates the location services.
 * They perform the CRUD operations on the mongoDB
 * via the Mongoose LocationModel.
 * They are the internal APIs and are also the actual
 * entry points for the external GraphQL resolvers.
 */

import Locations from "mongoose/locations/model";
import {
    FilterLocationType,
} from "mongoose/locations/custom";
import { LocationType } from "mongoose/locations/schema";

/**
 * actual filter function
 */
async function findLocations(
    filter: FilterLocationType | {}
): Promise<LocationType[] | []> {
    try {
        let result: Array<LocationType | undefined> = await Locations.find(
            filter
        );
        return result as LocationType[];
    } catch (err) {
        console.error(err);
    }
    return [];
}

/**
 * API / facade to Find all "location"-documents from"locations"-collection via the "locations"-model
 */
export async function findLocationsById(
    location_ids: string[]
): Promise<LocationType[] | []> {
    let filter = { _id: location_ids };
    return await findLocations(filter);
}

/**
 *  * API / facade Find all "location"-documents from"locations"-collection via the "locations"-model
 */
export async function findAllLocations(): Promise<LocationType[] | []> {
    let filter = {};
    return await findLocations(filter);
}