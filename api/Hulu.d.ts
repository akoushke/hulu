import type { View, Collection } from "../utils/types";
/**
 * Retrieves a list of collections from the API.
 *
 * @returns {Promise<Array<Collection>>} A promise resolving to an array of collections.
 */
export declare const getCollections: () => Promise<Array<Collection>>;
/**
 * Fetches and transforms views from a given collection URL.
 *
 * @param {string} href - The collection URL.
 * @returns {Promise<View[]>} A promise resolving to an array of `View` objects.
 */
export declare const getViews: (href: string) => Promise<View[]>;
