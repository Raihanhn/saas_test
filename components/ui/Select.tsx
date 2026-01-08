// components/ui/Select.tsx
"use client";

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  error?: string;
}

export default function Select({
  value,
  onChange,
  children,
  error 
}: SelectProps) {
  return (

     <div className="relative w-full mb-6">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none ${
          error ? "border-red-500" : "border-gray-300 focus:border-sky-500"
        }`}
      >
        {children}
      </select>
      {error && (
        <div className="absolute z-10 left-0 top-full mt-1 bg-red-500 text-white text-xs rounded-md px-2 py-1 shadow-md">
          <div className="absolute -top-1 left-2 w-2 h-2 bg-red-500 rotate-45"></div>
          {error}
        </div>
      )}
    </div>
  );
}
