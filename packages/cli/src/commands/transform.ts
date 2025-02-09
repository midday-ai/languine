// import { Command } from "commander";
// import { applyTranslations, processDirectory } from "../utils/transform.js";

// export const transformCommand = new Command("transform")
//   .description("Transform JSX/TSX files to use translation keys")
//   .argument("[directory]", "Directory to process", "src")
//   .action(async (directory: string) => {
//     try {
//       console.log(`Processing directory: ${directory}`);
//       const extractedStrings = await processDirectory(directory);

//       console.log("\nExtracted strings:");
//       console.log(JSON.stringify(extractedStrings, null, 2));

//       console.log("\nApplying translations...");
//       await applyTranslations(extractedStrings);

//       console.log("\nTransformation complete!");
//     } catch (error) {
//       console.error("Error during transformation:", error);
//       process.exit(1);
//     }
//   });
