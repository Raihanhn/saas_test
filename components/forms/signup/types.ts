//components/forms/signup/types.ts
export interface SignupFormData {
  fullName: string;
  businessName: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
  currency: string;
  timezone: string;
  address: string;
  phone: string;
  website: string;
  logo: File | null;
  plan: string;
  paymentMethod: string;
}
