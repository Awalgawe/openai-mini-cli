// @ts-check
"use strict";

import * as dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";
import inquirer from "inquirer";
import { logSpinner } from "./spinner.js";

dotenv.config();

const STOPS = {
  HUMAN: "[Human:]",
  AI: "[AI:]",
};

const [, , subject] = process.argv;

const contexts = {
  default:
    "The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.",
  expert:
    "The following is a conversation with an AI assistant. The assistant is helpful, clever, very friendly and an expert in {subject}.",
};

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("Missing OPENAI_API_KEY");
  process.exit(1);
}

const configuration = new Configuration({ apiKey });
const openai = new OpenAIApi(configuration);

let context = subject
  ? contexts.expert.replace("{subject}", subject)
  : contexts.default;

async function loop() {
  let stop;

  try {
    const { message } = await inquirer.prompt({
      type: "input",
      name: "message",
      message: "You:",
    });

    stop = logSpinner(process.stdout);

    let prompt = `${context}\n\n${STOPS.HUMAN}${message}\n\n${STOPS.AI}`;

    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      temperature: 0,
      top_p: 1,
      max_tokens: 256,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop: [STOPS.HUMAN, STOPS.AI],
    });

    if (process.env.DEBUG) {
      console.log(completion.data);
    }

    stop();

    const response = completion.data.choices[0]?.text;

    if (!response) {
      console.error("no response from AI");
    }

    console.log(`AI: ${response}`);

    context = `${prompt}${response}\n\n`;

    loop();
  } catch (error) {
    stop?.();
    console.log(error?.message ?? error);
    process.nextTick(() => {
      process.exit(1);
    });
  }
}

loop();
