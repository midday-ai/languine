import React from "react";

export function Hero() {
  return (
    <div>
        <h1>{t("Hero.h1_2")}</h1>
        <p>{t("Hero.p_2")}</p>

        <div>
          <button type="button">{t("Hero.button_3")}</button>
          <button type="button">{t("Hero.button_4")}</button>
        </div>

        <img
          alt={t("Hero.img_2")}
          src="https://placehold.co/600x400"
        />
      </div>
  );
}
