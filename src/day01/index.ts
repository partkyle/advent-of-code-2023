import run from "aocrunner"
import { log } from "console"

import _ from "lodash"

const parseInput = (rawInput: string) => rawInput.split("\n")

let regex = /(\d)/g

// this regex doesn't get all the matches, but it gets the earliest ones
// will it mess up at the end?
let regexAlpha = /(?=(\d|one|two|three|four|five|six|seven|eight|nine))/g

const sanitize = (s: string) => {
  s = s.replace("one", "1")
  s = s.replace("two", "2")
  s = s.replace("three", "3")
  s = s.replace("four", "4")
  s = s.replace("five", "5")
  s = s.replace("six", "6")
  s = s.replace("seven", "7")
  s = s.replace("eight", "8")
  s = s.replace("nine", "9")

  return s
}

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput)

  let digitValues = input.map((line) => {
    let matches = Array.from(line.matchAll(regex))

    return parseInt(matches[0][0] + matches[matches.length - 1][0])
  })

  return _.sum(digitValues)
}

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput)

  let digitValues = input.map((line) => {
    let matches = Array.from(line.matchAll(regexAlpha))

    let left = sanitize(matches[0][1])
    let right = sanitize(matches[matches.length - 1][1])
    let result = parseInt(left + right)

    log(line, "=>", result)

    return result
  })

  throw `${_.sum(
    digitValues,
  )} is not the answer. the regex method is flawed somewhere.`
  return _.sum(digitValues)
}

run({
  part1: {
    tests: [
      {
        input: `1abc2`,
        expected: 12,
      },
      {
        input: `1abc2
pqr3stu8vwx
a1b2c3d4e5f
treb7uchet`,
        expected: 142,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `two1nine
eightwothree
abcone2threexyz
xtwone3four
4nineeightseven2
zoneight234
7pqrstsixteen`,
        expected: 281,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
