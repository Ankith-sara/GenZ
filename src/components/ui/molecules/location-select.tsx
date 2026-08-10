"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { Country, State, City, ICountry, IState, ICity } from "country-state-city";
import { Label } from "@/components/ui/atoms/label";
import { Input } from "@/components/ui/atoms/input";
import { ChevronDown, Search, Check } from "lucide-react";

interface LocationSelectGroupProps {
  addressValue?: string;
  countryValue?: string;
  stateValue?: string;
  cityValue?: string;
  pincodeValue?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  required?: boolean;
  showAddress?: boolean;
}

export function LocationSelectGroup({
  addressValue = "",
  countryValue = "India",
  stateValue = "Tamil Nadu",
  cityValue = "Coimbatore",
  pincodeValue = "",
  onChange,
  required = true,
  showAddress = true,
}: LocationSelectGroupProps) {
  // ISO list matching PhoneInputWithCountryCode major trade countries
  const majorIsos = useMemo(
    () => [
      "IN", // India
      "AE", // UAE
      "SG", // Singapore
      "SA", // Saudi Arabia
      "MY", // Malaysia
      "TH", // Thailand
      "VN", // Vietnam
      "ID", // Indonesia
      "BD", // Bangladesh
      "LK", // Sri Lanka
      "NP", // Nepal
      "JP", // Japan
      "KR", // South Korea
      "CN", // China
      "HK", // Hong Kong
      "US", // USA
      "GB", // UK
    ],
    []
  );

  const allCountries = useMemo<ICountry[]>(() => Country.getAllCountries(), []);

  // Country list to only major trade countries
  const sortedCountries = useMemo(() => {
    return majorIsos
      .map((iso) => allCountries.find((c) => c.isoCode === iso))
      .filter((c): c is ICountry => !!c);
  }, [allCountries, majorIsos]);

  // Active country object
  const selectedCountryObj = useMemo<ICountry>(() => {
    return (
      sortedCountries.find(
        (c) =>
          c.name.toLowerCase() === (countryValue || "india").toLowerCase() ||
          c.isoCode === countryValue
      ) ||
      sortedCountries.find((c) => c.isoCode === "IN") ||
      sortedCountries[0]
    );
  }, [sortedCountries, countryValue]);

  // States for selected country
  const availableStates = useMemo<IState[]>(() => {
    return selectedCountryObj
      ? State.getStatesOfCountry(selectedCountryObj.isoCode)
      : [];
  }, [selectedCountryObj]);

  // Active state object
  const selectedStateObj = useMemo<IState | undefined>(() => {
    return availableStates.find(
      (s) =>
        s.name.toLowerCase() === (stateValue || "").toLowerCase() ||
        s.isoCode === stateValue
    );
  }, [availableStates, stateValue]);

  // Cities for selected state & country
  const availableCities = useMemo<ICity[]>(() => {
    if (!selectedCountryObj || !selectedStateObj) return [];
    return City.getCitiesOfState(selectedCountryObj.isoCode, selectedStateObj.isoCode);
  }, [selectedCountryObj, selectedStateObj]);

  // Popover state flags
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const [isStateOpen, setIsStateOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState("");

  const [isCityOpen, setIsCityOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [customCityMode, setCustomCityMode] = useState(false);

  const countryRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  // Filtered lists for popover searches
  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return sortedCountries;
    const q = countrySearch.toLowerCase().trim();
    return sortedCountries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.isoCode.toLowerCase().includes(q)
    );
  }, [sortedCountries, countrySearch]);

  const filteredStates = useMemo(() => {
    if (!stateSearch.trim()) return availableStates;
    const q = stateSearch.toLowerCase().trim();
    return availableStates.filter((s) => s.name.toLowerCase().includes(q));
  }, [availableStates, stateSearch]);

  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return availableCities;
    const q = citySearch.toLowerCase().trim();
    return availableCities.filter((c) => c.name.toLowerCase().includes(q));
  }, [availableCities, citySearch]);

  // Click outside handlers
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setIsCountryOpen(false);
      }
      if (stateRef.current && !stateRef.current.contains(e.target as Node)) {
        setIsStateOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setIsCityOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Select Country Handler
  const handleSelectCountry = (country: ICountry) => {
    setIsCountryOpen(false);
    setCountrySearch("");

    onChange({
      target: { name: "country", value: country.name },
    } as React.ChangeEvent<HTMLInputElement>);

    // Auto-select first state and city of new country
    const states = State.getStatesOfCountry(country.isoCode);
    const firstState = states[0];
    const stateName = firstState ? firstState.name : "";
    onChange({
      target: { name: "state", value: stateName },
    } as React.ChangeEvent<HTMLInputElement>);

    if (firstState) {
      const cities = City.getCitiesOfState(country.isoCode, firstState.isoCode);
      const cityName = cities[0] ? cities[0].name : "";
      onChange({
        target: { name: "city", value: cityName },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  // Select State Handler
  const handleSelectState = (state: IState) => {
    setIsStateOpen(false);
    setStateSearch("");

    onChange({
      target: { name: "state", value: state.name },
    } as React.ChangeEvent<HTMLInputElement>);

    if (selectedCountryObj) {
      const cities = City.getCitiesOfState(selectedCountryObj.isoCode, state.isoCode);
      const firstCity = cities[0] ? cities[0].name : "";
      setCustomCityMode(false);
      onChange({
        target: { name: "city", value: firstCity },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  // Select City Handler
  const handleSelectCity = (cityName: string) => {
    setIsCityOpen(false);
    setCitySearch("");

    if (cityName === "CUSTOM_MODE") {
      setCustomCityMode(true);
      onChange({
        target: { name: "city", value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
    } else {
      setCustomCityMode(false);
      onChange({
        target: { name: "city", value: cityName },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden inputs for native form submissions */}
      <input type="hidden" name="country" value={selectedCountryObj.name} />
      <input
        type="hidden"
        name="state"
        value={selectedStateObj?.name || stateValue || ""}
      />
      <input type="hidden" name="city" value={cityValue || ""} />

      {/* Street / Factory Address */}
      {showAddress && (
        <div>
          <Label htmlFor="address">Factory / Street Address *</Label>
          <Input
            id="address"
            name="address"
            required={required}
            value={addressValue}
            onChange={onChange}
            placeholder="Door / Building No., Street Name, Industrial Area"
            className="mt-1 border-neutral-200"
          />
        </div>
      )}

      {/* Country Custom Popover UI with Flags */}
      <div className="relative" ref={countryRef}>
        <Label htmlFor="country">Country *</Label>
        <button
          id="country"
          type="button"
          aria-label="Country"
          onClick={() => setIsCountryOpen((prev) => !prev)}
          className="mt-1 flex h-10 w-full items-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-xs transition-colors hover:border-neutral-300 focus:ring-1 focus:ring-black focus:outline-none"
        >
          <div className="flex items-center gap-2.5">
            <img
              src={`https://flagcdn.com/w20/${selectedCountryObj.isoCode.toLowerCase()}.png`}
              alt={selectedCountryObj.isoCode}
              className="h-3.5 w-5 shrink-0 rounded-[2px] border border-neutral-200 object-cover"
            />
            <span className="font-medium text-neutral-900">
              {selectedCountryObj.name}
            </span>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-neutral-500 transition-transform ${isCountryOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Country Popover List */}
        {isCountryOpen && (
          <div className="animate-fade-in absolute top-full left-0 z-50 mt-1 w-full rounded-md border border-neutral-200 bg-white p-2 shadow-lg">
            <div className="relative mb-2">
              <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search country..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                className="w-full rounded border border-neutral-200 bg-neutral-50 py-1.5 pr-2.5 pl-8 text-xs text-neutral-900 focus:ring-1 focus:ring-black focus:outline-none"
                autoFocus
              />
            </div>
            <div className="custom-scrollbar max-h-56 space-y-0.5 overflow-y-auto">
              {filteredCountries.length === 0 ? (
                <p className="p-2 text-center text-xs text-neutral-500">
                  No matching country
                </p>
              ) : (
                filteredCountries.map((c) => {
                  const isSelected =
                    c.isoCode === selectedCountryObj.isoCode ||
                    c.name === selectedCountryObj.name;
                  return (
                    <button
                      key={c.isoCode}
                      type="button"
                      onClick={() => handleSelectCountry(c)}
                      className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-xs transition-colors ${
                        isSelected
                          ? "bg-black font-medium text-white"
                          : "text-neutral-900 hover:bg-neutral-100"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={`https://flagcdn.com/w20/${c.isoCode.toLowerCase()}.png`}
                          alt={c.isoCode}
                          className="h-3.5 w-5 shrink-0 rounded-[2px] border border-neutral-200 object-cover"
                        />
                        <span>{c.name}</span>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* State, City, Pincode Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* State Selection */}
        <div className="relative" ref={stateRef}>
          <Label htmlFor="state">State / Province *</Label>
          {availableStates.length > 0 ? (
            <>
              <button
                id="state"
                type="button"
                aria-label="State / Province"
                onClick={() => setIsStateOpen((prev) => !prev)}
                className="mt-1 flex h-10 w-full items-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-xs transition-colors hover:border-neutral-300 focus:ring-1 focus:ring-black focus:outline-none"
              >
                <span className="truncate font-medium">
                  {selectedStateObj?.name || stateValue || "Select State"}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-neutral-500 transition-transform ${isStateOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isStateOpen && (
                <div className="animate-fade-in absolute top-full left-0 z-50 mt-1 w-full rounded-md border border-neutral-200 bg-white p-2 shadow-lg">
                  <div className="relative mb-2">
                    <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search state..."
                      value={stateSearch}
                      onChange={(e) => setStateSearch(e.target.value)}
                      className="w-full rounded border border-neutral-200 bg-neutral-50 py-1.5 pr-2.5 pl-8 text-xs text-neutral-900 focus:ring-1 focus:ring-black focus:outline-none"
                      autoFocus
                    />
                  </div>
                  <div className="custom-scrollbar max-h-52 space-y-0.5 overflow-y-auto">
                    {filteredStates.length === 0 ? (
                      <p className="p-2 text-center text-xs text-neutral-500">
                        No matching state
                      </p>
                    ) : (
                      filteredStates.map((s) => {
                        const isSelected =
                          s.name.toLowerCase() ===
                          (selectedStateObj?.name || stateValue || "").toLowerCase();
                        return (
                          <button
                            key={s.isoCode}
                            type="button"
                            onClick={() => handleSelectState(s)}
                            className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-xs transition-colors ${
                              isSelected
                                ? "bg-black font-medium text-white"
                                : "text-neutral-900 hover:bg-neutral-100"
                            }`}
                          >
                            <span className="truncate">{s.name}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </>
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
        <div className="relative" ref={cityRef}>
          <Label htmlFor="city">City *</Label>
          {availableCities.length > 0 && !customCityMode ? (
            <>
              <button
                id="city"
                type="button"
                aria-label="City"
                onClick={() => setIsCityOpen((prev) => !prev)}
                className="mt-1 flex h-10 w-full items-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-xs transition-colors hover:border-neutral-300 focus:ring-1 focus:ring-black focus:outline-none"
              >
                <span className="truncate font-medium">
                  {cityValue || "Select City"}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-neutral-500 transition-transform ${isCityOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isCityOpen && (
                <div className="animate-fade-in absolute top-full left-0 z-50 mt-1 w-full rounded-md border border-neutral-200 bg-white p-2 shadow-lg">
                  <div className="relative mb-2">
                    <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search city..."
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      className="w-full rounded border border-neutral-200 bg-neutral-50 py-1.5 pr-2.5 pl-8 text-xs text-neutral-900 focus:ring-1 focus:ring-black focus:outline-none"
                      autoFocus
                    />
                  </div>
                  <div className="custom-scrollbar max-h-52 space-y-0.5 overflow-y-auto">
                    {filteredCities.length === 0 ? (
                      <p className="p-2 text-center text-xs text-neutral-500">
                        No matching city
                      </p>
                    ) : (
                      filteredCities.map((ct) => {
                        const isSelected =
                          ct.name.toLowerCase() === (cityValue || "").toLowerCase();
                        return (
                          <button
                            key={`${ct.name}-${ct.latitude}`}
                            type="button"
                            onClick={() => handleSelectCity(ct.name)}
                            className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-xs transition-colors ${
                              isSelected
                                ? "bg-black font-medium text-white"
                                : "text-neutral-900 hover:bg-neutral-100"
                            }`}
                          >
                            <span className="truncate">{ct.name}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                          </button>
                        );
                      })
                    )}
                    <button
                      type="button"
                      onClick={() => handleSelectCity("CUSTOM_MODE")}
                      className="mt-1 flex w-full items-center justify-between rounded border-t border-neutral-100 px-2.5 pt-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
                    >
                      + Other / Type Custom City...
                    </button>
                  </div>
                </div>
              )}
            </>
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
                  onClick={() => setCustomCityMode(false)}
                  className="absolute top-1/2 right-2 -translate-y-1/2 text-[10px] font-medium text-neutral-500 underline hover:text-black"
                >
                  List
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
