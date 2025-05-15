import React, { forwardRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countryList } from "@/lib/countries";

interface CountrySelectProps {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
}

export const CountrySelect = forwardRef<HTMLButtonElement, CountrySelectProps>(
  ({ value, onChange, error }, ref) => {
    return (
      <div className="w-full space-y-1">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger 
            ref={ref} 
            className={`w-full ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
          >
            <SelectValue placeholder="Select your country" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {countryList.map((country) => (
              <SelectItem key={country.code} value={country.name}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

CountrySelect.displayName = "CountrySelect";

export default CountrySelect;
