/**
 * Creates the city services.
 * They perform the CRUD operations on the mongoDB
 * via the Mongoose CityModel.
 * They are the internal APIs and are also the actual
 * entry points for the external GraphQL resolvers.
 */

import Citys from "mongoose/cities/model";
import {
    FilterCityType,
} from "mongoose/cities/custom";
import { CityType } from "mongoose/cities/schema";

/**
 * actual filter function
 */
async function findCitys(
    filter: FilterCityType | {}
): Promise<CityType[] | []> {
    try {
        let result: Array<CityType | undefined> = await Citys.find(
            filter
        );
        return result as CityType[];
    } catch (err) {
        console.error(err);
    }
    return [];
}

/**
 * API / facade to Find all "city"-documents from"citys"-collection via the "citys"-model
 */
export async function findCitysById(
    city_ids: string[]
): Promise<CityType[] | []> {
    let filter = { _id: city_ids };
    return await findCitys(filter);
}

/**
 *  * API / facade Find all "city"-documents from"citys"-collection via the "citys"-model
 */
export async function findAllCitys(): Promise<CityType[] | []> {
    let filter = {};
    return await findCitys(filter);
}