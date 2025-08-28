import { Fragment, useEffect, useState } from "react";

import { Transition } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { type SubmitHandler, useForm } from "react-hook-form";
import { type TypeOf, z } from "zod";

import { Button, Container, Hint } from "#client/components/atoms";
import { ComboBox, TextInput } from "#client/components/form";
import { AddressListView } from "#client/components/list-views";
import { useNoauth } from "#client/features/auth";
import { useAppear } from "#client/hooks";
import {
  Prediction,
  Predictions,
  autocompletePlace,
  initPlacePrediction,
} from "#client/utils/gmaps";
import { renderListView } from "#client/utils/render";

import useFormCompletion from "../hooks/useFormCompletion";
import { OnboardingStageProps } from "../types";

const orgAddressSchema = z.object({
  website: z.string().url({ message: "Please enter a valid URL." }),
  phone: z.string().length(10, { message: "Please enter a valid number." }),
});
type OrgAddressSchema = TypeOf<typeof orgAddressSchema>;

const OrgFinal: React.FC<OnboardingStageProps> = ({
  finish,
  changeCompletion,
}) => {
  const { show } = useAppear();
  const { organization, setKyb, kybDocument } = useNoauth();
  const { register, handleSubmit, formState, getValues } =
    useForm<OrgAddressSchema>({
      resolver: zodResolver(orgAddressSchema),
      reValidateMode: "onBlur",
      shouldUseNativeValidation: false,
      defaultValues: {
        website: kybDocument?.website ?? "",
        phone: kybDocument?.phone ?? "",
      },
    });
  const [chosenAddress, setChosenAddress] = useState<Prediction>();
  const [addresses, setAddresses] = useState<Predictions>([]);
  const [addressLoading, setAddressLoading] = useState(false);

  useFormCompletion(getValues, changeCompletion, 0.005);

  useEffect(() => {
    // autocompletePlace handles this but we may as well get it out of the way on mount
    initPlacePrediction();
  }, []);

  const autoComplete = async (query: string) => {
    const res = await autocompletePlace(query);
    return res;
  };

  const onQuery = async (query: string) => {
    if (query) {
      setAddressLoading(true);
      const res = await autoComplete(query);
      if (res) setAddresses(res.predictions);
      setAddressLoading(false);
    }
  };

  const onSubmit: SubmitHandler<OrgAddressSchema> = ({ website, phone }) => {
    setKyb({
      website,
      phone,
      address: {
        googlePlacesId: chosenAddress?.place_id ?? "",
        jsonAddress: {
          address: chosenAddress?.description,
          fmt: chosenAddress?.structured_formatting,
        },
      },
    });
    finish?.();
  };

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
            <TextInput<OrgAddressSchema>
              type="tel"
              name="phone"
              label="Phone"
              register={register}
              placeholder="404 803 9945"
              className="mb-4 w-full"
              inferIcon
              labelHint=""
            />
            <TextInput<OrgAddressSchema>
              type="url"
              name="website"
              label="Website"
              register={register}
              placeholder="https://acme.com"
              className="mb-4 w-full"
              inferIcon
              labelHint=""
              labelUrl="https://en.wikipedia.org/wiki/Trade_name"
            />
            <div className="my-4 w-full">
              <ComboBox<Prediction>
                items={addresses}
                display={"description"}
                renderItem={renderListView(AddressListView)}
                placeholder="3 Bethesda Metro Center, Bethesda, MD"
                label="Address"
                onQuery={onQuery}
                onSelectItem={setChosenAddress}
                loading={addressLoading}
                prefiltered
                float
              />
            </div>
            <Button
              block
              intent="primary"
              type="submit"
              disabled={!formState.isValid || !chosenAddress}
            >
              Continue
            </Button>
          </form>
        </Container>
      </Transition.Child>
    </Transition>
  );
};

export default OrgFinal;

// https://nuphy.refr.cc/ibrahimsaberi
