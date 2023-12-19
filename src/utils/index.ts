/**
 * Root for your util libraries.
 *
 * You can import them in the src/template/index.ts,
 * or in the specific file.
 *
 * Note that this repo uses ES Modules, so you have to explicitly specify
 * .js extension (yes, .js not .ts - even for TypeScript files)
 * for imports that are not imported from node_modules.
 *
 * For example:
 *
 *   correct:
 *
 *     import _ from 'lodash'
 *     import myLib from '../utils/myLib.js'
 *     import { myUtil } from '../utils/index.js'
 *
 *   incorrect:
 *
 *     import _ from 'lodash'
 *     import myLib from '../utils/myLib.ts'
 *     import { myUtil } from '../utils/index.ts'
 *
 *   also incorrect:
 *
 *     import _ from 'lodash'
 *     import myLib from '../utils/myLib'
 *     import { myUtil } from '../utils'
 *
 */

import { log } from "console"
import { upperCase } from "lodash"

export function logSimpleMap<T>(
  m: T[][],
  joiner: string = "",
  bounds = [
    [0, 0],
    [m[0].length, m.length],
  ],
) {
  for (let line of m.slice(
    Math.max(0, bounds[0][1]),
    Math.min(m.length, bounds[1][1]),
  )) {
    log(
      line
        .slice(Math.max(0, bounds[0][0]), Math.min(line.length, bounds[1][1]))
        .join(joiner),
    )
  }
}

export function combinations<T>(a: T[], choose: number) {
  function combo<T>(
    a: T[],
    combos: T[][],
    start: number,
    choose: number,
    val: T[],
  ) {
    if (val.length == choose) {
      combos.push(val)
      return
    }

    for (let i = start; i < a.length; i++) {
      combo(a, combos, i + 1, choose, [...val, a[i]])
    }
  }

  let result: T[][] = []
  for (let i = 0; i < a.length - 1; i++) {
    combo(a, result, i + 1, choose, [a[i]])
  }

  return result
}
