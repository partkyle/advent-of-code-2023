import run from "aocrunner"
import { log } from "console"
import _, { sum, toLower } from "lodash"

let DEBUG = false
function debug(message?: any, ...optionalParams: any[]) {
  if (DEBUG) {
    if (message) {
      log(message, ...optionalParams)
    }
  }
}

const parseInput = (rawInput: string) =>
  rawInput.split("\n\n").map((section) => section.split("\n"))

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput)

  let results = input.map((s) => getReflectValue(s))

  return _.sum(results)
}

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput)

  DEBUG = true

  let results = input.map((s) => getReflectValue(s, true))

  return _.sum(results)
}

run({
  part1: {
    tests: [
      {
        input: `
#.##..##.
..#.##.#.
##......#
##......#
..#.##.#.
..##..##.
#.#.##.#.

#...##..#
#....#..#
..##..###
#####.##.
#####.##.
..##..###
#....#..#
`,
        expected: 405,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
#.##..##.
..#.##.#.
##......#
##......#
..#.##.#.
..##..##.
#.#.##.#.

#...##..#
#....#..#
..##..###
#####.##.
#####.##.
..##..###
#....#..#
`,
        expected: 400,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})

function getReflectValue(s: string[], tolerant: boolean = false) {
  let h = horizontalReflect(s, tolerant)
  let v = verticalReflect(s, tolerant)

  return h * 100 + v
}

function horizontalReflect(s: string[], tolerant: boolean = false) {
  let sumCompare = tolerant ? 1 : 0

  let indexes = []
  for (let i = 1; i < s.length; i++) {
    let rowsum = 0
    for (let r = 0; r < Math.min(i, s.length - i); r++) {
      let [left, right] = [s[i - r - 1], s[i + r]]

      let sum = 0
      for (let [lch, rch] of _.zip(left.split(""), right.split(""))) {
        sum += lch == rch ? 0 : 1
      }

      rowsum += sum
    }

    if (rowsum == sumCompare) {
      indexes.push(i)
    }
  }

  return indexes.length == 0 ? 0 : Math.max(...indexes)
}

function verticalReflect(s: string[], tolerant: boolean = false) {
  let newmap = _.range(0, s[0].length).map((i) =>
    s
      .map((line) => line[i])
      .reverse()
      .join(""),
  )
  return horizontalReflect(newmap, tolerant)
}
