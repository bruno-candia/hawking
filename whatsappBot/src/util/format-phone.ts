import { CountryCode, getCountryCallingCode } from "libphonenumber-js";

export function formatPhoneNumber(
  phoneNumber: string,
  country: CountryCode,
): string {
  const sanitizedNumber = phoneNumber.replace(/\D/g, "");
  const countryCode = getCountryCallingCode(country);
  const finalNumber = `${countryCode}${sanitizedNumber.substring(sanitizedNumber.length - 11)}`;
  return `${finalNumber}@c.us`;
}
