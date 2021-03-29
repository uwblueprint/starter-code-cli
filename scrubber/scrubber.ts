import fs from "fs";
import path from "path";
import {
  ScrubberAction,
  TagNameToAction,
  ScrubberConfig,
} from "./scrubberTypes";

const TAG_START_CHAR = "{";
const TAG_END_CHAR = "}";

const FILE_TYPE_COMMENT: { [key: string]: string } = {
  js: "//",
  json: "//",
  ts: "//",
  py: "#",
};

function scrubberActionsToDict(actions: ScrubberAction[]): TagNameToAction {
  const dict: TagNameToAction = {};
  actions.forEach((action) => {
    action.tags.forEach((tag: string) => {
      dict[tag] = action.type;
    });
  });
  return dict;
}

async function getConfigFile(filename: string): Promise<ScrubberConfig> {
  try {
    const configString = await fs.readFileSync(filename, "utf8");
    return JSON.parse(configString);
  } catch (err) {
    console.error("Failed to read file ", filename);
    throw err;
  }
}

async function scrubFile(
  filePath: string,
  tags: TagNameToAction,
  isDryRun: boolean,
): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, { encoding: "utf8" }, async (err, text) => {
      if (err) {
        reject(err);
      }

      const ext = filePath.split(".").pop();
      const commentType = ext && FILE_TYPE_COMMENT[ext];
      const scrubbedLines: string[] = [];
      let skip = false;

      const lines: string[] = text.split("\n");

      for (let i = 0; i < lines.length; ++i) {
        const line = lines[i];
        let tryProcessTag = true;

        if (line.length === 0) {
          scrubbedLines.push(line);
          continue;
        }

        // Split on whitespace
        const tokens = line.trim().split(/[ ]+/);

        if (commentType) {
          if (tokens[0] !== commentType) {
            tryProcessTag = false;
          }
          tokens.shift();
        }

        if (tryProcessTag) {
          if (tokens[0] in tags && tokens.length !== 2) {
            console.warn(
              `WARNING line ${
                i + 1
              }: possible malformed tag; tags must be on their own line preceded by '}' or followed by '{'`,
            );
            scrubbedLines.push(line);
            continue;
          }

          if (tokens[0] in tags || tokens[1] in tags) {
            const tag = tokens[0] in tags ? tokens[0] : tokens[1];
            const brace = tag === tokens[0] ? tokens[1] : tokens[0];

            if (brace === tokens[1] && brace !== TAG_START_CHAR) {
              throw new Error(
                `Malformed tag ${filePath}:line ${
                  i + 1
                }: expected '{' after tag name`,
              );
            }

            if (brace === tokens[0] && brace !== TAG_END_CHAR) {
              throw new Error(
                `Malformed tag ${filePath}:line ${
                  i + 1
                }: expected '}' before tag name`,
              );
            }

            // NOTE: nested tagging is not currently expected and will lead to unexpected behaviour.

            if (tags[tag] === "remove") {
              skip = brace === TAG_START_CHAR;
            }

            // We always scrub tags from the final file.
            continue;
          }
        }

        if (skip) {
          if (isDryRun) {
            console.log(`Skipping line ${i + 1}`);
          }
          continue;
        }

        scrubbedLines.push(line);
      }

      if (isDryRun) return;

      fs.writeFileSync(filePath, scrubbedLines.join("\n"));

      resolve();
    });
  });
}

async function scrubDir(
  dir: string,
  tags: TagNameToAction,
  isDryRun: boolean,
): Promise<void[]> {
  const files = fs.readdirSync(dir);
  const promises = files.map<Promise<any>>((name: string) => {
    const filePath = path.join(dir, name);
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      return scrubFile(filePath, tags, isDryRun);
    }
    if (stat.isDirectory()) {
      return scrubDir(filePath, tags, isDryRun);
    }
    return Promise.resolve();
  });
  return Promise.all(promises);
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
