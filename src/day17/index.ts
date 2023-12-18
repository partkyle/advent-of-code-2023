import run from "aocrunner"
import { log } from "console"
import _, { add } from "lodash"
import { env } from "process"
import { logSimpleMap } from "../utils/index.js"
import assert from "assert"

const parseInput = (rawInput: string) => rawInput.split("\n").map(l => l.split('').map(s => parseInt(s)))

const North = [0, -1]
const South = [0, 1]
const East = [-1, 0]
const West = [1, 0]

function invertDirection(d: number[]) {
  return d.map(n => n == 0 ? 0 : -n)
}

function addDir(a: number[], b: number[]) {
  return _.zip(a, b).map(l => _.sum(l))
}

function valueAt(input: number[][], pos: number[]) {
  return input[pos[1]][pos[0]]
}

function countToEnd(input: number[][], visited: number[][], start: number[], end: number[], count: number, prevDirection: number[][]): number {
  log(start, count, prevDirection)
  if (start[0] < 0 || start[0] >= input[0].length || start[1] >= input[0].length || start[1] < 0) {
    log('out of bounds:', start)
    return Number.MAX_SAFE_INTEGER
  }

  if (visited.some(v => _.isEqual(start, v))) {
    log("we been here:", start, visited)
    return Number.MAX_SAFE_INTEGER
  }

  let newVisited = JSON.parse(JSON.stringify(visited))
  newVisited.push(start)

  let thisValue = valueAt(input, start)

  if (_.isEqual(start, end)) {
    return count + thisValue
  }

  return Math.min(...[North, South, East, West].map(nextDir => {
    if (prevDirection.length > 0 && _.isEqual(nextDir, invertDirection(prevDirection[prevDirection.length - 1]))) {
      log('we can never go back', nextDir, prevDirection)
      return Number.MAX_SAFE_INTEGER
    }

    let newPrevDirection = JSON.parse(JSON.stringify(prevDirection))
    if (newPrevDirection.every(d => _.isEqual(d, nextDir))) {
      newPrevDirection.push(nextDir)
    } else {
      log('should be a new dir')
      newPrevDirection = []
    }

    if (newPrevDirection.length >= 3) {
      log('same direction too many times')
      return Number.MAX_SAFE_INTEGER
    }

    let d = addDir(start, nextDir)
    log('at', start, 'go', nextDir, 'to', d)
    return countToEnd(input, newVisited, d, end, count + thisValue, newPrevDirection)
  }))
}

function bfs(input: number[][], start: number[], end: number[]) {
  let q = [start]

  let visited: Record<string, number> = {}
  visited[JSON.stringify(start)] = 0

  while (q.length > 0) {
    let v = q.pop()
    if (_.isEqual(v, end)) {
      return v
    }


  }
}

function key(a: any) {
  return JSON.stringify(a)
}

function djikstra(input: number[][], start: number[], end: number[]) {
  let dist: Record<string, number> = {}
  let prev: Record<string, number[]> = {}
  let dirCount: Record<string, [number[], number]> = {}
  let q = []
  for (let y = 0; y < input.length; y++) {
    for (let x = 0; x < input[y].length; x++) {
      dist[key([x, y])] = Number.MAX_SAFE_INTEGER
      q.push([x, y])
    }
  }

  dist[key(start)] = 0

  while (q.length > 0) {
    q.sort((a,b) => dist[key(a)] - dist[key(b)])
    // log(q.map(e => [e, dist[key(e)]]))
    let u = q.shift()

    if (!u) {
      log('undefined u somehow')
      continue
    }

    // for all neighbors
    for (let d of [North, South, East, West]) {

      let newPos = addDir(d, u)
      if (newPos[0] < 0 || newPos[0] >= input[0].length || newPos[1] >= input.length || newPos[1] < 0) {
        continue
      }

      // if (q.every(v => !_.isEqual(v, newPos))) {
      //   continue
      // }

      let lastDir = dirCount[key(u)]
      if (lastDir && _.isEqual(lastDir[0], d) && lastDir[1] >= 3) {
        // not an edge beacuse we have gone too long this way
        continue
      }

      // if (lastDir && _.isEqual(lastDir[0], invertDirection(d))) {
      //   log('cannot go opposite direction', lastDir[0], d)
      //   continue
      // }

      let newDist = dist[key(u)] + valueAt(input, newPos)

      log(u, newPos, lastDir, dist[key(u)], newDist)

      if (newDist < dist[key(newPos)]) {
        dist[key(newPos)] = newDist
        prev[key(newPos)] = u

        if (lastDir && _.isEqual(lastDir[0], d)) {
          dirCount[key(newPos)] = [d, lastDir[1] + 1]
        } else {
          dirCount[key(newPos)] = [d, 1]
        }
      }
    }
  }


  return [dist, prev]
}

function djikstra2(input: number[][], start: number[], end: number[]) {

  let q = []
  let dist: number[][] = []
  let prev: number[][] = []
  for (let y = 0; y < input.length; y++) {
    dist[y] = []
    prev[y] = []
    for (let x = 0; x < input[y].length; x++) {
      dist[y][x] = Number.MAX_SAFE_INTEGER
      q.push([x,y])
    }
  }

  while (q.length > 0) {
    
  }
}

function inBounds(input: number[][], pos: number[]) {
  return pos[0] >= 0 && pos[0] < input[0].length && pos[1] >= 0 && pos[1] < input.length
}

function dijstraYt(input: number[][], start: number[], end: number[]) {
  let seen = new Set<string>()

  let pq = [
    {
      heat: 0,
      pos: [0,0],
      dir: [0,0],
      count: 0,
    }
  ]

  while (pq.length > 0) {
    pq.sort((a, b) => a['heat'] - b['heat'])
    let u = pq.shift()
    assert(u)

    if (_.isEqual(u.pos, end)) {
      return u
    }

    if (!inBounds(input, u.pos)) {
      continue
    }

    let seenKey = JSON.stringify([u.pos, u.dir, u.count])
    if (seen.has(seenKey)) {
      continue
    }

    seen.add(seenKey)

    if (u.count < 3 && !_.isEqual(u.dir, [0,0])) {
      let newPos = addDir(u.pos, u.dir)
      if (inBounds(input, newPos)) {
        pq.push(
          {
            heat: u.heat + valueAt(input, newPos),
            pos: newPos,
            dir: u.dir,
            count: u.count + 1,
          }
        )
      }
    }


    for (let dir of [North, South, East, West]) {
      if (!_.isEqual(dir, u.dir) && !_.isEqual(dir, invertDirection(u.dir))) {
        let newPos = addDir(u.pos, dir)
        if (inBounds(input, newPos)) {
          pq.push(
            {
              heat: u.heat + valueAt(input, newPos),
              pos: newPos,
              dir: dir,
              count: 1,
            }
          )
        }
      }
    }

  }

  return
}

function dijstraYtPt2(input: number[][], start: number[], end: number[]) {
  let seen = new Set<string>()

  let pq = [
    {
      heat: 0,
      pos: [0,0],
      dir: [0,0],
      count: 0,
    }
  ]

  while (pq.length > 0) {
    pq.sort((a, b) => a['heat'] - b['heat'])
    let u = pq.shift()
    assert(u)

    if (_.isEqual(u.pos, end) && u.count >= 4) {
      return u
    }

    if (!inBounds(input, u.pos)) {
      continue
    }

    let seenKey = JSON.stringify([u.pos, u.dir, u.count])
    if (seen.has(seenKey)) {
      continue
    }

    seen.add(seenKey)

    if (u.count < 10 && !_.isEqual(u.dir, [0,0])) {
      let newPos = addDir(u.pos, u.dir)
      if (inBounds(input, newPos)) {
        pq.push(
          {
            heat: u.heat + valueAt(input, newPos),
            pos: newPos,
            dir: u.dir,
            count: u.count + 1,
          }
        )
      }
    }

    if (u.count >= 4 || _.isEqual([0,0], u.dir)) {
      for (let dir of [North, South, East, West]) {
        if (!_.isEqual(dir, u.dir) && !_.isEqual(dir, invertDirection(u.dir))) {
          let newPos = addDir(u.pos, dir)
          if (inBounds(input, newPos)) {
            pq.push(
              {
                heat: u.heat + valueAt(input, newPos),
                pos: newPos,
                dir: dir,
                count: 1,
              }
            )
          }
        }
      }
    }
  }

  return
}


const part1 = (rawInput: string) => {
  const input = parseInput(rawInput)

  let start = [0, 0]
  let end = [input[0].length - 1, input.length - 1]

  let result  = dijstraYt(input, start, end)

  return result && result.heat
}

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput)

  let start = [0, 0]
  let end = [input[0].length - 1, input.length - 1]

  let result  = dijstraYtPt2(input, start, end)

  return result && result.heat
}

run({
  part1: {
    tests: [
      {
        input: `
2413432311323
3215453535623
3255245654254
3446585845452
4546657867536
1438598798454
4457876987766
3637877979653
4654967986887
4564679986453
1224686865563
2546548887735
4322674655533
`,
        expected: 102,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
2413432311323
3215453535623
3255245654254
3446585845452
4546657867536
1438598798454
4457876987766
3637877979653
4654967986887
4564679986453
1224686865563
2546548887735
4322674655533
`,
        expected: 94,
      },
      {
        input: `
111111111111
999999999991
999999999991
999999999991
999999999991
`,
        expected: 71,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
