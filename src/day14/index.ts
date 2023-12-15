import run from "aocrunner"
import { log } from "console"
import { env } from "process"
import { logSimpleMap } from "../utils/index.js"
import _ from "lodash"
import shasum from "shasum"

const parseInput = (rawInput: string) =>
  rawInput.split("\n").map((line) => line.split(""))

const space = "."
const rock = "O"

function rollNorth(input: string[][]) {
  let itChanging = true
  while (itChanging) {
    itChanging = false

    for (let y = 0; y < input.length - 1; y++) {
      for (let x = 0; x < input[y].length; x++) {
        let ch = input[y][x]
        if (ch == space && input[y + 1][x] == rock) {
          ;[input[y][x], input[y + 1][x]] = [input[y + 1][x], input[y][x]]
          itChanging = true
        }
      }
    }
  }
}

function rollEast(input: string[][]) {
  let itChanging = true
  while (itChanging) {
    itChanging = false

    for (let y = 0; y < input.length; y++) {
      for (let x = input[y].length - 1; x > 0; x--) {
        let ch = input[y][x]
        if (ch == space && input[y][x - 1] == rock) {
          ;[input[y][x], input[y][x - 1]] = [input[y][x - 1], input[y][x]]
          itChanging = true
        }
      }
    }
  }
}

function rollSouth(input: string[][]) {
  let itChanging = true
  while (itChanging) {
    itChanging = false

    for (let y = input.length - 1; y > 0; y--) {
      for (let x = 0; x < input[y].length; x++) {
        let ch = input[y][x]
        if (ch == space && input[y - 1][x] == rock) {
          ;[input[y][x], input[y - 1][x]] = [input[y - 1][x], input[y][x]]
          itChanging = true
        }
      }
    }
  }
}

function rollCycle(input: string[][]) {
  rollNorth(input)
  rollWest(input)
  rollSouth(input)
  rollEast(input)
}

function rollWest(input: string[][]) {
  let itChanging = true
  while (itChanging) {
    itChanging = false

    for (let y = 0; y < input.length; y++) {
      for (let x = 0; x < input[y].length; x++) {
        let ch = input[y][x]
        if (ch == space && input[y][x + 1] == rock) {
          ;[input[y][x], input[y][x + 1]] = [input[y][x + 1], input[y][x]]
          itChanging = true
        }
      }
    }
  }
}

function calcLoad(input: string[][]) {
  let total = 0
  for (let y = 0; y < input.length; y++) {
    for (let x = 0; x < input[y].length; x++) {
      let ch = input[y][x]
      if (ch == rock) {
        total += input.length - y
      }
    }
  }

  return total
}

function rockPositions(input: string[][]) {
  let rocks = []
  for (let y = 0; y < input.length; y++) {
    for (let x = 0; x < input[y].length; x++) {
      let ch = input[y][x]
      if (ch == rock) {
        rocks.push([x, y])
      }
    }
  }

  return rocks
}

function hashRockList(rockList: number[][]) {
  let r = JSON.stringify(rockList)
  return shasum(r)
}

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput)

  rollNorth(input)
  let total = calcLoad(input)
  return total
}

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput)

  let copyInput = input.map((line) => line.map((ch) => ch))

  let rockTrackers: string[] = []
  let cycle: number[] = []
  for (let i = 0; i < 1000000000; i++) {
    let rocks = hashRockList(rockPositions(copyInput))
    if (_.includes(rockTrackers, rocks)) {
      cycle = [rockTrackers.indexOf(rocks), i]
      break
    }

    rockTrackers.push(rocks)
    rollCycle(copyInput)
  }

  let cycleStart = cycle[0]
  let cycleLength = cycle[1] - cycle[0]

  let howFarInToCycle = 1000000000 - cycleStart
  let remainder = howFarInToCycle % cycleLength

  for (let i = 0; i < cycleStart + remainder; i++) {
    rollCycle(input)
  }

  return calcLoad(input)
}

run({
  part1: {
    tests: [
      {
        input: `
O....#....
O.OO#....#
.....##...
OO.#O....O
.O.....O#.
O.#..O.#.#
..O..#O..O
.......O..
#....###..
#OO..#....
`,
        expected: 136,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
O....#....
O.OO#....#
.....##...
OO.#O....O
.O.....O#.
O.#..O.#.#
..O..#O..O
.......O..
#....###..
#OO..#....
`,
        expected: 64,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: env.ONLY_TESTS == "true" || false,
})
