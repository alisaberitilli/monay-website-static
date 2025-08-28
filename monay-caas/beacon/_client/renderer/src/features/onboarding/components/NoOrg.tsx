import { RiArrowRightDoubleLine, RiMailCloseFill } from "react-icons/ri";

import { Button, Container } from "#client/components/atoms";
import { useNoauth, useSession } from "#client/features/auth";

import { OnboardingStageProps } from "../types";

const NoOrg: React.FC<OnboardingStageProps> = ({ goToStage }) => {
  const goNext = () => goToStage?.("USERINFO");
  const session = useSession();
  const { email } = useNoauth();

  return (
    <Container
      title={<h2 className="mb-2 text-center">We ran into an issue.</h2>}
    >
      <div className="text-center">
        <p>
          We couldnt find an organization based on your email {email} with
          domain:
        </p>
        <div className="relative my-3 flex min-h-[50px] items-center justify-center text-lg font-semibold">
          <div className="absolute flex h-full w-full items-center justify-center opacity-20">
            <RiMailCloseFill size={50} />
          </div>
          {email?.split("@")[1]}
        </div>
        <p>
          {" "}
          If you think there has been a mistake, please notify your workspace
          admin.
        </p>
        <p className="mt-8">You may also register your organization now.</p>
        <div className="mt-4 flex flex-row gap-2">
          <Button
            className="min-w-[30%]"
            intent="destructive"
            onClick={session?.signOut}
          >
            Sign Out
          </Button>
          <Button block intent="primary" onClick={goNext}>
            Register
            <RiArrowRightDoubleLine />
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default NoOrg;
