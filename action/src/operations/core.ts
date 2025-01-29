import type { Ora } from "ora";
import type { GitProvider } from "../providers/core.js";

export interface IBaseOperation {
  preRun?(): Promise<boolean>;
  run(): Promise<boolean>;
  postRun?(): Promise<void>;
}

export abstract class BaseOperation implements IBaseOperation {
  protected translationBranchName?: string;

  constructor(
    protected ora: Ora,
    protected provider: GitProvider,
  ) {}

  abstract run(): Promise<boolean>;
}

export const gitConfig = {
  userName: "Languine",
  userEmail: "support@languine.ai",
};
