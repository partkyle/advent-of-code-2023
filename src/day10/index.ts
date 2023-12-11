import run from "aocrunner"
import { log } from "console"
import { IncomingMessage } from "http"
import _, { sum } from "lodash"

const parseInput = (rawInput: string) => new Input(rawInput)

const north: Coord = [0, -1]
const east: Coord = [1, 0]
const south: Coord = [0, 1]
const west: Coord = [-1, 0]

const cardinalPipeNeighborsFor = (pipe: string) => {
  switch (pipe) {
    case "|":
      return [north, south]
    case "-":
      return [east, west]
    case "L":
      return [north, east]
    case "J":
      return [north, west]
    case "7":
      return [south, west]
    case "F":
      return [south, east]
  }

  return []
}

type Coord = [number, number]

const mergeCoord = (a: Coord, b: Coord): Coord => [a[0] + b[0], a[1] + b[1]]

class Grid<T> {
  data: T[][]

  constructor(data: T[][]) {
    this.data = data
  }

  inBounds(coord: Coord): bool {
    if (coord[0] < 0) {
      return false
    }
    if (coord[0] > this.data[0].length - 1) {
      return false
    }

    if (coord[1] < 0) {
      return false
    }
    if (coord[1] > this.data.length - 1) {
      return false
    }

    return true
  }

  set(coord: Coord, val: T): T {
    return (this.data[coord[1]][coord[0]] = val)
  }

  get(coord: Coord): T {
    return this.data[coord[1]][coord[0]]
  }
}

function newGridWithDefaultValue<T>(
  x: number,
  y: number,
  defaultValue: T,
): Grid<T> {
  return new Grid(
    _.range(0, y).map((j) => _.range(0, x).map((j) => defaultValue)),
  )
}

class Input {
  grid: string[][]
  startPos: Coord

  constructor(rawInput: string) {
    this.grid = rawInput.split("\n").map((line) => line.split(""))
    this.startPos = this.findStart()
  }

  charAt(coord: Coord) {
    return this.grid[coord[1]][coord[0]]
  }

  findStart(): Coord {
    let startingPos: Coord = [-1, -1]
    this.grid.forEach((line, y) =>
      line.forEach((c, x) => {
        if (c == "S") {
          startingPos = [x, y]
        }
      }),
    )

    if (_.isEqual(startingPos, [-1, -1])) {
      throw `startingPos is bad`
    }

    return startingPos
  }

  pipeNeighborsFor(coord: Coord) {
    if (_.isEqual(coord, this.startPos)) {
      return this.startNeighbors()
    }
    return cardinalPipeNeighborsFor(this.charAt(coord)).map((c) =>
      mergeCoord(c, coord),
    )
  }

  startNeighborsCardinal(): Coord[] {
    let neighbors: Coord[] = []

    for (let n of [north, east, south, west]) {
      let c = mergeCoord(this.startPos, n)
      if (
        c[0] >= 0 &&
        c[0] <= this.grid[0].length &&
        c[1] >= 0 &&
        c[1] <= this.grid.length
      ) {
        let gridItem = this.charAt(c)
        let neighborNeighbors = cardinalPipeNeighborsFor(gridItem)

        // take the position, marge it with the direction we used to get there
        // if it has a neighbor that is the opposite direction, they will merge to [0, 0]
        // if one of those connects, it comes back to here meaning we are connected
        //
        // not sure if we need to find the type of pipe, but we assume any pipe connecting ot this square
        // will be correct
        if (
          neighborNeighbors
            .map((nN) => mergeCoord(n, nN))
            .some((e) => _.isEqual(e, [0, 0]))
        ) {
          neighbors.push(n)
        }
      }
    }

    return neighbors
  }

  startNeighbors(): Coord[] {
    return this.startNeighborsCardinal().map((c) =>
      mergeCoord(this.startPos, c),
    )
  }

  gridMap() {
    let gMap: Grid<number | undefined> = newGridWithDefaultValue(
      this.grid[0].length,
      this.grid.length,
      undefined,
    )

    gMap.set(this.startPos, 0)
    let scanList = [this.startPos]

    while (scanList.length > 0) {
      let pos = scanList.shift()

      // handle pesky undefined, it won't happen
      if (pos === undefined) {
        throw `well waddaya know. it is undefined: ${pos}`
      }

      let neighbors = this.pipeNeighborsFor(pos)
      for (const neighbor of neighbors) {
        if (gMap.get(neighbor) === undefined) {
          let v = gMap.get(pos) || 0
          if (gMap.get(pos) === undefined) {
            throw `this position is undefine. that is not possible. we suck: ${pos}`
          }
          gMap.set(neighbor, v + 1)
          scanList.push(neighbor)
        }
      }
    }

    return gMap
  }

  explore(gMap: number[][], visitList: Coord[], count: number) {
    log(visitList, count)
    for (const visit of visitList) {
      if (count < gMap[visit[1]][visit[0]]) {
        gMap[visit[1]][visit[0]] = count
        this.explore(gMap, this.pipeNeighborsFor(visit), count + 1)
      }
    }
  }
}

const pipeChars = "|-LJ7FS"

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput)

  let gridMap = input.gridMap()
  let gData = gridMap.data.map((l) => l.map((e) => (e === undefined ? -1 : e)))
  return Math.max(...gData.flatMap((e) => e))
}

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput)

  let gridMap = input.gridMap()
  let gData = gridMap.data.map((l, y) =>
    l.map((e, x) => (e === undefined ? "." : input.charAt([x, y]))),
  )
  let g = new Grid(gData)

  for (let s of ["|", "-", "F", "J", "L", "7"]) {
    if (
      _.isEqual(input.startNeighborsCardinal(), cardinalPipeNeighborsFor(s))
    ) {
      g.set(input.startPos, s)
      break
    }
  }

  let count = 0
  for (let y = 0; y < g.data.length; y++) {
    for (let x = 0; x < g.data[y].length; x++) {
      if (g.get([x, y]) == ".") {
        // count pipes from the left until we hit this value. if it's an odd number, we are inside the polygon
        // https://en.wikipedia.org/wiki/Point_in_polygon
        let pipes = 0

        let up: boolean | undefined = undefined

        let insideTube = false
        for (let v = 0; v < x; v++) {
          let c = g.get([v, y])
          if (c == "|") {
            insideTube = !insideTube
            pipes += 1
          }

          // S is a vertical bar in my input, so this doesn't work
          if ("FL".includes(c)) {
            if ("F".includes(c)) {
              up = true
            } else if ("SL".includes(c)) {
              up = false
            }
          }

          if ("7J".includes(c)) {
            if ((up === true && c == "J") || (up === false && c == "7")) {
              pipes += 1
              up = undefined
            } else {
              up = false
            }
          }
        }

        if (pipes % 2 == 1) {
          count += 1
          g.set([x, y], "I")
        } else {
          g.set([x, y], " ")
        }
      }
    }
  }

  return count
}

run({
  part1: {
    tests: [
      {
        input: `
        .....
.S-7.
.|.|.
.L-J.
.....
`,
        expected: 4,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
...........
.S-------7.
.|F-----7|.
.||.....||.
.||.....||.
.|L-7.F-J|.
.|..|.|..|.
.L--J.L--J.
...........
`,
        expected: 4,
      },
      {
        input: `
.....
.S-7.
.|.|.
.L-J.
.....
`,
        expected: 1,
      },
      {
        input: `
..........
.S------7.
.|F----7|.
.||....||.
.||....||.
.|L-7F-J|.
.|..||..|.
.L--JL--J.
..........
`,
        expected: 4,
      },
      {
        input: `
..........
.F------7.
.|F----7|.
.||....||.
.||....||.
.|L-7F-J|.
.|..||..|.
.S--JL--J.
..........
`,
        expected: 4,
      },
      {
        input: `
FF7FSF7F7F7F7F7F---7
L|LJ||||||||||||F--J
FL-7LJLJ||||||LJL-77
F--JF--7||LJLJ7F7FJ-
L---JF-JLJ.||-FJLJJ7
|F|F-JF---7F7-L7L|7|
|FFJF7L7F-JF7|JL---7
7-L-JL7||F7|L7F-7F7|
L.L7LFJ|||||FJL7||LJ
L7JLJL-JLJLJL--JLJ.L
`,
        expected: 10,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
