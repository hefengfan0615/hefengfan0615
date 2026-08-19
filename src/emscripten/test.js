// Test harness for the Pikafish WASM build.
// Loads the engine exactly like a web page does:
//   Pikafish().then(engine => { engine.read_stdout = ...; engine.send_command(...); })
// and verifies:
//   1. UCI handshake + NNUE data file loaded (engine responds to uci / isready).
//   2. go depth 20 produces a bestmove.
//   3. go movetime 10000 is interrupted by a "stop" sent after 3 seconds
//      (the engine must terminate well before the 10 s budget).
//
// Usage: node test.js [path-to-pikafish.js]
"use strict";

const modulePath = process.argv[2] || "./pikafish.js";
const PRINT = process.env.PRINT_OUTPUT === "1";
const Pikafish = require(modulePath);

let out = "";
let engine = null;

const engineReady = Pikafish().then((p) => {
  engine = p;
  engine.read_stdout = (text) => {
    out += text;
    if (PRINT) process.stdout.write(text);
  };
});

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitFor(text, timeoutMs, label) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (out.includes(text)) return;
    await sleep(50);
  }
  throw new Error(
    `[FAIL] ${label}: timed out (${timeoutMs} ms) waiting for "${text}"\n--- output so far ---\n${out}`
  );
}

function pass(msg) {
  console.log("[PASS] " + msg);
}

(async () => {
  try {
    await engineReady;
    await sleep(500); // let pthread workers spin up

    // 1) UCI handshake
    engine.send_command("uci");
    await waitFor("uciok", 20000, "uci handshake");
    pass("uci handshake (engine started, options listed)");

    // 2) isready / readyok
    engine.send_command("isready");
    await waitFor("readyok", 20000, "isready");
    pass("isready -> readyok (engine idle)");

    // 3) position startpos + go depth 20
    engine.send_command("position startpos");
    engine.send_command("go depth 20");
    const t0 = Date.now();
    await waitFor("bestmove", 120000, "go depth 20");
    const d20 = ((Date.now() - t0) / 1000).toFixed(2);
    pass(`go depth 20 completed in ${d20} s (bestmove received)`);

    // 4) go movetime 10000, then send "stop" after 3 seconds.
    //    The engine must terminate well before the 10 s budget.
    out = "";
    engine.send_command("go movetime 10000");
    const t1 = Date.now();
    await sleep(3000); // 3 s later send stop, as required by the test plan
    engine.send_command("stop");
    await waitFor("bestmove", 20000, "stop after 3s of movetime 10000");
    const stopped = (Date.now() - t1) / 1000;
    if (stopped >= 9.5) {
      throw new Error(
        `[FAIL] engine did NOT stop early: search ran ${stopped.toFixed(2)} s (> 9.5 s) after 'stop'`
      );
    }
    pass(`stop interrupted 'go movetime 10000' after ${stopped.toFixed(2)} s (< 10 s)`);

    console.log("\n=== ALL WASM TESTS PASSED ===");
    process.exit(0);
  } catch (e) {
    console.error("\n=== WASM TEST FAILED ===");
    console.error(e && e.message ? e.message : e);
    process.exit(1);
  }
})();
