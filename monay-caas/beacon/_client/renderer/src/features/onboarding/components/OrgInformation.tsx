import { Fragment, useEffect } from "react";

import { Transition } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { type SubmitHandler, useForm } from "react-hook-form";
import { type TypeOf, z } from "zod";

import { Button, Container, Hint } from "#client/components/atoms";
import { TextInput } from "#client/components/form";
import { useNoauth } from "#client/features/auth";
import { useAppear } from "#client/hooks";

import useFormCompletion from "../hooks/useFormCompletion";
// AIzaSyC32_38njmAdsjfOqVXY7v5oc6uwGZMRyE
import { OnboardingStageProps } from "../types";

const orgInformationSchema = z.object({
  merchantName: z.string().min(1),
  subMerchantDba: z.string().min(1),
  taxId: z.string().min(5),
});
type OrgInformationSchema = TypeOf<typeof orgInformationSchema>;

const OrgInformation: React.FC<OnboardingStageProps> = ({
  goToStage,
  changeCompletion,
}) => {
  const { show } = useAppear();
  const { organization, setKyb, kybDocument } = useNoauth();
  const { register, handleSubmit, formState, getValues, watch } =
    useForm<OrgInformationSchema>({
      resolver: zodResolver(orgInformationSchema),
      mode: "onTouched",
      reValidateMode: "onBlur",
      defaultValues: {
        merchantName: organization,
        subMerchantDba: kybDocument?.subMerchantDba ?? "",
        taxId: kybDocument?.taxId ?? "",
      },
    });

  useFormCompletion(getValues, changeCompletion, 0.02);

  const onSubmit: SubmitHandler<OrgInformationSchema> = ({
    merchantName,
    subMerchantDba,
    taxId,
  }) => {
    setKyb({ merchantName, subMerchantDba, taxId });
    goToStage?.("ORGFINAL");
  };

  // yes this defeats the purpose of all of the optimizations we get out of using react-hook-forms. Consider this however: I'm on a deadline.
  const merchantName = watch("merchantName");
  const subMerchantDba = watch("subMerchantDba");
  const taxId = watch("taxId");

  useEffect(() => {
    setKyb({ merchantName, subMerchantDba, taxId });
  }, [merchantName, subMerchantDba, taxId]);

  return (
    <Transition
      show={show}
      appear
      as={"div"}
      unmount={false}
      className="w-full"
    >
      <Transition.Child
        as={Fragment}
        enter="duration-500 delay-700 ease-out"
        enterFrom="translate-y-8 opacity-0 scale-90"
        enterTo="translate-y-0 opacity-100 scale-100"
        unmount={false}
      >
        <h2 className="text-center">Your Organization</h2>
      </Transition.Child>
      <Transition.Child
        as="div"
        enter="duration-1000 delay-[1.5s] ease-out"
        enterFrom="opacity-0 max-h-[0px]"
        enterTo="opacity-100 max-h-screen"
        unmount={false}
      >
        <div className="mb-4 flex w-full justify-center text-center text-lg leading-5">
          Tell us about {organization}.
          <Hint position="-translate-x-[260px]" maxWidth="max-w-[390px]">
            We need information about your business&apos; sub-merchant
            underwriting in order to process payments for you.
          </Hint>
        </div>
        <Container>
          <form className="py-2" onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4 flex w-full flex-wrap items-center justify-between gap-4 lg:flex-nowrap">
              <TextInput<OrgInformationSchema>
                type="text"
                name="merchantName"
                label="Merchant Name"
                register={register}
                placeholder="Acme Inc."
                className="w-full lg:w-[50%]"
                labelHint="The legal name of the business enterprise owned by the sub-merchant (your organization)."
              />
              <TextInput<OrgInformationSchema>
                type="text"
                name="subMerchantDba"
                label="Sub-merchant DBA"
                register={register}
                placeholder="ACME CO"
                className="w-full lg:w-[50%]"
                labelHint="Your organization's trade name by which it Does Business As."
                labelUrl="https://en.wikipedia.org/wiki/Trade_name"
              />
            </div>
            <div className="my-4 w-full">
              <TextInput<OrgInformationSchema>
                type="text"
                name="taxId"
                label="Tax ID"
                register={register}
                placeholder="12-3456789"
                className="w-full"
                labelHint="Tax identification number of the organization by {LOCALE}"
              />
            </div>
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

export default OrgInformation;
