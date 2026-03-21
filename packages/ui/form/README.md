# @supportops/ui-form

Shared form fields built on top of MUI + react-hook-form.

## PhoneNumberField

`PhoneNumberField` is a reusable combined field for:
- country calling code selector (left)
- phone number input (right)

It is designed to look and behave as one control.

### Quick usage

```tsx
import { PhoneNumberField } from "@supportops/ui-form";
import type { PhoneCountryOption } from "@supportops/ui-form";

type FormValues = {
  phoneCountry: "US" | "VN";
  phoneNumber: string;
};

const phoneCountryOptions: PhoneCountryOption<FormValues["phoneCountry"]>[] = [
  { value: "US", label: "🇺🇸 (+1)", flag: "🇺🇸", countryName: "United States", dialingCode: "1" },
  { value: "VN", label: "🇻🇳 (+84)", flag: "🇻🇳", countryName: "Vietnam", dialingCode: "84" },
];

<PhoneNumberField
  control={control}
  label="Phone number"
  countryName="phoneCountry"
  phoneName="phoneNumber"
  countryOptions={phoneCountryOptions}
  countryAriaLabel="Country code"
  phoneAriaLabel="Phone number"
  phonePlaceholder="e.g. 3456 789"
  searchPlaceholder="Search country..."
  noOptionsText="No country found"
  popupWidthPx={340}
  countryWidthPx={128}
/>;
```

### Required props

- `control`: react-hook-form `control`
- `countryName`: form field name for country code
- `phoneName`: form field name for local phone number
- `countryOptions`: country options with metadata (`flag`, `countryName`, `dialingCode`)

### Optional props

- `label`
- `countryAriaLabel`
- `phoneAriaLabel`
- `phonePlaceholder`
- `searchPlaceholder`
- `noOptionsText`
- `countryRules`
- `phoneRules`
- `countryWidthPx` (default: `128`)
- `popupWidthPx` (default: `340`)
