import cli from "./cli";

import Scrubber from "./scrubber/scrubber";
import { ScrubberAction } from "./scrubber/scrubberTypes";

async function scrub() {
  try {
    const actions: ScrubberAction[] = [{ type: "remove", tags: ["@remove"] }];
    const scrubber = new Scrubber();

    await scrubber.parseConfig("scrubber/scrubberConfig.json");
    await scrubber.start(actions);
  } catch (err) {
    console.log(err);
  }
}

cli(process.argv);
scrub();
