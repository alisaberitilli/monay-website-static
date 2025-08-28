import type { Industry, ServiceType } from "@prisma/client";
import { Model, model, prop } from "mobx-keystone";

import AddressModel, { CountryModel } from "./address";
import KybModel from "./kyb";
import OrganizationModel from "./organization";
import UserModel from "./user";

@model("Beacon")
export default class BeaconStore extends Model({
  user: prop<UserModel>().withSetter(),
  organization: prop<OrganizationModel>().withSetter(),
  nudges: prop<string[]>(() => []).withSetter(),
  serviceTypes: prop<ServiceType[]>(() => []).withSetter(),
  industries: prop<Industry[]>(() => []).withSetter(),
  syncedWithServer: prop<boolean>(false).withSetter(),
}) {}

export const createBeaconStore = () =>
  new BeaconStore({
    user: new UserModel({
      email: "",
      name: "",
    }),
    organization: new OrganizationModel({
      subscriberUnits: [],
      billerUnits: [],
      kybDocument: new KybModel({
        address: new AddressModel({
          googlePlacesId: "",
          jsonAddress: {},
          country: new CountryModel({}),
        }),
      }),
    }),
  });
