/**
 * The API's nullable string fields (Description, Email, Phone, Address, Notes)
 * want null, not "". An empty input should clear the field, not store a blank.
 */
export function nullIfBlank(value?: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
