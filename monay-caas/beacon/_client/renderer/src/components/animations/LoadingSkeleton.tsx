import React from "react";

import { Container } from "../atoms";
import { ContainerProps } from "../atoms/Container";

interface LoadingSkeletonProps extends ContainerProps {
  height?: number;
}
const LoadingSkeleton: React.FC<
  React.PropsWithChildren<LoadingSkeletonProps>
> = ({ height = 200, children, ...props }) => {
  return (
    <Container
      className="relative overflow-hidden"
      style={{
        minHeight: height,
      }}
      {...props}
      type="neu"
    >
      <div className="load absolute -left-[50%] top-0 isolate z-50 h-full w-[50%] border-t border-list/50 bg-gradient-to-r from-list/0 via-list/50 to-list/0" />
      {children}
    </Container>
  );
};

export default LoadingSkeleton;
