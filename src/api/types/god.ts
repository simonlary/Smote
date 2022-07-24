const Classes = ["Assassin", "Guardian", "Hunter", "Mage", "Warrior"] as const;
export type Class = typeof Classes[number];

const Damages = ["Magical", "Physical"] as const;
export type Damage = typeof Damages[number];

const Ranges = ["Melee", "Ranged"] as const;
export type Range = typeof Ranges[number];

const Pantheons = [
  "Arthurian",
  "Babylonian",
  "Celtic",
  "Chinese",
  "Egyptian",
  "Great Old Ones",
  "Greek",
  "Hindu",
  "Japanese",
  "Maya",
  "Norse",
  "Polynesian",
  "Roman",
  "Slavic",
  "Voodoo",
  "Yoruba",
] as const;
export type Pantheon = typeof Pantheons[number];

export interface God {
  id: number;
  name: string;
  imageUrl: string;
  class: Class;
  damage: Damage;
  range: Range;
  pantheon: Pantheon;
}
