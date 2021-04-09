import fs from "fs";
import { Options } from "../cli/optionTypes";
import { ScrubberConfig, TagNameToAction } from "./scrubberTypes";
import { getAllTagsAndSetToRemove, scrubDir, removeFile } from "./scrubUtils";

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

  config?: ScrubberConfig;

  async parseConfig(filename: string) {
    // TODO validate config (e.g.properly formed tag names)
    this.config = await getConfigFile(filename);
    this.tags = getAllTagsAndSetToRemove(this.config.cliOptionsToActions);
  }

  // Scrub files
  async start(options: Options, isDryRun: boolean = false): Promise<void[][]> {
    if (!this.config) throw new Error("Missing config.");

    const tags = { ...this.tags };
    const filesToDelete = new Set<string>();

    Object.values(options).forEach((val) => {
      if (!this.config || !val) return;

      const action = this.config.cliOptionsToActions[val];

      action.filesToDelete?.forEach((filename: string) => {
        filesToDelete.add(filename);
      });

      action.tagsToKeep?.forEach((tag) => {
        tags[tag] = "keep";
      });
    });

    const removeFilePromises = Array.from(
      filesToDelete,
    ).map((filePath: string) => removeFile(filePath));
    const scrubDirPromise = this.config.dirs.map((dir) =>
      scrubDir(dir, tags, isDryRun),
    );

    // TODO: specify file extensions?
    return Promise.all(
      (<Promise<any>[]>removeFilePromises).concat(scrubDirPromise),
    );
  }
}

export default Scrubber;
