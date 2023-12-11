import run from "aocrunner"
import { log } from "console"
import _, { result } from "lodash"

class Input {
  histories: number[][] = []
  constructor(rawInput: string) {
    this.histories = rawInput
      .split("\n")
      .map((line) => line.split(" ").map((s) => parseInt(s)))
  }
}

const parseInput = (rawInput: string) => new Input(rawInput)

const diff = (arr: number[]): number[] =>
  _.range(0, arr.length - 1).map((i) => arr[i + 1] - arr[i])

function findSeq(history: number[]) {
  let results = [history]
  while (!results[results.length - 1].every((e) => e == 0)) {
    results.push(diff(results[results.length - 1]))
  }
  return results
}

function calcNewElement(diffList: number[][]) {
  for (let i = diffList.length - 2; i >= 0; i--) {
    let prev = diffList[i + 1]
    let curr = diffList[i]

    curr.push(curr[curr.length - 1] + prev[prev.length - 1])
  }

  return diffList[0][diffList[0].length - 1]
}

function calcFirstElement(diffList: number[][]) {
  for (let i = diffList.length - 2; i >= 0; i--) {
    let prev = diffList[i + 1]
    let curr = diffList[i]

    curr.unshift(curr[0] - prev[0])
  }

  return diffList[0][0]
}

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput)

  let news = input.histories.map((history) => calcNewElement(findSeq(history)))
  return _.sum(news)
}

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput)

  let news = input.histories.map((history) =>
    calcFirstElement(findSeq(history)),
  )
  return _.sum(news)
}

run({
  part1: {
    tests: [
      {
        input: `
0 3 6 9 12 15
1 3 6 10 15 21
10 13 16 21 30 45
        `,
        expected: 114,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
0 3 6 9 12 15
1 3 6 10 15 21
10 13 16 21 30 45
        `,
        expected: 2,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
