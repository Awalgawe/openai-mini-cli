// @ts-check
"use strict";

import * as dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";
import inquirer from "inquirer";
import { logSpinner } from "./spinner.js";

dotenv.config();

const [, , prompt] = process.argv;

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("Missing OPENAI_API_KEY");
  process.exit(1);
}

const configuration = new Configuration({ apiKey });
const openai = new OpenAIApi(configuration);

async function loop() {
  let stop;

  try {
    const { prompt } = await inquirer.prompt({
      type: "input",
      name: "prompt",
      message: "Prompt",
    });

    stop = logSpinner(process.stdout);

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      temperature: 0.7,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    stop();

    console.log(response.data.choices[0]?.text?.trim() ?? "no response", "\n");

    loop();
  } catch (error) {
    stop?.();
    console.log(error?.message ?? error);
    process.exit(1);
  }
}

loop();
