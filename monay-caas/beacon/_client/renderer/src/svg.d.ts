declare module "*.svg" {
  import * as React from "react";

  export const ReactComponent: React.FunctionComponent<
    React.ComponentProps<"svg"> & { title?: string }
  >;
  export default ReactComponent;
}

type SvgProps = React.ComponentProps<"svg"> & { title?: string };
type SvgComponent = React.FunctionComponent<SvgProps>;
