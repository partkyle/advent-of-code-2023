import run from "aocrunner"
import { log } from "console"

class Input {
  steps: Array<string>
  map: Record<string, Array<string>> = {}
  constructor(rawInput: string) {
    let [steps, map] = rawInput.split("\n\n")

    this.steps = steps.split("")

    for (let line of map.split("\n")) {
      let parts = line.split(" = ")
      this.map[parts[0]] = parts[1]
        .replace("(", "")
        .replace(")", "")
        .split(", ")
    }
  }

  getStep(stepCount: number): string {
    return this.steps[stepCount % this.steps.length]
  }

  countSteps(startingStep: string, stop: (step: string) => boolean) {
    let currentStep = startingStep
    let stepCount = 0

    while (!stop(currentStep)) {
      let direction = this.getStep(stepCount)
      stepCount++

      currentStep = this.map[currentStep][direction == "L" ? 0 : 1]
    }

    return stepCount
  }
}

const parseInput = (rawInput: string) => new Input(rawInput)

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput)

  return input.countSteps("AAA", (step: string) => step == "ZZZ", input)
}

function gcd(a: number, b: number) {
  if (b == 0) return a
  return gcd(b, a % b)
}

// Returns LCM of array elements
function findlcm(arr: Array<number>) {
  // Initialize result
  let ans = arr[0]

  // ans contains LCM of arr[0], ..arr[i]
  // after i'th iteration,
  for (let i = 1; i < arr.length; i++) ans = (arr[i] * ans) / gcd(arr[i], ans)

  return ans
}

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput)

  // find starting nodes
  let nodes = Object.keys(input.map).filter((node) => node.endsWith("A"))

  let routes = nodes.map((node) =>
    input.countSteps(node, (step: string) => step.endsWith("Z")),
  )

  log(routes)

  return findlcm(routes)
}

run({
  part1: {
    tests: [
      {
        input: `LLR

AAA = (BBB, BBB)
BBB = (AAA, ZZZ)
ZZZ = (ZZZ, ZZZ)`,
        expected: 6,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `LR

11A = (11B, XXX)
11B = (XXX, 11Z)
11Z = (11B, XXX)
22A = (22B, XXX)
22B = (22C, 22C)
22C = (22Z, 22Z)
22Z = (22B, 22B)
XXX = (XXX, XXX)`,
        expected: 6,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
