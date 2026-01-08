//components/forms/signup/StepOnePersonal.tsx
import { useState } from "react";
import { SignupFormData } from "@/components/forms/signup/types";
import countries from "@/lib/country.json";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

interface Props {
  form: SignupFormData;
  update: (key: keyof SignupFormData, value: any) => void;
}

export default function StepOnePersonal({ form, update, validateRef }: Props & { validateRef: React.MutableRefObject<() => boolean> }) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedCountry = countries.find((c) => c.name === form.country);

  const currencyOptions = selectedCountry
    ? [selectedCountry.currency]
    : Array.from(new Set(countries.map((c) => c.currency)));

  const timezoneOptions = selectedCountry
    ? selectedCountry.timezones.map((t) => t.name)
    : [];

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.fullName.trim()) newErrors.fullName = "Full Name is required";
    else if (form.fullName.trim().length < 3)
      newErrors.fullName = "Full Name must be at least 3 characters";

    if (!form.businessName.trim())
      newErrors.businessName = "Business Name is required";

    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Email is not valid";

    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (!form.confirmPassword)
      newErrors.confirmPassword = "Confirm your password";
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!form.country) newErrors.country = "Country is required";
    if (!form.currency) newErrors.currency = "Currency is required";
    if (!form.timezone) newErrors.timezone = "Timezone is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  validateRef.current = validate;

  return (
    <>
      <h2 className="text-lg font-semibold mb-4">Personal Information</h2>

      <Input
        placeholder="Full Name"
        value={form.fullName}
        onChange={(v) => update("fullName", v)}
        error={errors.fullName}
      />

      <Input
        placeholder="Agency / Business Name"
        value={form.businessName}
        onChange={(v) => update("businessName", v)}
        error={errors.businessName}
      />

      <Input
        placeholder="Work Email Address"
        value={form.email}
        onChange={(v) => update("email", v)}
        error={errors.email}
      />

     

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(v) => update("password", v)}
          error={errors.password}
        />

       

        <Input
          type="password"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={(v) => update("confirmPassword", v)}
          error={errors.confirmPassword}
        />

        
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select value={form.country} onChange={(v) => update("country", v)} error={errors.country}>
          <option value="">Select Country</option>
          {countries.map((c) => (
            <option key={c.code} value={c.name}>
              {c.name}
            </option>
          ))}
        </Select>


        <Select value={form.currency} onChange={(v) => update("currency", v)} error={errors.currency}>
          <option value="">Select Currency</option>
          {currencyOptions.map((cur) => (
            <option key={cur} value={cur}>
              {cur}
            </option>
          ))}
        </Select>

      
        <Select value={form.timezone} onChange={(v) => update("timezone", v)} error={errors.timezone}
          >
          <option value="">Select Timezone</option>
          {timezoneOptions.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </Select>
       
      </div>

    </>
  );
}
