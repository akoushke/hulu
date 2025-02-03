import type {View, Branding, Collection} from "../utils/types";
import {API_HUB_URL, PROXY} from "../utils/constants";
import logo from "../assets/hulu-logo.jpeg";

/**
 * Fetches collections from the API.
 *
 * @returns {Promise<any[]>} A promise resolving to the collections data.
 * @throws {Error} If the API request fails.
 */
const fetchCollections = async (): Promise<any[]> => {
  try {
    const response = await fetch(API_HUB_URL);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch collections: ${response.status} ${response.statusText}`
      );
    }
    const {components} = await response.json();
    return components;
  } catch (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
};

/**
 * Validates an image URL by checking if it loads successfully.
 *
 * @param {string} url - The image URL to validate.
 * @returns {Promise<string | null>} The image URL if valid, otherwise null.
 */
const validateImage = async (url: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

/**
 * Constructs an image URL with specified dimensions and format.
 *
 * @param {string} url - The base image URL.
 * @param {string} [width="800"] - The image width.
 * @param {string} [height="600"] - The image height.
 * @param {string} [format="jpeg"] - The image format.
 * @returns {string} The constructed image URL.
 */
const constructImageUrl = (
  url: string,
  width = "800",
  height = "600",
  format = "jpeg"
): string => {
  return `${url}&size=${width}x${height}&format=${format}`;
};

/**
 * Transforms raw API data into a `View` object.
 *
 * @param {any} data - The raw data from the API.
 * @returns {Promise<View | undefined>} A `View` object if successful, otherwise undefined.
 */
const transformDataToView = async (data: any): Promise<View | undefined> => {
  try {
    const horizontalImage = await validateImage(
      constructImageUrl(data.visuals.artwork.horizontal_tile.image.path)
    );

    const verticalImage = await validateImage(
      constructImageUrl(
        data.visuals.artwork.vertical_tile.image.path,
        "600",
        "800",
        "jpeg"
      )
    );

    if (!horizontalImage || !verticalImage) return undefined;

    const branding: Branding | null = data.visuals.primary_branding
      ? {
          id: data.visuals.primary_branding.id,
          name: data.visuals.primary_branding.name,
          logo: logo,
        }
      : null;

    return {
      id: data.id,
      actionText: data.visuals.action_text,
      description: data.visuals.body,
      title: data.visuals.headline,
      horizontalImage,
      verticalImage,
      branding,
      rating: data.entity_metadata.rating.code,
      genre: data.entity_metadata.genre_names,
      type: data.entity_metadata.entity_type,
      date: new Date(data.entity_metadata.premiere_date),
    };
  } catch (error) {
    console.error("Error transforming data to view:", error);
    return undefined;
  }
};

/**
 * Retrieves a list of collections from the API.
 *
 * @returns {Promise<Array<Collection>>} A promise resolving to an array of collections.
 */
export const getCollections = async (): Promise<Array<Collection>> => {
  try {
    const rawData = await fetchCollections();
    return rawData.map(({id, name, theme, href}) => ({
      title: name,
      id,
      href,
      theme,
    }));
  } catch (error) {
    console.error("Error getting collections:", error);
    return [];
  }
};

/**
 * Fetches and transforms views from a given collection URL.
 *
 * @param {string} href - The collection URL.
 * @returns {Promise<View[]>} A promise resolving to an array of `View` objects.
 */
export const getViews = async (href: string): Promise<View[]> => {
  try {
    const response = await fetch(`${PROXY}${href}`);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch views: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const views = await Promise.all(data.items.map(transformDataToView));

    return views.filter(Boolean) as View[];
  } catch (error) {
    console.error("Error fetching views:", error);
    return [];
  }
};
