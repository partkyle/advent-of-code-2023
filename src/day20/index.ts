import run from "aocrunner"
import { log } from "console"
import { sign } from "crypto"

import { findlcm } from "../utils/index.js"

type moduleType = "button" | "broadcaster" | "%" | "&"

const getType = (s: string): moduleType => {
  if (s == "broadcaster") {
    return "broadcaster"
  }

  switch (s[0]) {
    case "%":
      return "%"
    case "&":
      return "&"
  }

  throw `invalid module for ${s}`
}

const getName = (s: string): string => {
  if (s == "broadcaster") {
    return "broadcaster"
  }

  return s.substring(1)
}

type baseModule = {
  name: string
  outputs: string[]
}

type buttonModule = {
  type: "button"
} & baseModule

type flipFlopState = "on" | "off"

type flipFlopModule = {
  type: "%"
  state: flipFlopState
} & baseModule

type conjunctionModule = {
  type: "&"
  inputStates: Record<string, signal>
} & baseModule

type broadcastModule = {
  type: "broadcaster"
} & baseModule

type module =
  | buttonModule
  | flipFlopModule
  | conjunctionModule
  | broadcastModule

const lo = "lo"
const hi = "hi"
type signal = "lo" | "hi"

const parseInput = (rawInput: string): Record<string, module> => {
  let lines = rawInput.split("\n")

  let modules: Record<string, module> = {}
  for (let line of lines) {
    let [name, outputs] = line.split(" -> ")

    let newName = getName(name)

    let t = getType(name)

    switch (t) {
      case "broadcaster":
        modules[newName] = {
          type: t,
          name: newName,
          outputs: outputs.split(", "),
        }
        break
      case "%":
        modules[newName] = {
          type: t,
          name: newName,
          outputs: outputs.split(", "),
          state: "off",
        }
        break
      case "&":
        modules[newName] = {
          type: t,
          name: newName,
          outputs: outputs.split(", "),
          inputStates: {},
        }
        break
    }
  }

  for (let [key, value] of Object.entries(modules)) {
    if (value.type == "&") {
      for (let [subKey, subValue] of Object.entries(modules)) {
        if (subValue.outputs.includes(key)) {
          value.inputStates[subKey] = lo
        }
      }
    }
  }

  return modules
}

const sendSignal = (
  input: Record<string, module>,
  from: string,
  sig: signal,
  to: string,
): [string, signal, string][] => {
  let outputs: [string, signal, string][] = []

  let mod = input[to]

  if (mod === undefined) {
    // not defined, unsure why we have to do this
    // IT'S BECAUSE PART 2 HAD SOMETHING TO DO WITH 'rx'
    return outputs
  }

  switch (mod.type) {
    case "broadcaster":
      outputs = mod.outputs.map((output) => [mod.name, sig, output])
      break
    case "%":
      if (sig == "lo") {
        if (mod.state == "off") {
          mod.state = "on"
          outputs = mod.outputs.map((output) => [mod.name, hi, output])
        } else {
          mod.state = "off"
          outputs = mod.outputs.map((output) => [mod.name, lo, output])
        }
      }
      break
    case "&":
      mod.inputStates[from] = sig

      if (Object.values(mod.inputStates).every((v) => v == hi)) {
        outputs = mod.outputs.map((output) => [mod.name, lo, output])
      } else {
        outputs = mod.outputs.map((output) => [mod.name, hi, output])
      }

      break
  }

  return outputs
}

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput)

  let loCount = 0
  let hiCount = 0
  for (let i = 0; i < 1000; i++) {
    let signals: [string, signal, string][] = [["button", lo, "broadcaster"]]
    while (signals.length > 0) {
      let s = signals.shift()
      if (s === undefined) {
        throw "wut?"
      }

      let [from, sig, to] = s

      if (sig == lo) {
        loCount++
      } else {
        hiCount++
      }

      // log(`${from} -${sig}-> ${to}`)

      let newSigs = sendSignal(input, from, sig, to)
      signals.push(...newSigs)
    }
  }

  return loCount * hiCount
}

function findWhatOutputsIAmIn(
  input: Record<string, module>,
  needle: string,
  layer: number = 0,
) {
  if (needle == "broadcaster") {
    return []
  }

  let results = []

  log("looking for", needle, layer)

  for (let [name, mod] of Object.entries(input)) {
    if (mod.outputs.includes(needle)) {
      results.push(name) //, ...findWhatOutputsIAmIn(input, name, layer + 1))
    }
  }

  return results
}

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput)

  let count = 1
  let results: Record<string, number> = { ln: -1, db: -1, vq: -1, tf: -1 }
  while (Object.values(results).some((r) => r == -1)) {
    let signals: [string, signal, string][] = [["button", lo, "broadcaster"]]
    while (signals.length > 0) {
      let s = signals.shift()
      if (s === undefined) {
        throw "wut?"
      }

      let [from, sig, to] = s

      if (["ln", "db", "vq", "tf"].includes(from) && sig == hi) {
        if (results[from] == -1) {
          results[from] = count
        }
        log(from, count)
      }

      let newSigs = sendSignal(input, from, sig, to)
      signals.push(...newSigs)
    }
    count++
  }

  log(results)

  return findlcm(Object.values(results))
}

run({
  part1: {
    tests: [
      {
        input: `
broadcaster -> a, b, c
%a -> b
%b -> c
%c -> inv
&inv -> a
        `,
        expected: 32000000,
      },
      {
        input: `
broadcaster -> a
%a -> inv, con
&inv -> b
%b -> con
&con -> output
        `,
        expected: 11687500,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      // {
      //   input: ``,
      //   expected: "",
      // },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
