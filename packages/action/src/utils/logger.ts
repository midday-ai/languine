export class Logger {
  private static instance: Logger;
  private isDevMode: boolean;

  private constructor() {
    this.isDevMode = process.env.DEV_MODE === "true";
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public info(message: string): void {
    console.log(message);
  }

  public error(message: string | Error): void {
    console.error(message);
  }

  public debug(message: string): void {
    if (this.isDevMode) {
      console.log(`[DEBUG] ${message}`);
    }
  }

  public warn(message: string): void {
    console.warn(message);
  }
}

export const logger = Logger.getInstance();
