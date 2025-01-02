"use client";

import Link from "next/link";
import { useState } from "react";

function NPMIcon() {
  return (
    <svg
      width="17"
      height="16"
      viewBox="0 0 17 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_575_375)">
        <path
          d="M8.44571 1.71838H2.21851V14.2809H8.44507V4.88638H11.6131V14.2809H14.7811V1.71838H8.44571Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_575_375">
          <rect
            width="16"
            height="16"
            fill="white"
            transform="translate(0.5)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      width="15"
      height="14"
      viewBox="0 0 15 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_575_378)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.47914 0C3.61986 0 0.5 3.20833 0.5 7.17748C0.5 10.3502 2.499 13.0359 5.27214 13.9864C5.61886 14.0579 5.74586 13.832 5.74586 13.642C5.74586 13.4756 5.73443 12.9052 5.73443 12.311C3.793 12.7388 3.38871 11.4554 3.38871 11.4554C3.07671 10.6235 2.61443 10.4097 2.61443 10.4097C1.979 9.97004 2.66071 9.97004 2.66071 9.97004C3.36557 10.0176 3.73543 10.7068 3.73543 10.7068C4.35929 11.8 5.36457 11.4911 5.769 11.3009C5.82671 10.8375 6.01171 10.5166 6.20814 10.3384C4.65971 10.172 3.03057 9.55413 3.03057 6.79715C3.03057 6.01285 3.30771 5.37119 3.74686 4.87215C3.67757 4.69394 3.43486 3.95704 3.81629 2.97077C3.81629 2.97077 4.40557 2.7806 5.73429 3.70752C6.30316 3.55041 6.88982 3.47049 7.47914 3.46981C8.06843 3.46981 8.66914 3.55308 9.22386 3.70752C10.5527 2.7806 11.142 2.97077 11.142 2.97077C11.5234 3.95704 11.2806 4.69394 11.2113 4.87215C11.662 5.37119 11.9277 6.01285 11.9277 6.79715C11.9277 9.55413 10.2986 10.1601 8.73857 10.3384C8.99286 10.5642 9.21229 10.9919 9.21229 11.6693C9.21229 12.6318 9.20086 13.4043 9.20086 13.6418C9.20086 13.832 9.328 14.0579 9.67457 13.9866C12.4477 13.0358 14.4467 10.3502 14.4467 7.17748C14.4581 3.20833 11.3269 0 7.47914 0Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_575_378">
          <rect
            width="14"
            height="14"
            fill="white"
            transform="translate(0.5)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}

export function CopyInstall() {
  const [copied, setCopied] = useState(false);

  const copyCommand = () => {
    navigator.clipboard.writeText("npx languine@latest");
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div className="flex mt-4 border border-dashed border-muted-foreground p-2 px-4 text-sm w-full">
      <button
        type="button"
        onClick={copyCommand}
        className="flex items-center space-x-2"
      >
        <span className="text-secondary select-none">git: (main)</span>
        <span className="text-primary">$ npx languine@latest</span>
      </button>

      <div className="flex items-center space-x-2 ml-auto">
        <Link href="https://npmjs.com/package/languine">
          <NPMIcon />
        </Link>
        <Link href="https://git.new/midday-ai/languine">
          <GitHubIcon />
        </Link>
      </div>
    </div>
  );
}
