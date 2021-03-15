/*
Types required by the scrubber tool.
*/

export type ScrubberActionType = "remove" | "keep";

export type ScrubberAction = {
  type: ScrubberActionType;
  tags: string[];
};

export type ScrubberConfig = {
  actions: ScrubberAction[];
  dirs: string[];
};

export type TagNameToAction = { [key: string]: ScrubberActionType };
