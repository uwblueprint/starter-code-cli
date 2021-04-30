import fs from "fs";
import path from "path";
import chalk from "chalk";
import { TagNameToAction, CLIOptionActions } from "./scrubberTypes";

const TAG_START_CHAR = "{";
const TAG_END_CHAR = "}";

const FILE_TYPE_COMMENT: { [key: string]: string } = {
  js: "//",
  json: "//",
  ts: "//",
  py: "#",
  tsx: "//",
  jsx: "//",
};

export function getAllTagsAndSetToRemove(
  cliOptions: CLIOptionActions,
): TagNameToAction {
  const tags: TagNameToAction = {};
  Object.values(cliOptions).forEach((option) => {
    option.tagsToKeep?.forEach((tag) => {
      tags[tag] = "remove";
    });
  });
  return tags;
}

export function scrubFile(
  filePath: string,
  tags: TagNameToAction,
  isDryRun: boolean,
): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, { encoding: "utf8" }, (err, text) => {
      if (err) {
        reject(err);
      }

      const ext = filePath.split(".").pop();
      const commentType = ext && FILE_TYPE_COMMENT[ext];
      const scrubbedLines: string[] = [];
      let skip = false;
      let currentTag = "";

      const lines: string[] = text.split("\n");

      for (let i = 0; i < lines.length; ++i) {
        const line = lines[i];
        let tryProcessTag = true;

        if (!skip && line.length === 0) {
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
              chalk.yellowBright.bold(
                `WARNING line ${
                  i + 1
                }: possible malformed tag; tags must be on their own line preceded by '}' or followed by '{'`,
              ),
            );
            scrubbedLines.push(line);
            continue;
          }

          if (tokens[0] in tags || tokens[1] in tags) {
            const tag = tokens[0] in tags ? tokens[0] : tokens[1];
            const brace = tag === tokens[0] ? tokens[1] : tokens[0];

            if (brace === tokens[1] && brace !== TAG_START_CHAR) {
              reject(
                new Error(
                  `Malformed tag ${filePath}:line ${
                    i + 1
                  }: expected '{' after tag name`,
                ),
              );
            }

            if (brace === tokens[0] && brace !== TAG_END_CHAR) {
              reject(
                new Error(
                  `Malformed tag ${filePath}:line ${
                    i + 1
                  }: expected '}' before tag name`,
                ),
              );
            }

            if (tags[tag] === "remove") {
              if (!skip && brace === TAG_START_CHAR) {
                currentTag = tag;
                skip = true;
              } else if (tag === currentTag) {
                currentTag = "";
                skip = false;
              }
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

export function scrubDir(
  dir: string,
  ignoreFiles: Set<string>,
  tags: TagNameToAction,
  isDryRun: boolean,
): Promise<void[]> {
  const files = fs.readdirSync(dir);

  const promises = files.map<Promise<any>>((name: string) => {
    const filePath = path.join(dir, name);
    const stat = fs.statSync(filePath);

    if (stat.isFile() && !ignoreFiles.has(name)) {
      return scrubFile(filePath, tags, isDryRun);
    }

    if (stat.isDirectory() && !ignoreFiles.has(name)) {
      return scrubDir(filePath, ignoreFiles, tags, isDryRun);
    }

    return Promise.resolve();
  });

  return Promise.all(promises);
}

export function removeFileOrDir(filePath: string): Promise<void> {
  const exists = fs.existsSync(filePath);

  if (!exists) {
    console.warn(
      chalk.yellowBright.bold(
        `Attempted to remove ${filePath}, but ${filePath} was not found in the current directory`,
      ),
    );
    return Promise.resolve();
  }

  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
    return new Promise((resolve, reject) =>
      fs.rmdir(filePath, { recursive: true }, (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      }),
    );
  }

  if (stat.isFile()) {
    return new Promise((resolve, reject) =>
      fs.unlink(filePath, (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      }),
    );
  }

  console.warn(
    chalk.yellowBright.bold(
      `Attempted to remove ${filePath}, but ${filePath} is not a directory or file.`,
    ),
  );

  return Promise.resolve();
}
