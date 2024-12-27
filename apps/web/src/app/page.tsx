import { Commands } from "@/components/commands";
import { Install } from "@/components/install";
import { Logo } from "@/components/logo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Page() {
  return (
    <Tabs
      defaultValue="get-started"
      className="h-screen w-screen overflow-hidden"
    >
      <div className="flex justify-between bg-[#1B1B1B]">
        <TabsList className="w-full flex justify-start rounded-none bg-[#1B1B1B]">
          <TabsTrigger value="get-started">Get started</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <a href="https://github.com/midday-ai/languine">
            <button
              className="text-sm font-medium h-full px-4 text-primary"
              type="button"
            >
              GitHub
            </button>
          </a>
        </TabsList>

        <div className="ml-auto">
          <a href="https://midday.ai?utm_source=languine">
            <button
              className="text-sm font-medium h-full whitespace-nowrap px-4 opacity-50 hover:opacity-100 transition-opacity"
              type="button"
            >
              Made by midday
            </button>
          </a>
        </div>
      </div>

      <div className="p-6 mt-4 h-full overflow-y-auto pb-[100px]">
        <TabsContent value="get-started">
          <Logo />
          <div className="text-sm font-mono">
            <p>Translate your application with Languine CLI powered by AI.</p>
            <Commands />
          </div>
        </TabsContent>
        <TabsContent value="documentation">
          <Install />
        </TabsContent>
        <TabsContent value="about">
          <div className="text-sm font-mono space-y-6 max-w-2xl">
            <p>
              Languine helps developers focus on building features, not
              wrestling with localization challenges. With its robust tooling
              and AI capabilities, it transforms what was once a tedious, manual
              process into an automated, developer-friendly experience.
            </p>
            <p>
              Powered by modern AI models, Languine delivers contextually
              accurate translations across 100+ languages in seconds. Its
              automation-first approach detects changes via Git diff to
              automatically update, add, or remove translations as needed.
            </p>
            <p>
              The smart detection system identifies new, modified, or removed
              translation keys in your codebase, handling multiple file formats
              (.json, .ts, .md, .yaml, .po, .xml, .plist, .xcstrings,
              .stringsdict) with precise parsing and file-specific updates.
            </p>

            <p>
              Languine comes with ready-to-use presets for React Native, Expo,
              and more to get started in seconds.
            </p>

            <p>
              Built with TypeScript and designed for developers, Languine
              integrates natively with version control systems and your
              preferred workflow. It helps maintain uniform tone and style
              across all translated content.
            </p>

            <p>
              Special thanks to{" "}
              <a
                href="https://vercel.com?utm_source=languine"
                className="underline"
              >
                Vercel
              </a>{" "}
              for the AI SDK.
            </p>
            <p>
              Made with 🤍 by Midday - your all-in-one tool for invoicing, time
              tracking, file reconciliation, storage, financial overview & AI
              assistance for freelancers. Find us on{" "}
              <a
                href="https://github.com/midday-ai/languine"
                className="underline"
              >
                GitHub
              </a>
              .
            </p>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
