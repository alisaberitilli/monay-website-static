import { Loader } from "@googlemaps/js-api-loader";
import { z } from "zod";

import { AddressCreateInputObjectSchema } from "#schema";
import config from "#server/config";
import { authProcedure, router } from "#server/trpc";

const loader = new Loader({
  apiKey: config.gmapsKey,
});

let geocodingApi: google.maps.GeocodingLibrary;
let geocodingService: google.maps.Geocoder;
const initGeocoding = async () => {
  if (!geocodingApi) {
    geocodingApi = await loader.importLibrary("geocoding");
    geocodingService = new geocodingApi.Geocoder();
  }
  return { geocodingApi, geocodingService };
};

const getPlaceDetails = async (placeId: string) => {
  const { geocodingService } = await initGeocoding();
  return geocodingService.geocode({ placeId });
};

// https://developers.google.com/maps/documentation/javascript/geocoding#GeocodingAddressTypes
const getTypeFromPlace = (place: google.maps.GeocoderResult, key: string) => {
  const component = place.address_components.find((c) => c.types.includes(key));

  return { short: component?.short_name, long: component?.long_name };
};
const extractComponentsFromPlace = (place: google.maps.GeocoderResult) => {
  const getType = (key: string) => getTypeFromPlace(place, key);
  if (place) {
    return {
      street_address: getType("street_address"),
      political: getType("political"),
      country: getType("country"),
      state: getType("administrative_area_level_1"),
      county: getType("administrative_area_level_2"),
      city: getType("locality"),
      premise: getType("premise"),
      // https://www.dcode.fr/open-location-code
      plus_code: getType("plus_code"),
      postal_code: getType("postal_code"),
      street_number: getType("street_number"),
    };
  }
  return {};
};

const addressRouter = router({
  registerPlaceId: authProcedure
    .input(z.string())
    .output(z.string())
    .mutation(async ({ ctx: { prisma }, input }) => {
      const addressExists = await prisma.address.findFirst({
        where: { googlePlacesId: input },
      });
      if (
        addressExists &&
        (addressExists.updatedAt.valueOf() >=
          Date.now() - 1000 * 60 * 60 * 24 * 90 ||
          Object.keys(addressExists.jsonAddress ?? {}).length === 0)
      ) {
        // return as is if the address exists and it hasn't been 90 days since last updated or if the address doesnt have proper json components
        return addressExists.id;
      } else {
        const details = await getPlaceDetails(input);
        const jsonAddress = extractComponentsFromPlace(details.results[0]);
        if (addressExists) {
          await prisma.address.update({
            where: { id: addressExists.id },
            data: { jsonAddress },
          });
          return addressExists.id;
        } else {
          const newAddress = await prisma.address.create({
            data: {
              googlePlacesId: input,
              jsonAddress,
              countryCode: "IND",
            },
          });
          return newAddress.id;
        }
      }
    }),
});

export default addressRouter;
