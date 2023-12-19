import run from "aocrunner"
import { log } from "console"
import _ from "lodash"
import { logSimpleMap } from "../utils/index.js"

const parseInput = (rawInput: string): [string, number, string][] =>
  rawInput.split("\n").map((l) => {
    let [dir, distance, hexCode] = l.split(" ")
    return [
      dir,
      parseInt(distance),
      hexCode.replace(/^\(#/, "").replace(/\)$/, ""),
    ]
  })

const directions: Record<any, number[]> = {
  R: [1, 0],
  0: [1, 0],
  D: [0, 1],
  1: [0, 1],
  L: [-1, 0],
  2: [-1, 0],
  U: [0, -1],
  3: [0, -1],
}

function moveDir(a: number[], b: number[]) {
  return _.zip(a, b).map(([left, right]) => (left || 0) + (right || 0))
}

const North = [0, -1]
const South = [0, 1]
const East = [-1, 0]
const West = [1, 0]

function inBounds<T>(input: T[][], pos: number[]) {
  return (
    pos[0] >= 0 &&
    pos[0] < input[0].length &&
    pos[1] >= 0 &&
    pos[1] < input.length
  )
}

function bfs(input: string[][], start: number[]) {
  let q = [start]
  let explored = new Set<string>(JSON.stringify(start))

  while (q.length > 0) {
    let v = q.pop()

    if (!v) {
      continue
    }

    for (let edge of [North, South, East, West]) {
      let newEdge = [v[0] + edge[0], v[1] + edge[1]]

      if (inBounds(input, newEdge) && input[newEdge[1]][newEdge[0]] == ".") {
        input[newEdge[1]][newEdge[0]] = "#"
        let edgeKey = JSON.stringify(newEdge)
        if (!explored.has(edgeKey)) {
          explored.add(edgeKey)
          q.push(newEdge)
        }
      }
    }
  }
}

function manhattan(a: number[], b: number[]): number {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1])
}

function shoelace(vertices: number[][]) {
  let lace = 0

  let perimeter = 0

  for (let i = 0; i < vertices.length - 1; i++) {
    lace +=
      (vertices[i + 1][0] + vertices[i][0]) *
      (vertices[i + 1][1] - vertices[i][1])
  }

  return Math.abs(lace) / 2
}

function readInput(
  input: [string, number, string][],
  current: number[],
): [number[][][], number] {
  let lines = []

  let steps = 0
  for (const [dir, spaces, _] of input) {
    steps += spaces
    let nextPos = moveDir(
      current,
      directions[dir].map((i) => i * spaces),
    )
    lines.push([current, nextPos])
    current = nextPos
  }

  return [lines, steps]
}

function readInputHex(
  input: [string, number, string][],
  current: number[],
): [number[][][], number] {
  let lines = []

  let steps = 0
  for (const [_dir, _spaces, hexCode] of input) {
    let spaces = parseInt(hexCode.substring(0, hexCode.length - 1), 16)
    let dir = parseInt(hexCode.substring(hexCode.length - 1))

    steps += spaces

    let nextPos = moveDir(
      current,
      directions[dir].map((i) => i * spaces),
    )
    lines.push([current, nextPos])
    current = nextPos
  }

  return [lines, steps]
}

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput)

  let current = [0, 0]
  let [lines, perimeter] = readInput(input, current)
  let vertices = []
  for (let [left, right] of lines) {
    vertices.push(right)
  }

  return shoelace(vertices) + perimeter / 2 + 1
}

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput)

  let current = [0, 0]
  let [lines, perimeter] = readInputHex(input, current)
  let vertices = []
  for (let [left, right] of lines) {
    vertices.push(right)
  }

  return shoelace(vertices) + perimeter / 2 + 1
}

run({
  part1: {
    tests: [
      {
        input: `
R 6 (#70c710)
D 5 (#0dc571)
L 2 (#5713f0)
D 2 (#d2c081)
R 2 (#59c680)
D 2 (#411b91)
L 5 (#8ceee2)
U 2 (#caa173)
L 1 (#1b58a2)
U 2 (#caa171)
R 2 (#7807d2)
U 3 (#a77fa3)
L 2 (#015232)
U 2 (#7a21e3)
`,
        expected: 62,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
R 6 (#70c710)
D 5 (#0dc571)
L 2 (#5713f0)
D 2 (#d2c081)
R 2 (#59c680)
D 2 (#411b91)
L 5 (#8ceee2)
U 2 (#caa173)
L 1 (#1b58a2)
U 2 (#caa171)
R 2 (#7807d2)
U 3 (#a77fa3)
L 2 (#015232)
U 2 (#7a21e3)
`,
        expected: 952408144115,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: true,
})
