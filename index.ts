import cli from "./cli";

import Scrubber from "./scrubber/scrubber";

async function scrub() {
  try {
    const scrubber = new Scrubber();
    await scrubber.parseConfig("scrubber/scrubberConfig.json");
    await scrubber.start();
  } catch (err) {
    console.log(err);
  }
}

cli(process.argv);
scrub();
