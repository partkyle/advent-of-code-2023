import run from "aocrunner"

const parseInput = (rawInput: string) => rawInput

const valid_symbols = "!@#$%^&*()_-+={}[]/\\".split("")
const isSymbolChar = (c: string) => valid_symbols.indexOf(c) != -1

const isAdjToSymbol = (symbols, x, y) => {
  for (const symbol of symbols) {
    if (symbol[0] - 1 <= x && x <= symbol[0] + 1) {
      if (symbol[1] - 1 <= y && y <= symbol[1] + 1) {
        return symbol
      }
    }
  }
  return
}

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput)

  // find all symbols

  let lines = input.split("\n")
  let symbols = []

  for (let y = 0; y < lines.length; y++) {
    for (let x = 0; x < lines[y].length; x++) {
      if (isSymbolChar(lines[y][x])) {
        symbols.push([x, y])
      }
    }
  }

  let trackingDigit = []
  let doesDigitLineUpWithSymbol = false
  let digits = []
  for (let y = 0; y < lines.length; y++) {
    let line = lines[y]
    for (let x = 0; x < line.length; x++) {
      let c = line[x]

      if (c.match(/\d/)) {
        trackingDigit.push(c)
        if (isAdjToSymbol(symbols, x, y)) {
          doesDigitLineUpWithSymbol = true
        }
      } else {
        let digit = trackingDigit.join("")
        if (digit != "" && doesDigitLineUpWithSymbol) {
          digits.push(digit)
        }
        trackingDigit = []
        doesDigitLineUpWithSymbol = false
      }
    }
  }

  let sum = 0
  for (const digit of digits) {
    sum += parseInt(digit)
  }

  return sum.toString()
}

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput)

  // find all symbols

  let lines = input.split("\n")
  let symbols = []

  for (let y = 0; y < lines.length; y++) {
    for (let x = 0; x < lines[y].length; x++) {
      if (lines[y][x] == "*") {
        symbols.push([x, y])
      }
    }
  }

  console.log(symbols)

  let trackingDigit = []
  let adjSymbols = []
  let digitsMap = {}

  for (let y = 0; y < lines.length; y++) {
    let line = lines[y]
    for (let x = 0; x < line.length; x++) {
      let c = line[x]

      if (c.match(/\d/)) {
        trackingDigit.push(c)
        let s = isAdjToSymbol(symbols, x, y)
        if (s) {
          if (adjSymbols.indexOf(s) == -1) {
            adjSymbols.push(s)
          }
        }
      } else {
        let digit = trackingDigit.join("")
        if (digit != "") {
          for (const adjSymbol of adjSymbols) {
            let key = `${adjSymbol[0].toString()},${adjSymbol[1].toString()}`
            if (!digitsMap[key]) {
              digitsMap[key] = []
            }
            digitsMap[key].push(digit)
          }
        }
        trackingDigit = []
        adjSymbols = []
      }
    }
  }

  let sum = 0

  for (const k in digitsMap) {
    let v = digitsMap[k]

    if (v.length == 2) {
      sum += parseInt(v[0]) * parseInt(v[1])
    }
  }

  return sum.toString()
}

run({
  part1: {
    tests: [
      {
        input: `467..114..
...*......
..35..633.
......#...
617*......
.....+.58.
..592.....
......755.
...$.*....
.664.598..`,
        expected: "4361",
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `467..114..
...*......
..35..633.
......#...
617*......
.....+.58.
..592.....
......755.
...$.*....
.664.598..`,
        expected: "467835",
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
