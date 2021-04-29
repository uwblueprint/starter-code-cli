export type BackendType = "python" | "typescript";

export type APIType = "rest" | "graphql";

export type DatabaseType = "postgresql" | "mongodb";

export type AuthType = "auth" | "no-auth";

export type Options = {
  backend: BackendType;
  api: APIType;
  database: DatabaseType;
  auth: AuthType;
};

export type CommandLineOptions = {
  backend?: BackendType;
  api?: APIType;
  database?: DatabaseType;
  auth?: boolean;
  outputDir?: string;
  testing?: boolean;
};

export type UserResponse = {
  appOptions: Options;
  outputDir: string;
};
