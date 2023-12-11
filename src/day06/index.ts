import run from "aocrunner"
import { log } from "console"

import _ from "lodash"

class Input {
  times: Array<number>
  distances: Array<number>

  timePart2: number
  distancePart2: number

  constructor(rawInput: string) {
    let [timesLine, distancesLine] = rawInput.split("\n")

    this.times = timesLine
      .split(/:\s+/)[1]
      .split(/\s+/)
      .map((s) => parseInt(s))
    this.distances = distancesLine
      .split(/:\s+/)[1]
      .split(/\s+/)
      .map((s) => parseInt(s))

    this.timePart2 = parseInt(timesLine.split(/:\s+/)[1].replace(/\s/g, ""))
    this.distancePart2 = parseInt(
      distancesLine.split(/:\s+/)[1].replace(/\s/g, ""),
    )
  }
}

const parseInput = (rawInput: string) => new Input(rawInput)

const calcDistance = (n: number, total: number): number => {
  return n * (total - n)
}

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput)

  return _.zip(input.times, input.distances)
    .map((v) => {
      let [time, distance] = v
      return _.range(0, time)
        .map((t) => calcDistance(t, time))
        .filter((t) => t > distance).length
    })
    .reduce((acc, v) => acc * v, 1)
}

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput)

  log(input)

  let values = [[input.timePart2, input.distancePart2]].map((v) => {
    let [time, distance] = v
    return _.range(0, time)
      .map((t) => calcDistance(t, time))
      .filter((t) => t > distance).length
  })

  return values.reduce((acc, v) => acc * v, 1)
}

run({
  part1: {
    tests: [
      {
        input: `Time:      7  15   30
Distance:  9  40  200`,
        expected: 288,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `Time:      7  15   30
Distance:  9  40  200`,
        expected: 71503,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
