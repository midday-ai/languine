"use client";

interface UserPreferences {
  lastOrganizationId: string;
  lastProjectSlug: string;
}

const PREFERENCES_COOKIE_NAME = "user-preferences";
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

export function saveUserPreferences(preferences: Partial<UserPreferences>) {
  const existingPreferences = getUserPreferences();
  const newPreferences = {
    ...existingPreferences,
    ...preferences,
  };

  document.cookie = `${PREFERENCES_COOKIE_NAME}=${JSON.stringify(newPreferences)}; path=/; max-age=${THIRTY_DAYS};`;
}

export function getUserPreferences(): Partial<UserPreferences> {
  const cookies = document.cookie.split("; ");
  const preferenceCookie = cookies.find((row) =>
    row.startsWith(`${PREFERENCES_COOKIE_NAME}=`),
  );

  if (preferenceCookie) {
    try {
      const value = preferenceCookie.split("=")[1];
      return JSON.parse(decodeURIComponent(value));
    } catch {
      return {};
    }
  }

  return {};
}
