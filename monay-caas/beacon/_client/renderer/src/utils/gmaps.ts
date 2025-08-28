import { Loader } from "@googlemaps/js-api-loader";

const loader = new Loader({
  apiKey: import.meta.env.VITE_GMAP_KEY,
});

let locationDenied: GeolocationPositionError;
let currentLocation: GeolocationPosition;
const getCurrentPosition = async (): Promise<
  GeolocationPosition | GeolocationPositionError
> =>
  new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(resolve, resolve);
  });

let placesApi: google.maps.PlacesLibrary;
let autocompleteService: google.maps.places.AutocompleteService;
export const initPlaces = async (getLocation?: boolean) => {
  if (!placesApi) {
    if (getLocation && !currentLocation && !locationDenied) {
      const location = await getCurrentPosition();
      if (location instanceof GeolocationPosition) {
        currentLocation = location;
      } else {
        locationDenied = location;
      }
    }
    placesApi = await loader.importLibrary("places");
    autocompleteService = new placesApi.AutocompleteService();
  }
  return { placesApi, autocompleteService };
};

let geocodingApi: google.maps.GeocodingLibrary;
let geocodingService: google.maps.Geocoder;
export const initGeocoding = async () => {
  if (!geocodingApi) {
    geocodingApi = await loader.importLibrary("geocoding");
    geocodingService = new geocodingApi.Geocoder();
  }
  return { geocodingApi, geocodingService };
};

let getPlacePrediction: (
  input: string
) => ReturnType<google.maps.places.AutocompleteService["getPlacePredictions"]>;
export const initPlacePrediction = async () => {
  if (!getPlacePrediction) {
    const { autocompleteService } = await initPlaces();
    getPlacePrediction = async (input: string) => {
      return autocompleteService.getPlacePredictions({
        input,
        locationBias: currentLocation
          ? {
              lat: currentLocation.coords.latitude,
              lng: currentLocation.coords.longitude,
            }
          : null,
      });
    };
  }
  return getPlacePrediction;
};

export const autocompletePlace = async (input: string) => {
  const getPlacePrediction = await initPlacePrediction();
  return getPlacePrediction(input);
};
export const getPlaceDetails = async (placeId: string) => {
  const { geocodingService } = await initGeocoding();
  return geocodingService.geocode({ placeId });
};

export type Predictions = google.maps.places.AutocompletePrediction[];
export type Prediction = google.maps.places.AutocompletePrediction;
