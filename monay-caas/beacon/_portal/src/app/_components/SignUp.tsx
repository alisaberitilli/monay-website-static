import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { observer } from "mobx-react-lite";
import { type SubmitHandler, useForm } from "react-hook-form";
import { type TypeOf, z } from "zod";

import { Button } from "#client/components/atoms";
import { Checkbox, TextInput } from "#client/components/form";
import { useRootStore } from "#client/store/_root";
import { NoauthStageProps } from "#client/features/auth";
import { redirect } from "react-router-dom";
const signUpSchema = z
  .object({
    name: z.string().min(3, { message: "Please enter your full name." }),
    email: z.string().email({ message: "Please enter a valid email." }),
    newOrg: z.optional(z.boolean()),
    orgName: z.optional(
      z.string().min(2, {
        message: "Please enter the full name of your organization.",
      })
    ),
  })
  .refine(
    ({ newOrg, orgName }) => {
      if (newOrg && !orgName) return false;
      return true;
    },
    { message: "Please enter the full name of your organization." }
  );
type SignUpSchema = TypeOf<typeof signUpSchema>;

const SignUp: React.FC<NoauthStageProps & 
    { signUp: (email: string) => Promise<{ error?: string }> }
  > = ({ goToOtp, signUp }) => {
  const { auth } = useNoauth();
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    watch,
    formState,
    resetField,
  } = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    reValidateMode: "onBlur",
    shouldUseNativeValidation: false,
    defaultValues: {
      name: "",
      email: "",
      newOrg: false,
    },
  });

  const loading = formState.isSubmitting || formState.isLoading;
  const showError = !loading && !!Object.keys(formState.errors).length;

  const onSubmit: SubmitHandler<SignUpSchema> = async ({
    email,
    name,
    orgName,
  }) => {
    if (formState.errors.root) clearErrors("root");
    const { error } = await signUp(email, name, orgName);
    
    if (!error) return redirect("/otp");
    if (typeof error === "string") {
      setError("root", { message: error });
    } else if (error && typeof error === "object") {
      setError("root", error);
    } else {
      goToOtp?.();
    }
  };

  const creatingNewOrg = watch("newOrg");
  useEffect(() => {
    if (!creatingNewOrg) resetField("orgName");
  }, [creatingNewOrg]);

  return (
    <>
      <h1 className="mb-4 mt-8">Sign Up</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextInput<SignUpSchema>
          type="text"
          name="name"
          label="Name"
          hideLabel
          register={register}
          placeholder="John Doe"
          error={formState.touchedFields.name && formState.errors.name?.message}
          loading={loading}
          className="mb-4"
          inferIcon
          block
        />
        <TextInput<SignUpSchema>
          type="email"
          name="email"
          label="Email"
          hideLabel
          register={register}
          placeholder="john.doe@acme.io"
          error={
            formState.touchedFields.email && formState.errors.email?.message
          }
          loading={loading}
          block
          inferIcon
          className="mb-4"
        />
        <Checkbox
          disabled={loading}
          name="newOrg"
          className="mb-4"
          register={register}
          label="Creating a new organization?"
          required={false}
        />
        {creatingNewOrg && (
          <TextInput<SignUpSchema>
            type="text"
            name="orgName"
            placeholder="ACME Corp."
            register={register}
            label="Organization Name"
            hideLabel
            error={
              formState.touchedFields.orgName &&
              formState.errors.orgName?.message
            }
            loading={loading}
            className="mb-4"
            block
            required={false}
          />
        )}
        <Button
          disabled={!formState.isDirty || loading || !formState.isValid}
          className="py-2"
          block
          loading={loading}
          type="submit"
        >
          Submit
        </Button>
        {showError && (
          <div className="-mt-1 rounded-b-md bg-red-100/80 px-4 py-2 text-center text-red-700">
            {formState.errors.root?.message}
          </div>
        )}
      </form>
    </>
  );
};

export default observer(SignUp);
