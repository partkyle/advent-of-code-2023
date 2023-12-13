import run from "aocrunner"
import { log } from "console"
import { LOADIPHLPAPI } from "dns"
import _, { toLower } from "lodash"

const parseInput = (rawInput: string) => rawInput.split('\n\n').map( section => section.split('\n'))

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput)

  let results = input.map( s => getReflectValue(s))

  return _.sum(results)

}

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput)

  let tests = [
    ['asdf', 'asdf'],
    ['asdf', 'fsdf'],
    ['asdf', 'ffdf'],
    ['......', '......'],
    ['......', '.....#'],
    ['##......#', '##......#'],
  ]

  for (let [a,b] of tests) {
    log(diffByOnly1(a,b), a, b)
  }


  let results = input.map( s => getReflectValue(s, true))

  return _.sum(results)

}

run({
  part1: {
    tests: [
      {
        input: `
#.##..##.
..#.##.#.
##......#
##......#
..#.##.#.
..##..##.
#.#.##.#.

#...##..#
#....#..#
..##..###
#####.##.
#####.##.
..##..###
#....#..#
`,
        expected: 405,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
#.##..##.
..#.##.#.
##......#
##......#
..#.##.#.
..##..##.
#.#.##.#.

#...##..#
#....#..#
..##..###
#####.##.
#####.##.
..##..###
#....#..#
`,
        expected: 400,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})


function getReflectValue(s: string[], tolerant: boolean = false) {
  let h = horizontalReflect(s)
  let v = verticalReflect(s)

  return h * 100 + v
}

function horizontalReflect(s: string[], tolerant: boolean = false) {
  let maxcount = 0;
  let maxindex = 0
  for (let i = 0; i < s.length; i++) {
    // check reflection count
    let count = 0

    let diffByOnlyOneOnCooldown = false

    let prev = s[i - 1]
    let curr = s[i]
    if (_.isEqual(prev, curr) || diffByOnly1(prev, curr)) {
      if (diffByOnly1(prev, curr)) {
        diffByOnlyOneOnCooldown = true
      }
      count++

      for (let r = 1; r < i; r++) {
        let up = s[i - r - 1]
        let down = s[i + r]

        if (up === undefined || down === undefined || _.isEqual(up, down) || (!diffByOnlyOneOnCooldown && diffByOnly1(up, down))) {
          if (diffByOnly1(up, down)) {
            diffByOnlyOneOnCooldown = true
          }
          count++
        } else {
          count = 0
          break
        }
      }
    }

    if (!diffByOnlyOneOnCooldown) {
      continue
    }

    if (maxcount < count) {
      maxcount = count
      maxindex = i
    }

   }

   return maxindex 
}

function verticalReflect(s: string[], tolerant: boolean = false) {
  let newmap = _.range(0, s[0].length).map( i => s.map( line => line[i] ).reverse().join(''))

  return horizontalReflect(newmap)

  let maxcount = 0;
  let maxindex = 0
  for (let i = 0; i < s[0].length; i++) {
    // check reflection count
    let count = 0


    if (_.isEqual(s.map( l => l[i-1] ), s.map( l => l[i] ))) {
      count++

      for (let r = 1; r <= i; r++) {
        let index = i
        log(s.map( l => l[index + r] ).join(''), s.map( l => l[index - r] ).join(''))
        if (_.isEqual(s.map( l => l[index + r] ), s.map( l => l[index - r] ))) {
          count++
        }
      }
    }
    
    if ( count < maxindex ) {
      maxcount = count
      maxindex = i
    }

    let prev = s.map( l => l[i-1] ).join('')
    let current = s.map( l => l[i] ).join('')

    log(i, prev, current, _.isEqual(prev, current), maxcount, maxindex)
  }
  return maxindex 
}


function diffByOnly1(a: string, b: string) {
  if (a === undefined || b === undefined) {
    return false
  }

  let result = _.zip(a.split(''), b.split('')).map( ([l,r]) => l != r).filter(e => e).length == 1
  return result
}