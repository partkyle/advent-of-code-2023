import run from "aocrunner"
import { log } from "console"

import _ from "lodash"
import { arrayBuffer } from "stream/consumers"

const deck = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']

const convertToHex = (hand: string): string => {
  return hand.replace(/A/g, "E").replace(/K/g, "D").replace(/Q/g, "C").replace(/J/g, "B").replace(/T/g, "A")
}

const compareCards = (a: string, b: string): number => {
  // reversed because early index is beter
  return deck.indexOf(b) - deck.indexOf(a)
}

type HandType = "5" | "4" | "full-house" | "3" | "2-pair" | "1-pair" | "high-card";

const handTypeValue = (h: HandType): number =>  {
  switch (h) {
    case "5":
      return 6
    case "4":
      return 5
    case "full-house":
      return 4
    case "3":
      return 3
    case "2-pair":
      return 2
    case "1-pair":
      return 1
    case "high-card":
      return 0
  }

  return -1
}

class Card {
  hand: string
  bid: number

  constructor(hand: string, bid: number) {
    this.hand = hand
    this.bid = bid
  }

  handCounts(): Record<string, number> {
    let counts: Record<string, number> = {}
    for (let i = 0; i < this.hand.length; i++) {
      counts[this.hand[i]] = (counts[this.hand[i]] || 0) + 1
    }

    return counts
  }

  handValues(): Array<number> {
    return Object.values(this.handCounts()).toSorted((a,b) => a - b)
  }

  handType(): HandType {
    const values = this.handValues()

    if (_.isEqual(values, [5])) {
      return "5"
    }

    if (_.isEqual(values, [1, 4])) {
      return "4"
    }
    
    if (_.isEqual(values, [1, 1, 3])) {
      return "3"
    }

    if (_.isEqual(values, [2, 3])) {
      return "full-house"
    }

    if (_.isEqual(values, [1, 2, 2])) {
      return "2-pair"
    }

    if (_.isEqual(values, [1, 1, 1, 2])) {
      return "1-pair"
    }

    return "high-card"
  }

  compare(other: Card): number {
    let handType = this.handType()
    let otherHandType = other.handType()

    if (handTypeValue(handType) > handTypeValue(otherHandType)) {
      return 1
    } else if (handTypeValue(handType) < handTypeValue(otherHandType)) {
      return -1
    } else {
      // for (let i = 0; i < this.hand.length; i++) {
      //   let cmp = compareCards(this.hand[i], other.hand[i])
      //   if (cmp != 0) {
      //     return cmp
      //   }
      // }

      return parseInt(convertToHex(this.hand), 16) - parseInt(convertToHex(other.hand), 16)
    }
  }

  handTypeJokersWild(): HandType {
    const handCounts = this.handCounts()
    if (Object.keys(handCounts).includes("J")) {
      if (handCounts["J"] == 5) {
        return "5"
      }

      const perms = getPermutations(Object.keys(handCounts).filter(h => h != "J"), handCounts["J"])
      
      let newHand = this.hand.replace(/J/g, "")
      let newHands = perms.map(perm => new Card(newHand + perm.join(''), -1))
      newHands.sort((a,b) => a.compare(b))

      return newHands[newHands.length-1].handType()
    }

    return this.handType()
  }

  compareJokersWild(other: Card): number {
    let handType = this.handTypeJokersWild()
    let otherHandType = other.handTypeJokersWild()

    if (handTypeValue(handType) > handTypeValue(otherHandType)) {
      return 1
    } else if (handTypeValue(handType) < handTypeValue(otherHandType)) {
      return -1
    } else {
      return parseInt(convertToHex(this.hand).replace(/B/g, "1"), 16) - parseInt(convertToHex(other.hand).replace(/B/g, "1"), 16)
    }
  }
}

class Cards {
  cards: Array<Card>

  constructor(rawInput: string) {
    this.cards = rawInput.split('\n').map(line => {
      let [hand, bid] = line.split(' ')
      return new Card(hand, parseInt(bid))
    })
  }
}

const parseInput = (rawInput: string) => new Cards(rawInput)

var getPermutations = function(list, maxLen) {
  // Copy initial values as arrays
  var perm = list.map(function(val) {
      return [val];
  });
  // Our permutation generator
  var generate = function(perm, maxLen, currLen) {
      // Reached desired length
      if (currLen === maxLen) {
          return perm;
      }
      // For each existing permutation
      for (var i = 0, len = perm.length; i < len; i++) {
          var currPerm = perm.shift();
          // Create new permutation
          for (var k = 0; k < list.length; k++) {
              perm.push(currPerm.concat(list[k]));
          }
      }
      // Recurse
      return generate(perm, maxLen, currLen + 1);
  };
  // Start with size 1 because of initial values
  return generate(perm, maxLen, 1);
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput)

  let sortedCards = input.cards.toSorted((a,b) => a.compare(b))

  // for (const t of sortedCards.map((card, i) => [i+1, card.hand, convertToHex(card.hand), card.handType(), handTypeValue(card.handType()) , card.handValues()])) {
  //   log(t.join("\t"))
  // }
  
  let result = sortedCards
    .map((card, i) => (i+1) * card.bid)
    .reduce((acc, n) => acc + n, 0)

  return result
}


const part2 = (rawInput: string) => {
  const input = parseInput(rawInput)

  input.cards.sort((a,b) => a.compareJokersWild(b))

  let result = input.cards
    .map((card, i) => (i+1) * card.bid)
    .reduce((acc, n) => acc + n, 0)

  return result
}

run({
  part1: {
    tests: [
//       {
//         input: `
// 55555 1
// TTTTT 1
// AAAAA 11
// 99999 11
// 22222 111
// KKKKK 1111
// 55554 2
// 55543 3
// 55544 4
// 55123 5
// 51234 6
// 55441 7
// A123A 7
// T3KAT 1
// TAKAT 1
// TAK4T 1
// JJJJJ 1111
// QQQQQ 1111

// `,
//         expected: 6440,
//       },
      {
        input: `32T3K 765
T55J5 684
KK677 28
KTJJT 220
QQQJA 483`,
        expected: 6440,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `32T3K 765
T55J5 684
KK677 28
KTJJT 220
QQQJA 483`,
        expected: 5905,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
