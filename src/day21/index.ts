import run from "aocrunner"
import { log } from "console"
import { json } from "stream/consumers"
import { logSimpleMap } from "../utils/index.js"
import { max } from "lodash"
import { deepStrictEqual } from "assert"

type plot = '.' | 'S'
type start = 'S'
type wall = '#'
type error = string
type space = plot | start | wall | error


type coord = [number,number]

const north: coord = [0,-1]
const south: coord = [0,1]
const east: coord = [1,0]
const west: coord = [-1,0]

const parseInput = (rawInput: string) :space[][] => {
  return rawInput.split("\n").map(line => line.split(''))
}

function inBounds(input: space[][], p: coord) {
  return p[0] >= 0 && p[1] >= 0 && p[0] < input[0].length && p[1] < input.length
}

function addCoord(a: coord, b: coord): coord {
  return [a[0] + b[0], a[1] + b[1]]
}

function bfs(input: space[][], startPos: coord, maxDistance = 64): [Record<string, number>, Record<number, coord[]>] {
  let q = [startPos]
  let explored = new Set<string>([coordToKeyString(startPos)])

  let dist: Record<string, number> = {}
  dist[coordToKeyString(startPos)] = 0

  let revDist: Record<number, coord[]> = {}
  for (let i = 0; i <= maxDistance; i++) {
    revDist[i] = []
  }

  revDist[0].push(startPos)

  while (q.length > 0) {
    let v = q.shift()

    if (v == undefined) {
      break
    }

    for (let dir of [north, south, east, west]) {
      let w = addCoord(v, dir)
      let dv = dist[coordToKeyString(v)]
      if (inBounds(input, w) && !explored.has(coordToKeyString(w)) && input[w[1]][w[0]] != '#' && dv < maxDistance) {
        explored.add(coordToKeyString(w))
        q.push(w)
        dist[coordToKeyString(w)] = dv + 1
        revDist[dv + 1].push(w)
      }
    }
  }

  return [dist, revDist]
}

const coordToKeyString = (c: coord) => JSON.stringify(c)


function keyStringToCoord(s: String): coord{
  let r = s.replace('[','').replace(']','').split(',').map(i => parseInt(i))
  return [r[0], r[1]]
}

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput)

  // find start

  let maxDistance = 64

  let startPos = getStartPosition(input)

  let [dist, revDist] = bfs(input, startPos, maxDistance)
  log (revDist)

  let mapped = input.map((line,y) => {
    return line.map((ch, x) => {
      let v = dist[coordToKeyString([x,y])]
      return v !== undefined ? v.toString(16) : ch
    })
  })

  let coloredMap = mapped.map((line,y) => {
    return line.map((ch, x) => {
      if (ch == '#') {
        return `\x1b[31m${ch}\x1b[0m`
      } else {
        return `\x1b[34m${ch}\x1b[0m`
      }
    })
  })

  logSimpleMap(coloredMap, ' ')

  let destinations = new Set<String>()

  for (let [key, value] of Object.entries(dist)) {
    let pos = keyStringToCoord(key)
    if (value == maxDistance) {
      destinations.add(key)
    }
  }

  for (let i = 1; i <= maxDistance; i++) {
    let newMax = maxDistance - i

    for (let pos of revDist[i]) {
      let [dist, revDist] = bfs(input, pos, newMax)
      for (let [key, value] of Object.entries(dist)) {
        let pos = keyStringToCoord(key)
        if (value == newMax) {
          destinations.add(key)
        }
      }
    }
  }

  log(destinations)
  return destinations.size
}

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput)

  return
}

run({
  part1: {
    tests: [
      {
        input: `
...........
.....###.#.
.###.##..#.
..#.#...#..
....#.#....
.##..S####.
.##..#...#.
.......##..
.##.#.####.
.##..##.##.
...........
`,
        expected: 16,
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

function getStartPosition(input: string[][]) {
  let startPos: [number, number] = [-1, -1]
  for (let y = 0; y < input.length; y++) {
    for (let x = 0; x < input[y].length; x++) {
      if (input[y][x] == 'S') {
        startPos = [x, y]
        break
      }
    }
  }
  return startPos
}

