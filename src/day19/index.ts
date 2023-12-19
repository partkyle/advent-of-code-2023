import run from "aocrunner"
import { log } from "console"

const parseRuleSet = (rule: string) : rule => {
  let [condition, destination] = rule.split(":")
  if (!destination) {
    return [condition]
  }


    let [key, value] = condition.split("<")
    let cmp = "<"
    if (!value) {
      ;[key, value] = condition.split(">")
      cmp = ">"
    }

    return [key, cmp, parseInt(value), destination]
}

const parseRule = (rule: string): [string, rule[]] => {
  let start = rule.indexOf("{")
  let bucket = rule.substring(0, start)

  let rules = rule.substring(start + 1, rule.length - 1).split(",")

  return [bucket, rules.map(parseRuleSet)]
}

type conditionalRule = [string, string, number, string]

type destinationOnlyRule = [string]

type rule = conditionalRule | destinationOnlyRule

type part = Map<string, number>

class Input {
  rules: [string, rule[]][]
  parts: part[]

  constructor(rawInput: string) {
    let [rules, parts] = rawInput.split("\n\n")

    let partObjects = parts
      .split("\n")
      .map((p) =>
        p
          .replace("{", "")
          .replace("}", "")
          .split(",")
          .map((e) => {
            let [k, v] = e.split("=")
            return [k, parseInt(v)]
          }),
      )
      .map((e) => {
        let o = new Map()
        for (let [key, value] of e) {
          o.set(key, value)
        }
        return o
      })

      this.rules = rules.split("\n").map(parseRule)
      this.parts = partObjects
    }
}

const parseInput = (rawInput: string) => {
  let [rules, parts] = rawInput.split("\n\n")

  let partObjects = parts
    .split("\n")
    .map((p) =>
      p
        .replace("{", "")
        .replace("}", "")
        .split(",")
        .map((e) => {
          let [k, v] = e.split("=")
          return [k, parseInt(v)]
        }),
    )
    .map((e) => {
      let o = {}
      for (let [key, value] of e) {
        o[key] = value
      }
      return o
    })

  return [rules.split("\n").map(parseRule), partObjects]
}

function findRuleByBucket(
  rules: [string, rule[]][],
  name: string,
) : [string, rule[]] | undefined {
  for (let rule of rules) {
    if (rule[0] == name) {
      return rule
    }
  }
}

const mapResultOrBucket = (v: string): [string | undefined, string | undefined] =>  {
  let result = undefined
  let bucket = undefined

  if (v == "A") {
    result = "A"
  } else if (v == "R") {
    result = "R"
  } else {
    // this is the new bucket to map
    bucket = v
  }

  return [result, bucket]
}

const sumXmas = (part: Map<string, number>): number => {
  return (part.get("x") || 0) + (part.get("m") || 0) + (part.get("a") || 0) + (part.get("s") || 0)
}

const part1 = (rawInput: string) => {
  const input = new Input(rawInput)

  let sum = 0
  for (let part of input.parts) {
    let result = undefined
    let bucket = "in"

    while (!result) {
      let ruleExploder = findRuleByBucket(input.rules, bucket)
      if (!ruleExploder) continue
      let [_name, ruleset] = ruleExploder
      for (let r of ruleset) {
        if (r.length == 1) {
          ;[result, bucket] = mapResultOrBucket(r[0])
          break
        } else {
          if (r[1] == "<") {
            if ((part.get(r[0]) || 0) < r[2]) {
              ;[result, bucket] = mapResultOrBucket(r[3])
              break
            }
          } else {
            if ((part.get(r[0]) || 0) > r[2]) {
              ;[result, bucket] = mapResultOrBucket(r[3])
              break
            }
          }
        }
      }
    }

    if (result == 'A') {
      sum += sumXmas(part)
    }
  }

  return sum
}

const invertCondition = (
  thing: [string, string, number],
): [string, string, number] => {
  if (thing[1] == "<") {
    return [thing[0], ">", thing[2] - 1]
  } else {
    return [thing[0], "<", thing[2] + 1]
  }
}

function clone<T>(a: T[]): T[] {
  return JSON.parse(JSON.stringify(a))
}

function doTheTHing(rules: any[], start: string) {
  let [name, rulesets] = findRuleByBucket(rules, start)

  if (!rulesets) {
    return []
  }

  let data = []

  let conditions = []
  for (let ruleset of rulesets) {
    if (ruleset.length == 1) {
      data.push([clone(conditions), ruleset[0]])
    } else {
      let rs = clone(ruleset)
      let dest = rs.splice(ruleset.length - 1, 1)

      // handle the current one
      let newCondition = clone(conditions)
      newCondition.push(rs)
      data.push([newCondition, dest[0]])

      // set up the next ones
      conditions.push(invertCondition(rs))
    }
  }

  return data
}

const part2 = (rawInput: string) => {
  const [rules, _parts] = parseInput(rawInput)

  const MAX_VALUE = 4000

  let data = []

  let doingIt = true
  let start = "in"
  while (doingIt) {
    doingIt = false
  }

  let finsihedConditions = []
  let conditionBreakdowns = doTheTHing(rules, "in")
  while (conditionBreakdowns.length > 0) {
    let [condition, dest] = conditionBreakdowns.pop()

    if (dest == "A" || dest == "R") {
      finsihedConditions.push([condition, dest])
      continue
    }

    let newResults = doTheTHing(rules, dest)
    for (let [newCondition, newDest] of newResults) {
      let combinedConditions = clone(condition)

      let e = [combinedConditions.concat(newCondition), newDest]
      conditionBreakdowns.push(e)
    }
  }

  let sum = 0

  let ranges = []
  for (let [cons, d] of finsihedConditions) {
    let whatsLeft = {
      x: [1, MAX_VALUE + 1],
      m: [1, MAX_VALUE + 1],
      a: [1, MAX_VALUE + 1],
      s: [1, MAX_VALUE + 1],
    }

    if (d == "A") {
      for (let c of cons) {
        if (c[1] == ">") {
          whatsLeft[c[0]][0] = Math.max(whatsLeft[c[0]][0], c[2] + 1)
        } else {
          whatsLeft[c[0]][1] = Math.min(whatsLeft[c[0]][1], c[2])
        }
      }

      let product = 1
      for (let l of ["x", "m", "a", "s"]) {
        product = product * (whatsLeft[l][1] - whatsLeft[l][0])
      }

      sum += product

      ranges.push(whatsLeft)
    }
  }

  // in{s<1351:px,qqz}
  /*
  S < 1351 => px
  s < 1351 && a >= 2006 && M > 2090 => Approved
  s < 1351 && a < 2006 => qkq

  !(s < 1351 && a >= 2006 && M > 2090 ) => rfg
  
  Inf => qqz




*/
  return sum
}

run({
  part1: {
    tests: [
      {
        input: `
px{a<2006:qkq,m>2090:A,rfg}
pv{a>1716:R,A}
lnx{m>1548:A,A}
rfg{s<537:gd,x>2440:R,A}
qs{s>3448:A,lnx}
qkq{x<1416:A,crn}
crn{x>2662:A,R}
in{s<1351:px,qqz}
qqz{s>2770:qs,m<1801:hdj,R}
gd{a>3333:R,R}
hdj{m>838:A,pv}

{x=787,m=2655,a=1222,s=2876}
{x=1679,m=44,a=2067,s=496}
{x=2036,m=264,a=79,s=2244}
{x=2461,m=1339,a=466,s=291}
{x=2127,m=1623,a=2188,s=1013}
`,
        expected: 19114,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
px{a<2006:qkq,m>2090:A,rfg}
pv{a>1716:R,A}
lnx{m>1548:A,A}
rfg{s<537:gd,x>2440:R,A}
qs{s>3448:A,lnx}
qkq{x<1416:A,crn}
crn{x>2662:A,R}
in{s<1351:px,qqz}
qqz{s>2770:qs,m<1801:hdj,R}
gd{a>3333:R,R}
hdj{m>838:A,pv}

{x=787,m=2655,a=1222,s=2876}
{x=1679,m=44,a=2067,s=496}
{x=2036,m=264,a=79,s=2244}
{x=2461,m=1339,a=466,s=291}
{x=2127,m=1623,a=2188,s=1013}
`,
        expected: 167409079868000,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
