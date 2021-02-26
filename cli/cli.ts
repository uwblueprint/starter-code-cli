const boxen = require("boxen");
const chalk = require("chalk");
const figlet = require("figlet");
const inquirer = require("inquirer");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

type CommandLineArgs = Array<string>;

type Options = {
  backend: string;
  api: string;
  database: string;
  auth: boolean;
};

const parseArguments = (args: CommandLineArgs) => {
  const { argv } = yargs(hideBin(args))
    .option("b", {
      alias: "backend",
      description: "Backend language",
      choices: ["typescript", "python"],
    })
    .option("a", {
      alias: "api",
      description: "API type",
      choices: ["rest", "graphql"],
    })
    .option("d", {
      alias: "database",
      description: "Database",
      choices: ["postgresql", "mongodb"],
    })
    .option("au", {
      alias: "auth",
      type: "boolean",
      description: "Include built-in auth features",
    });

  if (argv.backend === "typescript") {
    argv.backend = "TypeScript (Node/Express)";
  } else if (argv.backend === "python") {
    argv.backend = "Python (Flask)";
  }
  if (argv.api === "rest") {
    argv.api = "REST";
  } else if (argv.api === "graphql") {
    argv.api = "GraphQL";
  }
  if (argv.database === "postgresql") {
    argv.database = "PostgreSQL";
  } else if (argv.database === "mongodb") {
    argv.database = "MongoDB";
  }
  return argv;
};

const promptOptions = async (options: Options) => {
  const prompts = [];
  if (!options.backend) {
    prompts.push({
      type: "list",
      name: "backend",
      message: "Which backend language would you like?",
      choices: ["TypeScript (Node/Express)", "Python (Flask)"],
    });
  }

  if (!options.api) {
    prompts.push({
      type: "list",
      name: "api",
      message: "Which API would you like?",
      choices: ["REST", "GraphQL"],
    });
  }

  if (!options.database) {
    prompts.push({
      type: "list",
      name: "database",
      message: "Which database would you like?",
      choices: ["PostgreSQL", "MongoDB"],
    });
  }

  if (!options.auth) {
    prompts.push({
      type: "confirm",
      name: "auth",
      message: "Would you like built-in auth features?",
      default: false,
    });
  }

  const answers = await inquirer.prompt(prompts);

  return {
    ...options,
    backend: options.backend || answers.backend,
    api: options.api || answers.api,
    database: options.database || answers.database,
    auth: options.auth || answers.auth,
  };
};

const confirmPrompt = async (options: Options) => {
  const message =
    `You have chosen to create a ${options.backend} app with a ` +
    `${options.api} API, ${options.database} database, and ${
      options.auth ? "" : "no "
    }built-in auth. Please confirm:`;

  const prompt = {
    type: "confirm",
    name: "confirm",
    message,
    default: false,
  };
  const answers = await inquirer.prompt([prompt]);
  return answers.confirm;
};

const cli = async (args: CommandLineArgs) => {
  /* eslint-disable-next-line no-console */
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
  let options = parseArguments(args);
  options = await promptOptions(options);
  const confirm = await confirmPrompt(options);
  if (confirm) {
    /* eslint-disable-next-line no-console */
    console.log(chalk.green.bold("Confirmed. Creating blueprint app..."));
  } else {
    /* eslint-disable-next-line no-console */
    console.log(chalk.red.bold("Blueprint app creation has been cancelled."));
  }
};

exports.cli = cli;
