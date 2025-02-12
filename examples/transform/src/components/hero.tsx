import React from "react";

export function Hero() {
  return (
    <div>
        <h1>{t("Hero.h1")}</h1>
        <p>{t("Hero.p")}</p>

        <div>
          <button type="button">{t("Hero.button")}</button>
          <button type="button">{t("Hero.button_2")}</button>
        </div>

        <img
          alt={t("Hero.img")}
          src="https://placehold.co/600x400"
        />
      </div>
  );
}
