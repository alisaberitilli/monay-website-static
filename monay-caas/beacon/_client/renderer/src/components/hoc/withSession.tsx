import { useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { useSession } from "#client/features/auth";

const withSession = <T extends JSX.IntrinsicAttributes = {}>(
  Page: React.FC<T>,
  redirectUri = "/"
): React.FC<T> => {
  const PageWithSession: React.FC<T> = (props: T) => {
    const navigate = useNavigate();
    const session = useSession();

    useEffect(() => {
      if (!session?.user) {
        navigate(redirectUri);
      }
    }, [navigate, session]);

    return <Page {...props} />;
  };

  return PageWithSession;
};

export default withSession;
