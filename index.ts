#!/usr/bin/env node
import cli from "./cli";
import { Options } from "./cli/optionTypes";

import Scrubber from "./scrubber/scrubber";

async function scrub(options: Options) {
  try {
    const scrubber = new Scrubber();

    await scrubber.parseConfig("scrubber/scrubberConfig.json");
    await scrubber.start(options);
  } catch (err) {
    console.log(err);
  }
}

async function run() {
  const options = await cli(process.argv);
  scrub(options);
}

run();
