export type DepartmentOption = {
  label: string;
  value: string;
};

const DEFAULT_DEPARTMENT_OPTIONS: DepartmentOption[] = [
  { label: "Engineering", value: "Engineering" },
  { label: "Operations", value: "Operations" },
  { label: "Support", value: "Support" },
];

export function buildDepartmentOptions(currentDepartment?: string | null): DepartmentOption[] {
  if (!currentDepartment || DEFAULT_DEPARTMENT_OPTIONS.some((option) => option.value === currentDepartment)) {
    return DEFAULT_DEPARTMENT_OPTIONS;
  }
  return [{ label: currentDepartment, value: currentDepartment }, ...DEFAULT_DEPARTMENT_OPTIONS];
}
