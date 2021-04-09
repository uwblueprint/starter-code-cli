import boxen from "boxen";
import chalk from "chalk";
import figlet from "figlet";
import inquirer from "inquirer";
import yargs from "yargs/yargs";
import {
  Options,
  CommandLineOptions,
  APIType,
  BackendType,
  DatabaseType,
  AuthType,
} from "./optionTypes";

type CommandLineArgs = Array<string>;

type Choice<T> = {
  name: string;
  value: T;
};

type OptionConfig<T> = {
  id: string;
  description: string;
  message: string;
  choices: ReadonlyArray<Choice<T>>;
};

type OptionConfigs = {
  backend: OptionConfig<BackendType>;
  api: OptionConfig<APIType>;
  database: OptionConfig<DatabaseType>;
  auth: OptionConfig<void>;
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
      description: OPTIONS.api.description,
      choices: OPTIONS.database.choices.map((choice) => choice.value),
    },
    auth: {
      alias: OPTIONS.auth.id,
      type: "boolean",
      description: OPTIONS.auth.description,
    },
  });

  return {
    backend: argv.backend as BackendType,
    api: argv.api as APIType,
    database: argv.database as DatabaseType,
    auth: argv.auth,
  };
};

const promptOptions = async (options: CommandLineOptions) => {
  const prompts = [];
  if (!options.backend) {
    prompts.push({
      type: "list",
      name: "backend",
      message: OPTIONS.backend.message,
      choices: OPTIONS.backend.choices,
    });
  }

  if (!options.api) {
    prompts.push({
      type: "list",
      name: "api",
      message: OPTIONS.api.message,
      choices: OPTIONS.api.choices,
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

  const answers = await inquirer.prompt(prompts);

  return {
    backend: options.backend || answers.backend,
    api: options.api || answers.api,
    database: options.database || answers.database,
    auth: (options.auth || answers.auth ? "auth" : null) as AuthType,
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
    `${apiName} API, ${databaseName} database, and ${
      options.auth ? "" : "no "
    }built-in auth. Please confirm:`;

  const prompt = {
    type: "confirm",
    name: "confirm",
    message,
    default: false,
  };
  const { confirm } = await inquirer.prompt([prompt]);
  return confirm;
};

const cli = async (args: CommandLineArgs): Promise<Options> => {
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
  const options: Options = await promptOptions(commandLineOptions);
  const confirm = await confirmPrompt(options);
  if (confirm) {
    console.log(chalk.green.bold("Confirmed. Creating blueprint app..."));
  } else {
    console.log(chalk.red.bold("Blueprint app creation has been cancelled."));
  }
  return options;
};

export default cli;
