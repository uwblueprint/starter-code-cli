/*
Types required by the scrubber tool.
*/

import {
  BackendType,
  APIType,
  DatabaseType,
  AuthType,
  FileStorageType,
} from "../cli/optionTypes";

export type ScrubberActionType = "remove" | "keep";

export type ScrubberAction = {
  type: ScrubberActionType;
  tags: string[];
};

export type CLIOption =
  | BackendType
  | APIType
  | DatabaseType
  | AuthType
  | FileStorageType;

export type CLIOptionActions = {
  [key in CLIOption]: {
    tagsToKeep?: string[];
    filesToDelete?: string[];
  };
};

export type ScrubberConfig = {
  cliOptionsToActions: CLIOptionActions;
  dir: string; // Directories to operate on (relative path).
  ignore: string[]; // Directory and file names to ignore.
};

export type TagNameToAction = { [key: string]: ScrubberActionType };
