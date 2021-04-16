import fs from "fs";
import {
  ScrubberAction,
  TagNameToAction,
  ScrubberConfig,
} from "./scrubberTypes";
import { scrubberActionsToDict, scrubDir } from "./scrubUtils";

async function getConfigFile(filename: string): Promise<ScrubberConfig> {
  try {
    const configString = await fs.readFileSync(filename, "utf8");
    return JSON.parse(configString);
  } catch (err) {
    console.error("Failed to read file ", filename);
    throw err;
  }
}

class Scrubber {
  tags: TagNameToAction = {};

  dirs: string[] = [];

  async parseConfig(filename: string): Promise<void> {
    // TODO validate config (e.g.properly formed tag names)
    const config = await getConfigFile(filename);
    this.tags = scrubberActionsToDict(config.actions);
    this.dirs = config.dirs;
  }

  // Scrub files
  async start(
    actions: ScrubberAction[],
    isDryRun: boolean = false,
  ): Promise<void[][]> {
    const tags = { ...this.tags, ...scrubberActionsToDict(actions) };

    // TODO: specify file extensions?
    return Promise.all(this.dirs.map((dir) => scrubDir(dir, tags, isDryRun)));
  }
}

export default Scrubber;
