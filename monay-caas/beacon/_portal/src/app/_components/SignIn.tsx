import { zodResolver } from "@hookform/resolvers/zod";
import { observer } from "mobx-react-lite";
import { SubmitHandler, useForm } from "react-hook-form";
import { TypeOf, z } from "zod";

import { Button } from "#client/components/atoms";
import { TextInput } from "#client/components/form";

import { NoauthStageProps } from "../hooks/useNoauth";
import { redirect } from "react-router-dom";

const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
});
type SignInSchema = TypeOf<typeof signInSchema>;

const SignIn: React.FC<NoauthStageProps> = ({ goToOtp }) => {
  const root = useRootStore();

  const { register, handleSubmit, setError, clearErrors, formState } =
    useForm<SignInSchema>({
      resolver: zodResolver(signInSchema),
      reValidateMode: "onBlur",
      shouldUseNativeValidation: false,
      defaultValues: {
        email: "",
      },
    });

  const loading = formState.isSubmitting || formState.isLoading;
  const showError = !loading && !!Object.keys(formState.errors).length;

  const onSubmit: SubmitHandler<SignInSchema> = async ({ email }) => {
    if (formState.errors.root) clearErrors("root");
    const res = await root.auth.signIn(email);
    console.log(res);
    if (res) {
      const { error } = res;
      if (!error) return redirect("/otp");
      if (typeof error === "string") {
        setError("root", { message: error });
      } else if (error && typeof error === "object") {
        setError("root", error);
      } else {
        goToOtp?.();
      }
    }
  };

  return (
    <>
      <h1 className="mb-4 mt-8">Sign In</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextInput<SignInSchema>
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

export default observer(SignIn);
