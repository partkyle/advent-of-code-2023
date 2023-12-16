import run from "aocrunner"
import { log } from "console"
import _ from "lodash"
import { parse } from "path"
import { env } from "process"

type op = "-" | "="

type item = removal | lens

type removal = {
  label: string
  op: "-"
}

type lens = {
  label: string
  op: "="
  value: number
}

const parseInput = (rawInput: string): item[] =>
  rawInput
    .split("\n")[0]
    .split(",")
    .map((e) => {
      if (e.includes("-")) {
        return { label: e.split("-")[0], op: "-" }
      } else {
        let parts = e.split("=")
        return { label: parts[0], op: "=", value: parseInt(parts[1]) }
      }
    })

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput)

  let sum = 0
  for (let s of input) {
    sum += hashItem(s)
  }

  return sum
}

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput)

  let boxes: item[][] = []

  for (let i = 0; i < 256; i++) {
    boxes[i] = []
  }

  for (let s of input) {
    let i = hash(s.label)

    switch (s.op) {
      case "-":
        for (let j = 0; j < boxes[i].length; j++) {
          boxes[i] = boxes[i].filter((e) => e.label != s.label)
        }
        break
      case "=":
        let index = boxes[i].findIndex((val) => val.label == s.label)
        if (index != -1) {
          boxes[i][index] = s
        } else {
          boxes[i].push(s)
        }

        break
    }
  }

  for (let b of boxes) {
    log(b.map((e) => [e.label, e.op == "=" ? e.value : 0]))
  }

  let sum = 0
  for (let i = 0; i < boxes.length; i++) {
    let focal = 0
    for (let j = 0; boxes[i] && j < boxes[i].length; j++) {
      let box = boxes[i][j]
      if (box.op == "=") {
        focal += (j + 1) * box.value
      }
    }

    sum += (i + 1) * focal
  }

  return sum
}

run({
  part1: {
    tests: [
      {
        input: `rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7`,
        expected: 1320,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7`,
        expected: 145,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})

function hashItem(s: removal | lens) {
  switch (s.op) {
    case "-":
      return hash(s.label + s.op)
    case "=":
      return hash(s.label + s.op + s.value)
  }
}

function hash(s: string) {
  let currentValue = 0

  for (let i = 0; i < s.length; i++) {
    currentValue = ((currentValue + s.charCodeAt(i)) * 17) % 256
  }

  return currentValue
}
