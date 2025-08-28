import { Outlet, useRouteError } from "react-router-dom";

const NoauthLayout: React.FC = () => {
  const routeError = useRouteError();

  // const setKyb = (data) => {
  //   setNoauthData({
  //     ...noauthData,
  //     kybDocument: { ...noauthData.kybDocument, ...data },
  //     organization: data.merchantName ?? noauthData.organization,
  //   });
  // };

  // const setRaw = (data) =>
  //   setNoauthData({
  //     ...noauthData,
  //     rawUserData: { ...noauthData.rawUserData, ...data },
  //   });

  return (
    <>
      {!routeError && <Outlet />}
      {!!(import.meta.env.DEV && routeError) && (
        <div className="flex h-full w-full items-center justify-center">
          <div className="mx-auto max-w-5xl bg-black/5">
            <code>{JSON.stringify(routeError)}</code>
          </div>
        </div>
      )}
    </>
  );
};

export default NoauthLayout;
