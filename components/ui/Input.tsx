// components/ui/Input.tsx
"use client";

interface InputProps {
  placeholder?: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function Input({
  placeholder,
  value,
  type = "text",
  onChange,
  error,
}: InputProps) {
  return (

    <div className="relative w-full mb-6">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none ${
          error ? "border-red-500" : "border-gray-300 focus:border-emerald-500"
        }`}
      />
      {error && (
        <div className="absolute z-10 left-0 top-full mt-1 bg-red-500 text-white text-xs rounded-md px-2 py-1 shadow-md animate-slideDown">
          <div className="absolute -top-1 left-2 w-2 h-2 bg-red-500 rotate-45"></div>
          {error}
        </div>
      )}
    </div>
  );
}
