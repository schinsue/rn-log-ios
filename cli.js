#!/usr/bin/env node
"use strict";
const appName = process.argv[2];
const moment = require("moment");
const { spawn } = require("child_process");

const args = [
  "stream",
  "--predicate",
  `(processImagePath contains "${appName}") and senderImageUUID == processImageUUID`,
  "--style",
  "json"
];

const lg = spawn("log", args);

lg.stdout.on("data", data => {
  const str = data.toString("utf8");

  // Assumption: { is always at the end of a line, } at the start of line.
  const m = str.match(/\{$[\s\S]+?^\}/gm);
  if (m === null) {
    return;
  }

  const all = m.map(str => JSON.parse(str));

  all.forEach(data => {
    const { timestamp, eventMessage } = data;
    const time = moment(timestamp).format("H:mm:ss");
    if (!eventMessage) {
      console.log(
        "\x1b[34m" + time + "\x1b[0m",
        "\x1b[1m" + "==>" + "\x1b[0m",
        "\x1b[33m" + data + "\x1b[0m"
      );
      return;
    }
    const pos = eventMessage.indexOf("(ADVICE)");
    let eMsg = "";
    if (pos === -1) {
      eMsg = eventMessage;
      console.log(
        "\x1b[34m" + time + "\x1b[0m",
        "\x1b[1m" + "==>" + "\x1b[0m",
        "\x1b[33m" + eMsg + "\x1b[0m"
      );
    } else {
      return;
    }
  });
});

lg.stderr.on("data", data => {
  console.log(`stderr: ${data}`);
});

lg.on("close", code => {
  console.log(`child process exited with code ${code}`);
});
