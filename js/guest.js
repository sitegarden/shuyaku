const GUEST_NAME_KEY = "shuyakuGuestName";
const GUEST_ID_KEY = "shuyakuGuestId";

export function getGuestName() {
  return localStorage.getItem(GUEST_NAME_KEY) || "";
}

export function saveGuestName(name) {
  const cleanedName = String(name || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 16);

  if (!cleanedName) {
    return false;
  }

  localStorage.setItem(GUEST_NAME_KEY, cleanedName);
  return true;
}

export function getGuestId() {
  let guestId = localStorage.getItem(GUEST_ID_KEY);

  if (!guestId) {
    guestId = `guest_${crypto.randomUUID()}`;
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }

  return guestId;
}
