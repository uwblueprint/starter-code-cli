#!/usr/bin/env node
import chalk from "chalk";
import cli from "./cli";
import { Options } from "./cli/optionTypes";

import Scrubber from "./scrubber/scrubber";

async function scrub(rootDir: string, options: Options) {
  try {
    const scrubber = new Scrubber();

    await scrubber.parseConfig(`${rootDir}/scrubber/scrubberConfig.json`);
    await scrubber.start(options);
  } catch (err) {
    console.log(err);
  }
}

async function run() {
  const rootDir = __dirname;
  try {
    const options = await cli(process.argv);
    await scrub(rootDir, options);
  } catch (err) {
    console.log(chalk.red.bold((err as Error).message));
  }
}

run();
