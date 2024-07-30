#!/usr/bin/env node

import { Command } from "commander";
import chokidar from "chokidar";
import { generate } from "./generator/internal/generate.js";

const program = new Command();

const generateAction = async (args: { watch: boolean }) => {
  console.log("Generating types...");
  await generate();
  console.log("Types generated!");

  if (args.watch) {
    console.log("Watching schema file for changes...");
    const watcher = chokidar.watch(process.cwd() + "/zodorm/definitions.ts", {
      persistent: true,
    });

    watcher.on("change", async (path) => {
      console.log(`Schema has been changed, regenerating types...`);
      await generate();
      console.log("Types regenerated!");
    });
  }
};

program.addCommand(
  new Command("generate")
    .description("Generate the types from the schema file")
    .option("-w, --watch", "Watch the schema file for changes")
    .action(generateAction)
);
program.parse(process.argv);
