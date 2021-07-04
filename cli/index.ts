import boxen from "boxen";
import chalk from "chalk";
import figlet from "figlet";
import inquirer from "inquirer";
import shell from "shelljs";
import yargs from "yargs/yargs";
import {
  Options,
  CommandLineOptions,
  UserResponse,
  APIType,
  BackendType,
  DatabaseType,
  AuthType,
  FileStorageType,
  CSVExportType,
} from "./optionTypes";

type CommandLineArgs = Array<string>;

type Choice<T> = {
  name: string;
  value: T;
};

type OptionConfig<T> = {
  id: string;
  description: string;
  message?: string;
  choices: ReadonlyArray<Choice<T>>;
};

type OptionConfigs = {
  backend: OptionConfig<BackendType>;
  api: OptionConfig<APIType>;
  database: OptionConfig<DatabaseType>;
  auth: OptionConfig<void>;
  fileStorage: OptionConfig<void>;
  csvExport: OptionConfig<void>;
  outputDir: OptionConfig<void>;
  testing: OptionConfig<void>;
};

const OPTIONS: OptionConfigs = {
  backend: {
    id: "b",
    description: "Backend language",
    message: "Which backend language would you like?",
    choices: [
      { name: "TypeScript (Node/Express)", value: "typescript" },
      { name: "Python (Flask)", value: "python" },
    ],
  },
  api: {
    id: "a",
    description: "API type",
    message: "Which API would you like?",
    choices: [
      { name: "REST", value: "rest" },
      { name: "GraphQL", value: "graphql" },
    ],
  },
  database: {
    id: "d",
    description: "Database",
    message: "Which database would you like?",
    choices: [
      { name: "PostgreSQL", value: "postgresql" },
      { name: "MongoDB", value: "mongodb" },
    ],
  },
  auth: {
    id: "au",
    description: "Include built-in auth features",
    message: "Would you like built-in auth features?",
    choices: [],
  },
  fileStorage: {
    id: "f",
    description: "Include built-in file storage features",
    message: "Would you like built-in file storage features?",
    choices: [],
  },
  csvExport: {
    id: "c",
    description: "Include built-in csv export features",
    message: "Would you like built-in csv export features?",
    choices: [],
  },
  outputDir: {
    id: "o",
    description: "Output directory",
    message:
      "Which directory would you like the starter code folder to be in (default is current directory)?",
    choices: [],
  },
  testing: {
    id: "t",
    description: "Test locally without cloning repo",
    choices: [],
  },
};

const OPTION_COMBINATION_DENY_LIST = [
  [
    { optionType: "backend", value: "python" },
    { optionType: "api", value: "graphql" },
  ],
];

const validateCommandLineOptions = (
  commandLineOptions: CommandLineOptions,
): void => {
  OPTION_COMBINATION_DENY_LIST.forEach((combination) => {
    if (
      combination.every(
        (option) =>
          commandLineOptions[option.optionType as keyof CommandLineOptions] ===
          option.value,
      )
    ) {
      const formattedCombination = combination.map((c) => c.value).join(", ");
      // TODO: custom error type would be a nice-to-have
      throw new Error(
        `Sorry, we currently do not support the following combination: ${formattedCombination}`,
      );
    }
  });
};

const parseArguments = (args: CommandLineArgs): CommandLineOptions => {
  const { argv } = yargs(args.slice(2)).options({
    backend: {
      alias: OPTIONS.backend.id,
      type: "string",
      description: OPTIONS.backend.description,
      choices: OPTIONS.backend.choices.map((choice) => choice.value),
    },
    api: {
      alias: OPTIONS.api.id,
      type: "string",
      description: OPTIONS.api.description,
      choices: OPTIONS.api.choices.map((choice) => choice.value),
    },
    database: {
      alias: OPTIONS.database.id,
      type: "string",
      description: OPTIONS.database.description,
      choices: OPTIONS.database.choices.map((choice) => choice.value),
    },
    auth: {
      alias: OPTIONS.auth.id,
      type: "boolean",
      description: OPTIONS.auth.description,
    },
    fileStorage: {
      alias: OPTIONS.fileStorage.id,
      type: "boolean",
      description: OPTIONS.fileStorage.description,
    },
    csvExport: {
      alias: OPTIONS.csvExport.id,
      type: "boolean",
      description: OPTIONS.csvExport.description,
    },
    outputDir: {
      alias: OPTIONS.outputDir.id,
      type: "string",
      description: OPTIONS.outputDir.description,
    },
    testing: {
      alias: OPTIONS.testing.id,
      type: "boolean",
      description: OPTIONS.testing.description,
    },
  });

  return {
    backend: argv.backend as BackendType,
    api: argv.api as APIType,
    database: argv.database as DatabaseType,
    auth: argv.auth,
    fileStorage: argv.fileStorage,
    csvExport: argv.csvExport,
    outputDir: argv.outputDir,
    testing: argv.testing,
  };
};

const promptOptions = async (
  options: CommandLineOptions,
): Promise<UserResponse> => {
  let prompts = [];
  const tsChoice = OPTIONS.backend.choices.find(
    (choice) => choice.value === "typescript",
  );

  if (!options.backend) {
    prompts.push({
      type: "list",
      name: "backend",
      message: OPTIONS.backend.message,
      choices: options.api === "graphql" ? [tsChoice] : OPTIONS.backend.choices,
    });
  }

  let answers = await inquirer.prompt(prompts);
  prompts = [];

  const backend = options.backend || answers.backend;
  const restChoice = OPTIONS.api.choices.find(
    (choice) => choice.value === "rest",
  );

  if (!options.api) {
    prompts.push({
      type: "list",
      name: "api",
      message: OPTIONS.api.message,
      choices: backend === "python" ? [restChoice] : OPTIONS.api.choices,
    });
  }

  if (!options.database) {
    prompts.push({
      type: "list",
      name: "database",
      message: OPTIONS.database.message,
      choices: OPTIONS.database.choices,
    });
  }

  if (!options.auth) {
    prompts.push({
      type: "confirm",
      name: "auth",
      message: OPTIONS.auth.message,
      default: false,
    });
  }

  if (!options.fileStorage) {
    prompts.push({
      type: "confirm",
      name: "fileStorage",
      message: OPTIONS.fileStorage.message,
      default: false,
    });
  }

  if (!options.csvExport) {
    prompts.push({
      type: "confirm",
      name: "csvExport",
      message: OPTIONS.csvExport.message,
      default: false,
    });
  }

  if (!options.outputDir) {
    prompts.push({
      type: "output",
      name: "outputDir",
      message: OPTIONS.outputDir.message,
      default: ".",
    });
  }

  answers = await inquirer.prompt(prompts);

  return {
    appOptions: {
      backend,
      api: options.api || answers.api,
      database: options.database || answers.database,
      auth: (options.auth || answers.auth ? "auth" : "no-auth") as AuthType,
      fileStorage: (options.fileStorage || answers.fileStorage
        ? "file-storage"
        : "no-file-storage") as FileStorageType,
      csvExport: (options.csvExport || answers.csvExport
        ? "csv-export"
        : "no-csv-export") as CSVExportType,
    },
    outputDir: options.outputDir || answers.outputDir,
  };
};

const confirmPrompt = async (options: Options) => {
  const backendName = OPTIONS.backend.choices.find(
    (choice) => choice.value === options.backend,
  )?.name;

  const apiName = OPTIONS.api.choices.find(
    (choice) => choice.value === options.api,
  )?.name;

  const databaseName = OPTIONS.database.choices.find(
    (choice) => choice.value === options.database,
  )?.name;

  const message =
    `You have chosen to create a ${backendName} app with a ` +
    `${apiName} API, ${databaseName} database, ${
      options.auth === "auth" ? "" : "no "
    }built-in auth, ${
      options.fileStorage === "file-storage" ? "" : "no "
    }built-in file storage, and ${
      options.csvExport === "csv-export" ? "" : "no "
    }built-in csv export. Please confirm:`;

  const prompt = {
    type: "confirm",
    name: "confirm",
    message,
    default: false,
  };
  const { confirm } = await inquirer.prompt([prompt]);
  return confirm;
};

async function cli(args: CommandLineArgs): Promise<Options> {
  console.log(
    boxen(
      chalk.bold(
        figlet.textSync("create-bp-app", { horizontalLayout: "full" }),
      ),
      {
        padding: 1,
        margin: 1,
        borderStyle: "double",
        borderColor: "blue",
      },
    ),
  );

  const commandLineOptions: CommandLineOptions = parseArguments(args);

  validateCommandLineOptions(commandLineOptions);

  const { appOptions, outputDir } = await promptOptions(commandLineOptions);

  const confirm = await confirmPrompt(appOptions);

  if (!confirm) {
    return Promise.reject(
      new Error("Blueprint app creation has been cancelled."),
    );
  }

  console.log(chalk.green.bold("Confirmed. Creating blueprint app..."));

  const path = outputDir;
  const changeDirectory = shell.cd(path);

  if (changeDirectory.code !== 0) {
    return Promise.reject(new Error("No directory exists. Exiting..."));
  }

  if (!commandLineOptions.testing) {
    const clone = shell.exec(
      "git clone --single-branch --branch release https://github.com/uwblueprint/starter-code-v2.git",
    );

    if (clone.code !== 0) {
      return Promise.reject(new Error("Git clone failed. Exiting..."));
    }

    console.log(chalk.green.bold("Removing .git ..."));
    const removeGit = shell.rm("-rf", "starter-code-v2/.git");

    if (removeGit.code !== 0) {
      return Promise.reject(new Error("Remove .git failed. Exiting..."));
    }
  }

  return appOptions;
}

export default cli;
