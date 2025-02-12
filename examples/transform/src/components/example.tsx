import React, { useState } from "react";

interface UserProfile {
  name: string;
  notifications: number;
  lastLogin: Date;
  preferences: {
    theme: "light" | "dark";
    language: string;
  };
}

export function UserDashboard() {
  const [user, setUser] = useState<UserProfile>({
    name: "Alice Johnson",
    notifications: 5,
    lastLogin: new Date(),
    preferences: {
      theme: "light",
      language: "en",
    },
  });

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md">
        {/* Welcome message with dynamic name */}
        <h1 className="text-2xl font-bold mb-4">{t("UserDashboard.igBsgJyn", {
            name: user.name
          })}</h1>

        {/* Notification section with pluralization */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700">
            {t("UserDashboard.n3TVJuJc")}
          </h2>
          <p>{t("UserDashboard.3hzqosyI", {
              notifications: user.notifications
            })}{user.notifications !== 1 ? "s" : ""}
          </p>
          <button
            type="button"
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {t("UserDashboard.epc7GlsM")}
          </button>
        </div>

        {/* Preferences section with nested content */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">
            {t("UserDashboard.xenVu2nb")}
          </h2>

          <div className="flex items-center justify-between">
            <span>{t("UserDashboard.jYSWh388")}</span>
            <span className="capitalize">{t("UserDashboard.3IIZ9Q6w", {
              theme: user.preferences.theme
            })} mode</span>
          </div>

          <div className="flex items-center justify-between">
            <span>{t("UserDashboard.Gg3LT6P4")}</span>
            <span>
              {t("UserDashboard.cvN8el8E", {
                language: user.preferences.language
              })}
            </span>
          </div>

          <p className="text-sm text-gray-500">
            {t("UserDashboard.lmktKpQ1")}{user.lastLogin.toLocaleDateString()}
          </p>
        </div>

        {/* Action buttons with different states */}
        <div className="mt-8 space-x-4">
          <button
            type="button"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={() => setUser({ ...user, notifications: 0 })}
          >
            {t("UserDashboard.A828bRta")}
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            title={t("UserDashboard.NE4GlZzY")}
          >
            {t("UserDashboard.3L92GTGb")}
          </button>
        </div>

        {/* Footer with complex message */}
        <footer className="mt-8 pt-4 border-t text-sm text-gray-500">
          <p>
            {t("UserDashboard.hIULT0So")}
          </p>
          <p className="mt-2">
            {t("UserDashboard.7LKOMtwp")}
          </p>
        </footer>
      </div>
  );
}
