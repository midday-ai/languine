"use client";

import { useI18n } from "@/locales/client";

export function Info() {
  const t = useI18n();

  return (
    <>
      <div className="flex flex-col space-y-12">
        <div>
          <h2 className="text-2xl font-bold mb-4">Smart Translation Engine</h2>
          <ul className="text-secondary mt-4">
            <li>
              <span className="text-2xl">◇</span> Intelligent translation across
              all major languages
            </li>
            <li>
              <span className="text-2xl">◇</span> Brand voice preservation
              across languages
            </li>
            <li>
              <span className="text-2xl">◇</span> Industry-specific terminology
              handling
            </li>
            <li>
              <span className="text-2xl">◇</span> Advanced linguistic features
              support
            </li>
            <li>
              <span className="text-2xl">◇</span> Real-time translation updates
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Easy Implementation</h2>
          <ul className="text-secondary mt-4">
            <li>
              <span className="text-2xl">◇</span> Quick setup with your tech
              stack
            </li>
            <li>
              <span className="text-2xl">◇</span> Flexible file format
              compatibility
            </li>
            <li>
              <span className="text-2xl">◇</span> Smart content structure
              preservation
            </li>
            <li>
              <span className="text-2xl">◇</span> Efficient translation asset
              organization
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Built for Developers</h2>
          <ul className="text-secondary mt-4">
            <li>
              <span className="text-2xl">◇</span> Intuitive CLI
            </li>
            <li>
              <span className="text-2xl">◇</span> Automated CI/CD integration
            </li>
            <li>
              <span className="text-2xl">◇</span> Version control with Git
            </li>
            <li>
              <span className="text-2xl">◇</span> Streamlined localization
              workflow
            </li>
            <li>
              <span className="text-2xl">◇</span> Documentation and support
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
