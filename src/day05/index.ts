import run from "aocrunner"
import { log } from "console"
import { sensitiveHeaders } from "http2"

import _ from "lodash"
import { mainModule, rawListeners } from "process"

class MapData {
  dest: number
  source: number
  range: number

  constructor(dest: number, source: number, range: number) {
    this.dest = dest
    this.source = source
    this.range = range
  }

  
  public get start() : number {
    return this.source
  }

  public get end(): number {
    return this.source + this.range
  }

  public get offset(): number {
    return this.source - this.dest
  }
  
}

enum State {
  none = "none",
  seed_to_soil = "seed-to-soil",
  soil_to_fertilizer = "soil-to-fertilizer",
  fertilizer_to_water = "fertilizer-to-water",
  water_to_light = "water-to-light",
  light_to_temperature = "light-to-temperature",
  temperature_to_humidity = "temperature-to-humidity",
  humidity_to_location = "humidity-to-location"
}


const next = (state: State): State => {
  switch (state) {
    case State.none:
      return State.seed_to_soil
    case State.seed_to_soil:
      return State.soil_to_fertilizer
    case State.soil_to_fertilizer:
      return State.fertilizer_to_water
    case State.fertilizer_to_water:
      return State.water_to_light
    case State.water_to_light:
      return State.light_to_temperature
    case State.light_to_temperature:
      return State.temperature_to_humidity
    case State.temperature_to_humidity:
      return State.humidity_to_location
    case State.humidity_to_location:
      return State.none

    default:
      return State.none
  
  }
}


class Data {
  private _state: State

  rawInput: string
  
  seeds: Array<number> = []

  mapData: { [id: string]: Array<MapData> } = Object.fromEntries(Object.values(State).map( v => [v, []]))

  constructor(rawInput: string) {
    this.rawInput = rawInput
    this._state = State.none

    let lines = this.rawInput.split('\n')

    for (let line of lines) {
      if (line.startsWith('seeds: ')) {
        this.seeds = line.replace('seeds: ', '').split(' ').map(s => parseInt(s))
        continue
      }

      if (line.trim() == '') {
        this._state = State.none
        continue
      }


      if (this._state == State.none) {
        _.forIn(State, (value, key) => {
          if (line.startsWith(value)) {
            this._state = key
            return
          }
        })
        continue
      }

      let [dest,source,range] = line.split(' ').map( s => parseInt(s) )
      this.mapData[State[this._state]].push(new MapData(dest, source, range))
    }

    _.forIn(State, (value, key) => {
      this.mapData[State[key]].sort((a,b) => a.source - b.source)
    })

  }

  convertSeedKeyToLocation(seedKey: number) {
    let soil = this.readMapData(this.mapData[State.seed_to_soil], seedKey)
    let fertilizer = this.readMapData(this.mapData[State.soil_to_fertilizer], soil)
    let water = this.readMapData(this.mapData[State.fertilizer_to_water], fertilizer)
    let light = this.readMapData(this.mapData[State.water_to_light], water)
    let temp = this.readMapData(this.mapData[State.light_to_temperature], light)
    let humidity = this.readMapData(this.mapData[State.temperature_to_humidity], temp)
    let location = this.readMapData(this.mapData[State.humidity_to_location], humidity)
    return location
  }

  readMapData(mapData: Array<MapData>, key: number): number {
    for (let data of mapData) {
      if (data.source <= key && key < data.source + data.range) {
        return data.dest + (key - data.source)
      }
    }

    return key
  }

  convertSeedKeyToLocationRange(seeds: Array<Array<number>>) {
    let soil = this.rangeMapLookup(this.mapData[State.seed_to_soil], State.seed_to_soil, seeds)
    let fertilizer = this.rangeMapLookup(this.mapData[State.soil_to_fertilizer], State.soil_to_fertilizer, soil)
    let water = this.rangeMapLookup(this.mapData[State.fertilizer_to_water], State.fertilizer_to_water, fertilizer)
    let light = this.rangeMapLookup(this.mapData[State.water_to_light], State.water_to_light, water)
    let temp = this.rangeMapLookup(this.mapData[State.light_to_temperature], State.light_to_temperature, light)
    let humidity = this.rangeMapLookup(this.mapData[State.temperature_to_humidity], State.temperature_to_humidity, temp)
    let location = this.rangeMapLookup(this.mapData[State.humidity_to_location], State.humidity_to_location, humidity)
    return location
  }

  convertSeedKeyToLocationRangeOtherStyle(seeds: Array<Array<number>>) {
    seeds = seeds.map((seed) => [seed[0], seed[0] + seed[1]])
    let soil = this.rangeMapLookupOtherStyle(State.seed_to_soil, seeds)
    let fertilizer = this.rangeMapLookupOtherStyle(State.soil_to_fertilizer, soil)
    let water = this.rangeMapLookupOtherStyle(State.fertilizer_to_water, fertilizer)
    let light = this.rangeMapLookupOtherStyle(State.water_to_light, water)
    let temp = this.rangeMapLookupOtherStyle(State.light_to_temperature, light)
    let humidity = this.rangeMapLookupOtherStyle(State.temperature_to_humidity, temp)
    let location = this.rangeMapLookupOtherStyle(State.humidity_to_location, humidity)
    return location
  }


  rangeMapLookup(mapData: Array<MapData>, state: State, ranges: Array<Array<number>>) {
    let newRanges = []
    
    log("=========================================")
    log(`working set ${state}:`, ranges)
    for (let seedRange of ranges) {
      let [start, count] = seedRange

      for (let data of mapData) {
        if (data.source <= start && start < data.end) {
          let offset = (start - data.source)

          let newCount = 0
          let t = "durr   "
          if (data.range - offset > count) {
            t = "full   "
            newCount = count;
          } else {
            t = "split  "
            newCount = data.range - offset
          }

          newRanges.push([data.dest + offset, newCount])
          log(`pushing [${t}] state=${state} offset=${offset}`, [data.dest], [data.source, data.range], [start, count], ` => `, newRanges[newRanges.length-1])

          start += newCount
          count = count - newCount

          // if (start + count <= data.end) {
          //   newRanges.push([data.dest + offset, count])
          //   log(`pushing [full   ] state=${state}`, [data.source, data.range], [start, count], ` => `, newRanges[newRanges.length-1])
          //   count = 0
          //   break
          // } else {
          //   newRanges.push([data.dest + offset, data.range - offset])
          //   log(`pushing [split  ] state=${state}`, [data.source, data.range], [start, count], ` => `, newRanges[newRanges.length-1])

          //   count = count - (data.range - offset)
          //   start += data.range - offset
          // }
        }
      }
      
      if (count != 0) {
        newRanges.push([start, count])
        log(`pushing [default] state=${state}`, [start, count], ` => `, newRanges[newRanges.length-1])

        count = 0
      }
    }

    newRanges.sort((a,b) => a[0] - b[0])


    return newRanges
  }

  convertSeedKeyToLocationRangeOverlaps(seeds: Array<Array<number>>) {
    let soil = this.rangeMapLookupOverlaps(State.seed_to_soil, seeds)
    let fertilizer = this.rangeMapLookupOverlaps(State.soil_to_fertilizer, soil)
    let water = this.rangeMapLookupOverlaps(State.fertilizer_to_water, fertilizer)
    let light = this.rangeMapLookupOverlaps(State.water_to_light, water)
    let temp = this.rangeMapLookupOverlaps(State.light_to_temperature, light)
    let humidity = this.rangeMapLookupOverlaps(State.temperature_to_humidity, temp)
    let location = this.rangeMapLookupOverlaps(State.humidity_to_location, humidity)
    return location
  }

  rangeMapLookupOverlaps(state: State, ranges: Array<Array<number>>) {
    let newRanges = []
    let mapData = this.mapData[state]


    while (ranges.length > 0) {
      let [start, count] = ranges.pop()

      let found = false

      // find the map data
      for (const data of mapData) {
        let overlapStart = Math.max(start, data.start)
        let overlapEnd = Math.min(start + count, data.end)

        if (overlapStart < overlapEnd) {
          // add in the new value we just calculated using overlaps
          // DON'T FORGET TO USE THE OFFSET
          newRanges.push([overlapStart - data.offset, overlapEnd - overlapStart])

          // push the overlaps back onto the ranges list to ensure they get remapped
          if (start < overlapStart) {
            ranges.push([start, overlapStart - start])
          }

          if (overlapEnd < count+start) {
            ranges.push([overlapEnd, count+start - overlapEnd])
          }

          found = true
          break
        }
      }

      if (!found) {
        // push the mapping as is because it doesn't have one
        newRanges.push([start, count])
      }

    }

    // could include a condensing step if this takes too long
    newRanges.sort( (a,b) => a[0] - b[0] )

    return newRanges
  }


  rangeMapLookupOtherStyle(state: State, ranges: Array<Array<number>>) {
    let newRanges = []

    let mapData = this.mapData[state]
    
    log("=========================================")
    log(`working set ${state}:`, ranges)
    for (let seedRange of ranges) {
      let [start, end] = seedRange

      for (let data of mapData) {
        if (data.start <= start && start < data.end) {
          let offset = (start - data.start)

          if (end <= data.end) {
            newRanges.push([start - data.offset, end - data.offset])
            log(`pushing [full   ] state=${state} offset=${data.offset}`, data.dest, [data.start, data.end], [start, end], ` => `, newRanges[newRanges.length-1])
            start = end
            break
          } else {
            let consumed = data.range - offset
            log("consumed", consumed)
            newRanges.push([start - data.offset, consumed + start - data.offset])
            log(`pushing [split  ] state=${state} offset=${data.offset}`, data.dest, [data.start, data.end], [start, end], ` => `, newRanges[newRanges.length-1])

            start += consumed
          }
        }
      }
      
      if (start != end) {
        newRanges.push([start, end])
        log(`pushing [default] state=${state}`, [start, end], ` => `, newRanges[newRanges.length-1])
      }
    }

    newRanges.sort((a,b) => a[0] - b[0])

    return newRanges
  }
}

const parseInput = (rawInput: string) => new Data(rawInput)

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput)

  let locations = input.seeds.map( seed => input.convertSeedKeyToLocation(seed) )
  locations.sort((a,b) => a-b)

  return locations[0]
}

class PData {
  val: number
  t: string
  i: number

  constructor(val: number, t: string, i: number) {
    this.val = val
    this.t = t
    this.i = i
  }
}

const overlappingIntervals = (intervals: Array<MapData>) => {

  let p: Array<PData> = []
  for (let i = 0; i < intervals.length; i++) {
    p.push(new PData(intervals[i].start, "start", i))
    p.push(new PData(intervals[i].end, "end", i))
  }


  p.sort( (a,b) => a.val - b.val )

  let currentOpen = -1
  let added = false
  let results = []

  for (let i = 0; i < p.length; i++) {

    if (p[i].t == 'start') {
      if (currentOpen == -1) {
        currentOpen = p[i].i
        added = false
      } else {
        let index = p[i].i
        results.push(index)
        if (!added) {
          results.push(currentOpen)
          added = true
        }
        if (intervals[index].end > intervals[currentOpen].end) {
          currentOpen = index
          added = true
        }
      }
    } else {
      if (p[i].i == currentOpen) {
        currentOpen = -1
        added = false
      }
    }

  }

  results.sort( (a,b) => a-b)
  results = _.uniq(results)

  return results
}

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput)

  let seeds = _.chunk(input.seeds, 2)
  seeds.sort((a,b) => a[0] - b[0])

  let minLocation = Number.MAX_SAFE_INTEGER

  for (let seedRange of seeds) {
    for(let i = seedRange[0]; i<seedRange[0]+seedRange[1]; i++ ){
      let location = input.convertSeedKeyToLocation(i)
      if (location < minLocation) {
        minLocation = location
      }
    }
  }

  return minLocation
}

const part2Range = (rawInput: string) => {
  const input = parseInput(rawInput)

  let seeds = _.chunk(input.seeds, 2)
  seeds.sort((a,b) => a[0] - b[0])

  let locations = input.convertSeedKeyToLocationRangeOverlaps(seeds)

  return locations[0][0]
}

run({
  part1: {
    tests: [
      {
        input: `seeds: 79 14 55 13

        seeds: 79 14 55 13

seed-to-soil map:
50 98 2
52 50 48

soil-to-fertilizer map:
0 15 37
37 52 2
39 0 15

fertilizer-to-water map:
49 53 8
0 11 42
42 0 7
57 7 4

water-to-light map:
88 18 7
18 25 70

light-to-temperature map:
45 77 23
81 45 19
68 64 13

temperature-to-humidity map:
0 69 1
1 0 69

humidity-to-location map:
60 56 37
56 93 4`,
        expected: 35,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `seeds: 79 14 55 13

        seeds: 79 14 55 13

seed-to-soil map:
50 98 2
52 50 48

soil-to-fertilizer map:
0 15 37
37 52 2
39 0 15

fertilizer-to-water map:
49 53 8
0 11 42
42 0 7
57 7 4

water-to-light map:
88 18 7
18 25 70

light-to-temperature map:
45 77 23
81 45 19
68 64 13

temperature-to-humidity map:
0 69 1
1 0 69

humidity-to-location map:
60 56 37
56 93 4`,
        expected: 46,
      },
    ],
    solution: part2Range,
  },
  trimTestInputs: true,
  onlyTests: false
})
