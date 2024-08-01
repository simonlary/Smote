export type Class = "Assassin" | "Guardian" | "Hunter" | "Mage" | "Warrior";

export type Damage = "Magical" | "Physical";

export type Range = "Melee" | "Ranged";

export type Pantheon =
    | "Arthurian"
    | "Babylonian"
    | "Celtic"
    | "Chinese"
    | "Egyptian"
    | "Great Old Ones"
    | "Greek"
    | "Hindu"
    | "Japanese"
    | "Maya"
    | "Norse"
    | "Polynesian"
    | "Roman"
    | "Slavic"
    | "Voodoo"
    | "Yoruba";

export interface God {
    id: number;
    name: string;
    imageUrl: string;
    class: Class;
    damage: Damage;
    range: Range;
    pantheon: Pantheon;
}
