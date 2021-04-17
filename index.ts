#!/usr/bin/env node
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
  const options = await cli(process.argv);
  if (options) {
    await scrub(rootDir, options);
  }
}

run();
