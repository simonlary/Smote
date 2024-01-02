// Types for https://cms.smitegame.com/wp-json/smite-api/getItems/1

export interface ApiItem {
    ActiveFlag: YesNo;
    ChildItemId: number;
    DeviceName: string;
    Glyph: YesNo;
    IconId: number;
    ItemDescription: ItemDescription;
    ItemId: number;
    ItemTier: 1 | 2 | 3 | 4;
    Price: number;
    RestrictedRoles: RestrictedRoles;
    RootItemId: number;
    ShortDesc: string;
    StartingItem: boolean;
    Type: Type;
    itemIcon_URL: string;
    ret_msg: null;
}

enum YesNo {
    No = "n",
    Yes = "y",
}

interface ItemDescription {
    Description: string | null;
    Menuitems: MenuItem[];
    SecondaryDescription: string | null;
}

interface MenuItem {
    Description: string;
    Value: string;
}

type GodClass = "assassin" | "guardian" | "hunter" | "mage" | "warrior";

type RestrictedRoles =
    | "no restrictions"
    | `${GodClass}`
    | `${GodClass},${GodClass}`
    | `${GodClass},${GodClass},${GodClass}`
    | `${GodClass},${GodClass},${GodClass},${GodClass}`
    | `${GodClass},${GodClass},${GodClass},${GodClass},${GodClass}`;

enum Type {
    Active = "Active",
    Consumable = "Consumable",
    Item = "Item",
}
