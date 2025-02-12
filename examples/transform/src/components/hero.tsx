import React from "react";

export function Hero() {
  return (
    <div>
        <h1>{t("Hero.f2PG97Zt")}</h1>
        <p>{t("Hero.GFxkFgzo")}</p>

        <div>
          <button type="button">{t("Hero.vwZxFatE")}</button>
          <button type="button">{t("Hero.7QkIhD5s")}</button>
        </div>

        <img
          alt={t("Hero.uTHvBW7X")}
          src="https://placehold.co/600x400"
        />
      </div>
  );
}
