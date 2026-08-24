export function guestCookieName(code: string) {
  return `sabaib_guest_${code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "")}`;
}
