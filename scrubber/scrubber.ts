import chalk from "chalk";
import fs from "fs";
import glob from "glob";
import { Options } from "../cli/optionTypes";
import { ScrubberConfig, TagNameToAction } from "./scrubberTypes";
import {
  getAllTagsAndSetToRemove,
  scrubDir,
  removeFileOrDir,
} from "./scrubUtils";

async function getConfigFile(filename: string): Promise<ScrubberConfig> {
  try {
    const configString = await fs.readFileSync(filename, "utf8");
    return JSON.parse(configString);
  } catch (err) {
    console.error(chalk.red.bold("Failed to read file ", filename));
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
  async start(options: Options, isDryRun: boolean = false): Promise<any> {
    if (!this.config) throw new Error("Missing config.");

    // Directory to scrub.
    const dirToScrubPath = `${process.cwd()}/${this.config?.dir}`;

    const tags = { ...this.tags };
    const filesToDelete = new Set<string>();

    const ignoreFiles = new Set<string>();

    this.config.ignore.forEach((filename) => {
      ignoreFiles.add(filename);
    });

    // Set the tags to keep and which files to delete based on selected technologies.
    Object.values(options).forEach((val) => {
      if (!this.config || !val) return;

      const action = this.config.cliOptionsToActions[val];

      action.filesToDelete?.forEach((globPattern: string) => {
        glob
          .sync(globPattern, { dot: false, cwd: dirToScrubPath })
          .forEach((filename: string) => {
            if (ignoreFiles.has(filename)) return;
            filesToDelete.add(`${dirToScrubPath}/${filename}`);
          });
      });

      action.tagsToKeep?.forEach((tag: string) => {
        tags[tag] = "keep";
      });
    });

    const removeFilePromises = Array.from(
      filesToDelete,
    ).map((filePath: string) => removeFileOrDir(filePath));

    const scrubDirPromise = scrubDir(
      this.config.dir,
      ignoreFiles,
      tags,
      isDryRun,
    );

    // Remove files first, then scrub.
    return Promise.all(removeFilePromises)
      .then(() => scrubDirPromise)
      .catch((err) => Promise.reject(err));
  }
}

export default Scrubber;
