import React from "react";

export function Header() {
  return (
    <header>
        <nav>
          <ul>
            <li>
              <a href="/" title={t("Header.a_4")}>
                {t("Header.a")}
              </a>
            </li>
            <li>
              <a href="/about" title={t("Header.a_5")}>
                {t("Header.a_2")}
              </a>
            </li>
            <li>
              <a href="/contact" title={t("Header.a_6")}>
                {t("Header.a_3")}
              </a>
            </li>
          </ul>
        </nav>
      </header>
  );
}
