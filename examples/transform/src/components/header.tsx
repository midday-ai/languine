import React from "react";

export function Header() {
  return (
    <header>
        <nav>
          <ul>
            <li>
              <a href="/" title={t("Header.a_10")}>
                {t("Header.a_7")}
              </a>
            </li>
            <li>
              <a href="/about" title={t("Header.a_11")}>
                {t("Header.a_8")}
              </a>
            </li>
            <li>
              <a href="/contact" title={t("Header.a_12")}>
                {t("Header.a_9")}
              </a>
            </li>
          </ul>
        </nav>
      </header>
  );
}
