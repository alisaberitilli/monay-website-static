import { Model, model, modelAction, prop } from "mobx-keystone";

import ErrorModel, { createErrorModel } from "./error";
import LoaderModel, { IncomingLoaderState, createLoaderModel } from "./loader";

@model("GlobalState")
class GlobalStateStore extends Model({
  loader: prop<LoaderModel>(createLoaderModel),
  error: prop<ErrorModel>(createErrorModel),
}) {
  @modelAction
  setGlobalLoading(state: IncomingLoaderState) {
    this.loader.setGlobalLoading(state);
  }

  @modelAction
  setGlobalError(state: React.ReactNode) {
    this.error.setError(state);
  }
}

export const createGlobalStateStore = () => new GlobalStateStore({});
export default GlobalStateStore;
