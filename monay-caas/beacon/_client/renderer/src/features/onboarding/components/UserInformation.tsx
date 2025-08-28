import { Fragment, useEffect } from "react";

import { Transition } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { type SubmitHandler, useForm } from "react-hook-form";
import { type TypeOf, z } from "zod";

import { Button, Container } from "#client/components/atoms";
import { TextInput } from "#client/components/form";
import { useNoauth } from "#client/features/auth";
import { useAppear } from "#client/hooks";

import useFormCompletion from "../hooks/useFormCompletion";
import { OnboardingStageProps } from "../types";

const userInfoSchema = z.object({
  role: z.string().min(2, { message: "Please enter your full role." }),
  use: z.string(),
});
type UserInfoSchema = TypeOf<typeof userInfoSchema>;

const UserInformation: React.FC<OnboardingStageProps> = ({
  goToStage,
  changeCompletion,
}) => {
  const { show } = useAppear();
  const { name, rawUserData, setRaw } = useNoauth();
  const { register, handleSubmit, formState, getValues, watch } =
    useForm<UserInfoSchema>({
      resolver: zodResolver(userInfoSchema),
      reValidateMode: "onBlur",
      shouldUseNativeValidation: false,
      defaultValues: (() => {
        let role = "";
        let use = "";
        if (rawUserData) {
          if ("role" in rawUserData) role = rawUserData.role as string;
          if ("use" in rawUserData) use = rawUserData.use as string;
        }
        return {
          role,
          use,
        };
      })(),
    });

  const onSubmit: SubmitHandler<UserInfoSchema> = ({ role, use }) => {
    setRaw({ role, use });
    goToStage?.("ORGINFO");
  };

  useFormCompletion(getValues, changeCompletion);

  const roleValue = watch("role");
  const useValue = watch("use");

  useEffect(() => {
    setRaw({ role: roleValue, use: useValue });
  }, [roleValue, useValue]);

  return (
    <Transition
      show={show}
      appear
      as={"div"}
      className="w-full"
      unmount={false}
    >
      <Transition.Child
        as={Fragment}
        enter="duration-500 delay-700 ease-out"
        enterFrom="translate-y-8 opacity-0 scale-90"
        enterTo="translate-y-0 opacity-100 scale-100"
        unmount={false}
      >
        <h2 className="text-center">Hi, {name?.split(" ")[0] ?? "friend"}.</h2>
      </Transition.Child>
      <Transition.Child
        as="div"
        enter="duration-1000 delay-[1.5s] ease-out"
        enterFrom="opacity-0 max-h-[0px]"
        enterTo="opacity-100 max-h-[300px]"
        unmount={false}
      >
        <div className="mb-4 text-center text-lg leading-5">
          Tell us a little more about yourself.
        </div>
        <Container>
          <form className="py-2" onSubmit={handleSubmit(onSubmit)}>
            <TextInput<UserInfoSchema>
              type="text"
              name="role"
              label="Your Role"
              register={register}
              placeholder="Admin, Sales, etc."
              error={
                formState.errors.role?.message ??
                (formState.touchedFields.role &&
                  roleValue.length < 2 &&
                  "Please enter your full role.")
              }
              className="mb-4"
              block
            />
            <TextInput<UserInfoSchema>
              type="text"
              name="use"
              label="How do you plan to use Beacon?"
              register={register}
              placeholder="Processing receivables, paying bills, etc."
              className="mb-4"
              block
              textarea
            />
            <Button
              block
              intent="primary"
              type="submit"
              disabled={!formState.isValid}
            >
              Continue
            </Button>
          </form>
        </Container>
      </Transition.Child>
    </Transition>
  );
};

export default UserInformation;
