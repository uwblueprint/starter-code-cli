import boxen from "boxen";
import chalk from "chalk";
import figlet from "figlet";
import inquirer from "inquirer";
import shell from "shelljs";
import yargs from "yargs/yargs";

type CommandLineArgs = Array<string>;

type Options = {
  [x: string]: unknown;
  backend?: string;
  api?: string;
  database?: string;
  auth?: boolean;
  output?: string;
  _?: (string | number)[];
  $0?: string;
};

const OPTIONS = {
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
  },
  output: {
    id: "o",
    description: "Output directory",
    message:
      "Which directory would you like the starter code folder to be in (default is current directory)?",
  },
};

const parseArguments = (args: CommandLineArgs) => {
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
    output: {
      alias: OPTIONS.output.id,
      type: "string",
      description: OPTIONS.output.description,
    },
  });

  return argv;
};

const promptOptions = async (options: Options) => {
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

  if (!options.output) {
    prompts.push({
      type: "output",
      name: "output",
      message: OPTIONS.output.message,
      default: ".",
    });
  }

  const answers = await inquirer.prompt(prompts);

  return {
    backend: options.backend || answers.backend,
    api: options.api || answers.api,
    database: options.database || answers.database,
    auth: options.auth || answers.auth,
    output: options.output || answers.output,
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

const cli = async (args: CommandLineArgs) => {
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
  let options: Options = parseArguments(args);
  options = await promptOptions(options);
  const confirm = await confirmPrompt(options);
  if (!confirm) {
    console.log(chalk.red.bold("Blueprint app creation has been cancelled."));
    return;
  }
  console.log(chalk.green.bold("Confirmed. Creating blueprint app..."));
  const path = options.output;
  const changeDirectory = shell.cd(path);
  if (changeDirectory.code !== 0) {
    console.log("No directory exists. Exiting...");
    return;
  }
  const clone = shell.exec(
    "git clone https://github.com/uwblueprint/starter-code-v2.git",
  );
  if (clone.code !== 0) {
    console.log("Git clone failed. Exiting...");
  }
};

export default cli;
