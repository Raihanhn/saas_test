//components/forms/signup/StepTwoBussiness.tsx
import { useState } from "react";
import { SignupFormData } from "@/components/forms/signup/types";
import Input from "@/components/ui/Input";


interface Props {
  form: SignupFormData;
  update: (key: keyof SignupFormData, value: any) => void;
}

export default function StepTwoBusiness({ form, update, validateRef }: Props & { validateRef: React.MutableRefObject<() => boolean> }) {

   const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.address.trim()) newErrors.address = "Business address is required";
    else if (form.address.trim().length < 5)
      newErrors.address = "Business address must be at least 5 characters";

    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\+?\d{7,15}$/.test(form.phone))
      newErrors.phone = "Phone number is not valid";

    if (!form.website && !/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(form.website))
      newErrors.website = "Website URL is not valid";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  validateRef.current = validate;


  return (
    <>
      <h2 className="text-lg font-semibold mb-4">Business Information</h2>

      <Input
        placeholder="Business Address"
        value={form.address}
        onChange={(v) => update("address", v)}
        error={errors.address}
      />


      <Input
        placeholder="Business Phone Number"
        value={form.phone}
        onChange={(v) => update("phone", v)}
        error={errors.phone}
      />


      <Input
        placeholder="Business Website"
        value={form.website}
        onChange={(v) => update("website", v)}
        error={errors.website}
      />

      <label className="mb-3 flex items-center justify-between rounded-lg border border-gray-300 px-4 py-3 text-sm cursor-pointer">
        <span className="text-gray-600">
          Company Logo <span className="text-gray-400">(Optional)</span>
        </span>
        <input
          type="file"
          className="cursor-pointer"
          accept="image/*"
          onChange={(e) => update("logo", e.target.files?.[0] || null)}
        />
      </label>


    </>
  );
}
