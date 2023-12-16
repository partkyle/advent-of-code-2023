import run from "aocrunner"
import { dir, log } from "console"
import { env } from "process"
import { logSimpleMap } from "../utils/index.js"
import _ from "lodash"

const parseInput = (rawInput: string) =>
  rawInput.split("\n").map((l) => l.split(""))

type direction = [number, number]
const left: direction = [-1, 0]
const right: direction = [1, 0]
const up: direction = [0, -1]
const down: direction = [0, 1]

function moveDir(a: direction, b: direction): direction {
  return [a[0] + b[0], a[1] + b[1]]
}

function rotate90back(dir: direction): direction {
  return [dir[1], dir[0]]
}

function rotate90forward(dir: direction): direction {
  function negatino(n: number) {
    return n == 0 ? 0 : -n
  }
  return [negatino(dir[1]), negatino(dir[0])]
}

type beam = [direction, direction, direction[]]

class beamlist {
  beams: beam[]
  seenBeams: string[]

  constructor() {
    this.beams = []
    this.seenBeams = []
  }

  add(b: beam, fallenBeams: beam[]) {
    let bJson = JSON.stringify([b[0], b[1]])
    if (!this.seenBeams.includes(bJson)) {
      this.beams.push(b)
      this.seenBeams.push(bJson)
    } else {
      fallenBeams.push(b)
    }
  }

  pop() {
    return this.beams.pop()
  }

  hasBeams() {
    return this.beams.length > 0
  }
}

function newDirectionsOnSpace(ch: string, dir: direction) {
  switch (ch) {
    case ".": {
      return [dir]
    }
    case "/": {
      return [rotate90forward(dir)]
    }
    case "\\": {
      return [rotate90back(dir)]
    }
    case "-": {
      switch (JSON.stringify(dir)) {
        case JSON.stringify(left):
          return [dir]
        case JSON.stringify(right):
          return [dir]
        case JSON.stringify(down):
          return [left, right]
        case JSON.stringify(up):
          return [left, right]
      }
      break
    }
    case "|": {
      switch (JSON.stringify(dir)) {
        case JSON.stringify(left):
          return [up, down]
        case JSON.stringify(right):
          return [up, down]
        case JSON.stringify(down):
          return [dir]
        case JSON.stringify(up):
          return [dir]
      }
    }
  }

  return []
}

function doTheThing(input: string[][], origin: direction = [0, 0], dir: direction = right) {
  log('origin', origin, 'dir', dir)
  let initialBeam: beam = [origin, dir, [origin]]
  let fallenBeams: beam[] = []

  let beams: beamlist = new beamlist()

  beams.add(initialBeam, fallenBeams)

  // beams are all the same

  while (beams.hasBeams()) {
    let beam = beams.pop()

    // handle undefined, can't happen though
    if (!beam) {
      log("beam undefined >!>!?!#!")
      break
    }

    // if (
    //   beam[1][0] < 0 ||
    //   beam[1][0] >= input[0].length ||
    //   beam[1][1] < 0 ||
    //   beam[1][1] >= input.length
    // ) {
    //   fallenBeams.push(beam)
    //   continue
    // }


    // let newDirections = newDirectionsOnSpace(input[nextBeamPos[1]][nextBeamPos[0]], beam[1])
    // log(beam[0], nextBeamPos, input[nextBeamPos[1]][nextBeamPos[0]], beam[1], newDirections)
    // for (let newDirection of newDirections) {
    //   beams.add([nextBeamPos, newDirection, JSON.parse(JSON.stringify(beam[2]))], fallenBeams)
    // }

    let moves = newDirectionsOnSpace(input[beam[0][1]][beam[0][0]], beam[1])
    for (let newDirection of moves) {
      let cloneList = JSON.parse(JSON.stringify(beam[2]))
      let newLocation = moveDir(beam[0], newDirection)
      if (
        newLocation[0] < 0 ||
        newLocation[0] >= input[0].length ||
        newLocation[1] < 0 ||
        newLocation[1] >= input.length
      ) {
        fallenBeams.push(beam)
        continue
      }

      cloneList.push(newLocation)
      beams.add([newLocation, newDirection, cloneList], fallenBeams)
    }
    // switch (input[nextBeamPos[1]][nextBeamPos[0]]) {
    //   case ".": {
    //     // same direction
    //     beams.add([nextBeamPos, beam[1], JSON.parse(JSON.stringify(beam[2]))], fallenBeams)
    //     break
    //   }
    //   case "/": {
    //     let newDirection = rotate90forward(beam[1])
    //     beams.add([nextBeamPos, newDirection, JSON.parse(JSON.stringify(beam[2]))], fallenBeams)
    //     break
    //   }
    //   case "\\": {
    //     let newDirection = rotate90back(beam[1])
    //     beams.add([nextBeamPos, newDirection, JSON.parse(JSON.stringify(beam[2]))], fallenBeams)
    //     break
    //   }
    //   case "-": {
    //     // splitter
    //     if (_.isEqual(beam[1], down) || _.isEqual(beam[1], up)) {
    //       beams.add([nextBeamPos, left, JSON.parse(JSON.stringify(beam[2]))], fallenBeams)
    //       beams.add([nextBeamPos, right, JSON.parse(JSON.stringify(beam[2]))], fallenBeams)
    //     } else {
    //       beams.add([nextBeamPos, beam[1], JSON.parse(JSON.stringify(beam[2]))], fallenBeams)
    //     }
    //     break
    //   }
    //   case "|": {
    //     // splitter
    //     if (_.isEqual(beam[1], left) || _.isEqual(beam[1], right)) {
    //       beams.add([nextBeamPos, up, JSON.parse(JSON.stringify(beam[2]))], fallenBeams)
    //       beams.add([nextBeamPos, down, JSON.parse(JSON.stringify(beam[2]))], fallenBeams)
    //     } else {
    //       beams.add([nextBeamPos, beam[1], JSON.parse(JSON.stringify(beam[2]))], fallenBeams)
    //     }
    //     break
    //   }
    // }
  }

  let cinput = JSON.parse(JSON.stringify(input))

  let count = 0
  for (let beam of fallenBeams) {
    for (let node of beam[2]) {
      if (cinput[node[1]][node[0]] != '#') {
        count++
      }
      cinput[node[1]][node[0]] = "#"
    }
  }

  return count
}

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput)

  logSimpleMap(input)

  let count = doTheThing(input)




  // ;(async function() {
  //   let b = fallenBeams[3]
  //   for (let i = 0; i < b[2].length; i++) {
  //     let node = b[2][i]
  //     input[node[1]][node[0]] = "#"
  //     log(node)
  //     logSimpleMap(input, '', [[node[0]-10, node[0]+10], [node[1]-10, node[1]+10]])
  //     log(i)
  //     await sleep(50)
  //     console.clear()
  //   }
  // }())



  log()
  log()
  log()
  log()
  logSimpleMap(input)

  // the route includes the [0,-1]
  return count
}

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput)

  
  let max = 0
  for (let i = 0; i < input.length; i++) {
    {
      let count = doTheThing(input, [0, i], right)
      if (count > max) {
        max = count
      }
    }
  }
  for (let i = 0; i < input.length; i++) {

    {
      let count = doTheThing(input, [input[i].length - 1, i], left)
      if (count > max) {
        max = count
      }
    }
  }
  for (let i = 0; i < input.length; i++) {

    {
      let count = doTheThing(input, [i, 0], down)
      if (count > max) {
        max = count
      }
    }
  }
  for (let i = 0; i < input.length; i++) {

    {
      let count = doTheThing(input, [i, input.length - 1], up)
      if (count > max) {
        max = count
      }
    }
  }

  return max
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
run({
  part1: {
    tests: [
      {
        input: `
.|...\\....
|.-.\\.....
.....|-...
........|.
..........
.........\\
..../.\\\\..
.-.-/..|..
.|....-|.\\
..//.|....
`,
        expected: 46,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
.|...\\....
|.-.\\.....
.....|-...
........|.
..........
.........\\
..../.\\\\..
.-.-/..|..
.|....-|.\\
..//.|....
`,
        expected: 51,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
