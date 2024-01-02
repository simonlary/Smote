// Types for https://cms.smitegame.com/wp-json/smite-api/all-gods/1

export interface ApiGod {
    id: number;
    name: string;
    title: string;
    free: "true" | "";
    new: YesNo;
    pantheon: Pantheon;
    pros: string;
    type: Type;
    role: Role;
    card: string;
    pantheon_EN: string;
    god_name_EN: string;
    role_EN: Role;
}

type Pantheon =
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

enum YesNo {
    No = "n",
    Yes = "y",
}

enum Role {
    Assassin = "Assassin",
    Guardian = "Guardian",
    Hunter = "Hunter",
    Mage = "Mage",
    MageRanged = "Mage, Ranged",
    Warrior = "Warrior",
}

enum Type {
    Magical = "Magical",
    MeleeMagical = "Melee, Magical",
    MeleePhysical = "Melee, Physical",
    RangedMagical = "Ranged, Magical",
    RangedPhysical = "Ranged, Physical",
}
