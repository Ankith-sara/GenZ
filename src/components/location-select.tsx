"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Country, State, City, ICountry, IState, ICity } from "country-state-city";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface LocationSelectGroupProps {
  countryValue?: string;
  stateValue?: string;
  cityValue?: string;
  pincodeValue?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  required?: boolean;
}

export function LocationSelectGroup({
  countryValue = "India",
  stateValue = "Tamil Nadu",
  cityValue = "Coimbatore",
  pincodeValue = "",
  onChange,
  required = true,
}: LocationSelectGroupProps) {
  // All countries from package
  const allCountries = useMemo<ICountry[]>(() => Country.getAllCountries(), []);

  // Find active country object (matching by name or fallback to IN / India)
  const selectedCountryObj = useMemo<ICountry>(() => {
    return (
      allCountries.find(
        (c) =>
          c.name.toLowerCase() === (countryValue || "india").toLowerCase() ||
          c.isoCode === countryValue
      ) ||
      allCountries.find((c) => c.isoCode === "IN") ||
      allCountries[0]
    );
  }, [allCountries, countryValue]);

  // All states for selected country
  const availableStates = useMemo<IState[]>(() => {
    return selectedCountryObj
      ? State.getStatesOfCountry(selectedCountryObj.isoCode)
      : [];
  }, [selectedCountryObj]);

  // Find active state object
  const selectedStateObj = useMemo<IState | undefined>(() => {
    return availableStates.find(
      (s) =>
        s.name.toLowerCase() === (stateValue || "").toLowerCase() ||
        s.isoCode === stateValue
    );
  }, [availableStates, stateValue]);

  // All cities for selected state & country
  const availableCities = useMemo<ICity[]>(() => {
    if (!selectedCountryObj || !selectedStateObj) return [];
    return City.getCitiesOfState(selectedCountryObj.isoCode, selectedStateObj.isoCode);
  }, [selectedCountryObj, selectedStateObj]);

  const [customCity, setCustomCity] = useState(false);

  // Handle Country selection change
  const handleCountrySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const isoCode = e.target.value;
    const countryObj = allCountries.find((c) => c.isoCode === isoCode);
    const countryName = countryObj ? countryObj.name : "India";

    // Notify parent of country change
    onChange({
      target: { name: "country", value: countryName },
    } as React.ChangeEvent<HTMLInputElement>);

    // Auto select first state & city
    const states = State.getStatesOfCountry(isoCode);
    const firstState = states[0];
    const stateName = firstState ? firstState.name : "";
    onChange({
      target: { name: "state", value: stateName },
    } as React.ChangeEvent<HTMLInputElement>);

    if (firstState) {
      const cities = City.getCitiesOfState(isoCode, firstState.isoCode);
      const cityName = cities[0] ? cities[0].name : "";
      onChange({
        target: { name: "city", value: cityName },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  // Handle State selection change
  const handleStateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateNameOrIso = e.target.value;
    const stateObj = availableStates.find(
      (s) => s.isoCode === stateNameOrIso || s.name === stateNameOrIso
    );
    const stateName = stateObj ? stateObj.name : stateNameOrIso;

    // Notify parent of state change
    onChange({
      target: { name: "state", value: stateName },
    } as React.ChangeEvent<HTMLInputElement>);

    // Auto update city list to first city of new state
    if (selectedCountryObj && stateObj) {
      const cities = City.getCitiesOfState(
        selectedCountryObj.isoCode,
        stateObj.isoCode
      );
      const firstCity = cities[0] ? cities[0].name : "";
      setCustomCity(false);
      onChange({
        target: { name: "city", value: firstCity },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div className="space-y-4">
      {/* Country Dropdown */}
      <div>
        <Label htmlFor="country">Country *</Label>
        <select
          id="country"
          name="country"
          required={required}
          value={selectedCountryObj?.isoCode || "IN"}
          onChange={handleCountrySelect}
          className="mt-1 flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-1 focus:ring-black focus:outline-none"
        >
          {allCountries.map((c) => (
            <option key={c.isoCode} value={c.isoCode}>
              {c.flag} {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* State, City, Pincode Cascading Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* State Selection */}
        <div>
          <Label htmlFor="state">State / Province *</Label>
          {availableStates.length > 0 ? (
            <select
              id="state"
              name="state"
              required={required}
              value={selectedStateObj?.isoCode || selectedStateObj?.name || ""}
              onChange={handleStateSelect}
              className="mt-1 flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-1 focus:ring-black focus:outline-none"
            >
              <option value="">Select State</option>
              {availableStates.map((s) => (
                <option key={s.isoCode} value={s.isoCode}>
                  {s.name}
                </option>
              ))}
            </select>
          ) : (
            <Input
              id="state"
              name="state"
              required={required}
              value={stateValue}
              onChange={onChange}
              placeholder="State / Province"
              className="mt-1 border-neutral-200"
            />
          )}
        </div>

        {/* City Selection */}
        <div>
          <Label htmlFor="city">City *</Label>
          {availableCities.length > 0 && !customCity ? (
            <select
              id="city"
              name="city"
              required={required}
              value={cityValue}
              onChange={(e) => {
                if (e.target.value === "OTHER_CUSTOM") {
                  setCustomCity(true);
                  onChange({
                    target: { name: "city", value: "" },
                  } as React.ChangeEvent<HTMLInputElement>);
                } else {
                  onChange(e);
                }
              }}
              className="mt-1 flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-1 focus:ring-black focus:outline-none"
            >
              <option value="">Select City</option>
              {availableCities.map((ct) => (
                <option key={`${ct.name}-${ct.latitude}`} value={ct.name}>
                  {ct.name}
                </option>
              ))}
              <option value="OTHER_CUSTOM">+ Other / Type Custom City...</option>
            </select>
          ) : (
            <div className="relative">
              <Input
                id="city"
                name="city"
                required={required}
                value={cityValue}
                onChange={onChange}
                placeholder="Type City name"
                className="mt-1 border-neutral-200 pr-12"
              />
              {availableCities.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCustomCity(false)}
                  className="absolute top-1/2 right-2 -translate-y-1/2 text-[10px] text-neutral-500 underline hover:text-black"
                >
                  Dropdown
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pincode / Zip Code */}
        <div>
          <Label htmlFor="pincode">Pincode / ZIP *</Label>
          <Input
            id="pincode"
            name="pincode"
            required={required}
            value={pincodeValue}
            onChange={onChange}
            placeholder="641001"
            className="mt-1 border-neutral-200"
          />
        </div>
      </div>
    </div>
  );
}
