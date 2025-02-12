import React from "react";

export function Header() {
  return (
    <header>
      <nav>
        <ul>
          <li>
            <a href="/" title={t("Header.KxxLQvdb")}>
              {t("Header.ZdgOGMMi")}
            </a>
          </li>
          <li>
            <a href="/about" title={t("Header.zyCSuTVL")}>
              {t("Header.eHmwS9cv")}
            </a>
          </li>
          <li>
            <a href="/contact" title={t("Header.r57XhiS6")}>
              {t("Header.Fidt6zxV")}
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
