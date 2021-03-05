import fs from "fs";
import { ScrubberActionType, ScrubberConfig } from "./scrubberTypes";

async function getConfigFile(filename: string): Promise<ScrubberConfig> {
  try {
    const configString = await fs.readFileSync(filename, "utf8");
    return JSON.parse(configString);
  } catch (err) {
    console.log("Failed to read file ", filename);
    throw err;
  }
}

class Scrubber {
  tags: { [key: string]: ScrubberActionType } = {};

  async parseConfig(filename: string): Promise<void> {
    const config = await getConfigFile(filename);
    config.actions.forEach((action) => {
      action.tags.forEach((tag: string) => {
        this.tags[tag] = action.type;
      });
    });
  }

  async start(): Promise<void> {
    const text: string = await fs.readFileSync("test", "utf8");
    const lines: string[] = text.split("\n");
    const scrubbedLines: string[] = [];

    // TODO Handle nested tags

    const tagsSeen: string[] = [];
    let skip = false;

    for (let i = 0; i < lines.length; ++i) {
      const line = lines[i];

      if (line in this.tags) {
        if (tagsSeen.length && tagsSeen[tagsSeen.length - 1] === line) {
          tagsSeen.pop();
        } else {
          tagsSeen.push(line);
        }
        if (this.tags[line] === "remove" && tagsSeen.length < 2) {
          skip = tagsSeen.length > 0;
        }
        continue;
      }

      if (skip) continue;

      scrubbedLines.push(line);
    }
    await fs.writeFileSync("test", scrubbedLines.join("\n"));
  }
}

export default Scrubber;
