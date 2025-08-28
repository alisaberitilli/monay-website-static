import { Model, model, prop } from "mobx-keystone";

@model("Error")
class ErrorModel extends Model({
  error: prop<React.ReactNode | undefined>().withSetter(),
}) {}

export const createErrorModel = () => new ErrorModel({});
export default ErrorModel;
