import run from "aocrunner"
import { log } from "console"
import logSimpleMap from "../utils/index.js"
import _ from "lodash"

const parseInput = (rawInput: string) =>
  rawInput.split("\n").map((line) => line.split(""))

type Coord = number[]

function manhattan(a: Coord, b: Coord) {
  return Math.abs(a[0] - b[0]) + Math.abs(b[1] - a[1])
}

function combinations<T>(a: T[], choose: number) {
  function combo<T>(
    a: T[],
    combos: T[][],
    start: number,
    choose: number,
    val: T[],
  ) {
    if (val.length == choose) {
      combos.push(val)
      return
    }

    for (let i = start; i < a.length; i++) {
      combo(a, combos, i + 1, choose, [...val, a[i]])
    }
  }

  let result: T[][] = []
  for (let i = 0; i < a.length - 1; i++) {
    combo(a, result, i + 1, choose, [a[i]])
  }

  return result
}

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput)

  let emptyRows = _.range(0, input.length).filter((row) =>
    input[row].every((ch) => isEmptySpace(ch)),
  )
  let emptyCols = _.range(0, input[0].length).filter((col) =>
    _.range(0, input.length).every((row) => isEmptySpace(input[row][col])),
  )

  let rowOffset = 0
  for (let row of emptyRows) {
    input.splice(
      row + rowOffset,
      0,
      _.range(0, input[0].length).map((e) => "."),
    )
    rowOffset++
  }

  let colOffset = 0
  for (let col of emptyCols) {
    for (let row = 0; row < input.length; row++) {
      input[row].splice(col + colOffset, 0, ".")
    }
    colOffset++
  }

  let galaxies: Coord[] = []
  for (let row = 0; row < input.length; row++) {
    for (let col = 0; col < input[row].length; col++) {
      if (input[row][col] == "#") {
        galaxies.push([col, row])
      }
    }
  }

  return _.sum(
    combinations(galaxies, 2).map((pair) => {
      return manhattan(pair[0], pair[1])
    }),
  )
}

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput)

  let emptyRows = _.range(0, input.length).filter((row) =>
    input[row].every((ch) => isEmptySpace(ch)),
  )
  let emptyCols = _.range(0, input[0].length).filter((col) =>
    _.range(0, input.length).every((row) => isEmptySpace(input[row][col])),
  )

  let galaxies: Coord[] = []
  for (let row = 0; row < input.length; row++) {
    for (let col = 0; col < input[row].length; col++) {
      if (input[row][col] == "#") {
        galaxies.push([col, row])
      }
    }
  }

  let sum = 0
  let actualDistance = 1_000_000
  for (const pair of combinations(galaxies, 2)) {
    let min = [
      Math.min(pair[0][0], pair[1][0]),
      Math.min(pair[0][1], pair[1][1]),
    ]
    let max = [
      Math.max(pair[0][0], pair[1][0]),
      Math.max(pair[0][1], pair[1][1]),
    ]

    let rows = emptyRows.filter((row) => min[1] < row && row < max[1])
    let cols = emptyCols.filter((row) => min[0] < row && row < max[0])

    sum +=
      manhattan(pair[0], pair[1]) +
      rows.length * (actualDistance - 1) +
      cols.length * (actualDistance - 1)
  }

  return sum
}

run({
  part1: {
    tests: [
      {
        input: `
...#......
.......#..
#.........
..........
......#...
.#........
.........#
..........
.......#..
#...#.....
        `,
        expected: 374,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
...#......
.......#..
#.........
..........
......#...
.#........
.........#
..........
.......#..
#...#.....
              `,
        expected: 82000210,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})

function isEmptySpace(ch: string): unknown {
  return ch == "."
}
