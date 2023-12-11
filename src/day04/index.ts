import run from "aocrunner"
import { setMaxIdleHTTPParsers } from "http"
import _ from "lodash"
import { join } from "path"

class Card {
  winning: Array<string>
  selected: Array<string>

  constructor(line: string) {
    ;[this.winning, this.selected] = line
      .split(": ")[1]
      .split(" | ")
      .map((side) => side.split(" ").filter((element) => element != ""))
  }

  matching() {
    return _.intersection(this.winning, this.selected).length
  }

  points() {
    let count = this.matching()
    if (count == 0) {
      return 0
    }
    return Math.pow(2, count - 1)
  }
}

class Table {
  cards: Array<Card>

  constructor(rawInput: string) {
    this.cards = rawInput.split("\n").map((line) => new Card(line))
  }

  sumOfPoints() {
    return _.sum(this.cards.map((card) => card.points()))
  }

  countCardTable() {
    let records = Array.from({ length: this.cards.length }, (value, key) => 1)

    this.cards.forEach((card, i) => {
      let matching = card.matching()
      for (let j = i + 1; j <= i + matching; j++) {
        records[j] += records[i]
      }
    })

    return _.sum(records)
  }
}

const parseInput = (rawInput: string) => new Table(rawInput)

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput)

  return input.sumOfPoints()
}

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput)

  return input.countCardTable()
}

run({
  part1: {
    tests: [
      {
        input: `Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53
Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19
Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1
Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83
Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36
Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11`,
        expected: 13,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53
Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19
Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1
Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83
Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36
Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11`,
        expected: 30,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
