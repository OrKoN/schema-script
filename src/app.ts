import * as glob from "glob";
import { Preprocessor } from "./lib/Preprocessor";

export class App {
  private dir: string;

  constructor(dir: string) {
    this.dir = dir;
  }

  public async run() {
    const schemaPath = await this.glob(this.dir + "/**/*.schema.json");
    const preprocessor = new Preprocessor(schemaPath);
    return await preprocessor.compile();
  }

  private async glob(pattern: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      glob(pattern, (err, files) => {
        if (err) {
          reject(err);
        } else {
          resolve(files);
        }
      });
    });
  }
}
