import run from "aocrunner"
import { log } from "console"
import _ from "lodash"
import { debugPort } from "process"

type Line = [string, number[]]

const parseInput = (rawInput: string): Line[] => rawInput.split('\n').map( line => {
  let parts = line.split(' ')
  return [parts[0], parts[1].split(',').map(e => parseInt(e))]
})


function countIt(pattern: string, counts: number[]) {
  let cache: Record<string, number> = {}

  function doIt(layer: number, tag: string, pattern: string, counts: number[]) {

    let key = JSON.stringify([pattern, counts])
    if (key in cache) { 
      return cache[key]
    }
  
    if (pattern == "") {
      if (counts.length == 0) {
        // log(`[${layer}] "${tag}"`, 'GOTTEM')
        return 1
      }
      return 0
    }

    if (counts.length == 0) {
      if (!pattern.includes('#')) {
        return 1
      } else {
        return 0
      }
    }

    // log(`[${layer}] "${tag}"`, pattern, counts)

    let count = 0
    if ('.?'.includes(pattern[0])) {
      count += doIt(layer+1, tag+'.', pattern.substring(1), counts)
    }
  
    let nextIndex = counts[0]
    // log(`[${layer}] "${tag}"`, pattern, counts, `subst=${pattern.substring(0, counts[0])}`, `nextIndex=${nextIndex}`, `next="${pattern[nextIndex]}"`)
    if ('#?'.includes(pattern[0])) {
      if (
        !pattern.substring(0, counts[0]).includes('.') &&
        (counts[0] <= pattern.length && !pattern.substring(0, counts[0]).includes('.')) &&
        (counts[0] == pattern.length || pattern[counts[0]] != '#')
      ) {
        count += doIt(layer+1, tag+pattern.substring(0, counts[0]).replace(/\?/g,'#')+'.', pattern.substring(counts[0]+1), counts.slice(1))
      }
    }

    cache[key] = count
    return count
  }

  let result = doIt(0, '', pattern, counts)

  return result
}

function shame(pattern: string, counts: number[]) {

  let cache: Record<string, number> = {}

  // log(pattern, counts)

  function shameshame(p: number, n: number, r: number = 0) {
    let key = JSON.stringify([p,n,r])
    // log(key, pattern.substring(p), counts.slice(n))
    if (key in cache) {
      return cache[key]
    }

    if (p >= pattern.length) return n == counts.length ? 1 : 0

    if ('.?'.includes(pattern[p])) {
      r += shameshame(p+1, n)
    }

    if (
      '#?'.includes(pattern[p]) &&
      n < counts.length &&
      (p + counts[n] <= pattern.length && !pattern.substring(p, p+counts[n]).includes('.')) &&
      (p + counts[n] == pattern.length || pattern[p+counts[n]] != '#')
    ) {
      r += shameshame(p+counts[n]+1, n+1)
    }

    cache[key] = r
    return r
  }

  return shameshame(0, 0)
}

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput)

  let results = input.map( ([springs, counts]) => countIt(springs, counts) )

  return _.sum(results)
}

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput)
  

  let i = 0
  let results = input.map( ([springs, counts]) => {
    let s = Array(5).fill(springs).join('?')
    let c = [].concat(...Array(5).fill(counts))
    return countIt(s, c)
  } )

  return _.sum(results)
}

run({
  part1: {
    tests: [
      {
        input: `
???.### 1,1,3
        `,
        expected: 1,
      },
      {
        input: `
????.######..#####. 1,6,5
        `,
        expected: 4,
      },
      {
        input: `
?###???????? 3,2,1
        `,
        expected: 10,
      },
      {
        input: `???????.??? 1,3`,
        expected: 13
      },
      {
        input: `
???.### 1,1,3
.??..??...?##. 1,1,3
?#?#?#?#?#?#?#? 1,3,1,6
????.#...#... 4,1,1
????.######..#####. 1,6,5
?###???????? 3,2,1
        `,
        expected: 21,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
???.### 1,1,3
`,
        expected: 1
      },
      {
        input: `
???.### 1,1,3
.??..??...?##. 1,1,3
?#?#?#?#?#?#?#? 1,3,1,6
????.#...#... 4,1,1
????.######..#####. 1,6,5
?###???????? 3,2,1
        `,
        expected: 525152,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
