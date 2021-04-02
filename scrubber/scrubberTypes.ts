/*
Types required by the scrubber tool.
*/

import { BackendType, APIType, DatabaseType } from "../cli/optionTypes";

export type ScrubberActionType = "remove" | "keep";

export type ScrubberAction = {
  type: ScrubberActionType;
  tags: string[];
};

export type CLIOption = BackendType | APIType | DatabaseType | "auth";

export type CLIOptionActions = {
  [key in CLIOption]: {
    tagsToKeep?: string[];
    filesToDelete?: string[];
  };
};

export type ScrubberConfig = {
  cliOptionsToActions: CLIOptionActions;
  dirs: string[];
};

export type TagNameToAction = { [key: string]: ScrubberActionType };
