import { useEffect, useState } from "react";

import { RouterOutputs } from "server/resources";

import api from "#client/api";

import { Dropdown } from "../atoms";

type Countries = RouterOutputs["appInputs"]["getCountries"];

const PhoneLocale: React.FC<
  Countries[number] & { onChange: (code: string) => void }
> = ({ flag, callingCode, onChange, code }) => {
  const selectFlag = () => onChange(code);
  return (
    <div className="rounded-sm p-1" onClick={selectFlag}>
      {flag}
      {callingCode}
    </div>
  );
};

interface PhoneLocaleDropdownProps {
  onChange: (selectedCountry: Countries[number]) => void;
  defaultCountry: Countries[number];
  defaultCountries?: Countries;
}
const PhoneLocaleDropdown: React.FC<PhoneLocaleDropdownProps> = ({
  onChange,
  defaultCountry,
  defaultCountries = [],
}) => {
  const [selected, setSelected] = useState<Countries[number]>(defaultCountry);
  const [countries, setCountries] = useState<Countries>(defaultCountries);
  const [loading, setLoading] = useState(Boolean(countries.length));

  const onCountryChange = (code: string) => {
    const country = countries.find((c) => c.code === code);
    if (country) {
      setSelected(country);
      onChange(country);
    }
  };

  useEffect(() => {
    if (!countries.length) setLoading(true);
    api.appInputs.getCountries
      .query()
      .then((countries) => {
        setCountries(
          countries.map((country) => ({
            ...country,
            key: country.code,
            onChange: onCountryChange,
          }))
        );
        setSelected(countries.find((c) => c.code === "USA") ?? countries[0]);
        if (loading) setLoading(false);
      })
      .finally(() => {
        if (loading) setLoading(false);
      });
  }, []);

  return (
    <Dropdown
      items={countries}
      ItemComponent={PhoneLocale as React.FC}
      disabled={loading}
      className="flex rounded-sm bg-zinc-500 px-1 py-[2px]"
    >
      {selected?.callingCode}
      {selected?.flag}
    </Dropdown>
  );
};

export default PhoneLocaleDropdown;
