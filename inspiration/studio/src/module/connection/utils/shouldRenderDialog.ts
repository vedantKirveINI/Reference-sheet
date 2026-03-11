export function shouldRenderDialog(auth_type: string): boolean {
  if (
    auth_type === "api-key" ||
    auth_type === "basic" ||
    auth_type === "custom"
  ) {
    return true;
  }

  return false;
}
