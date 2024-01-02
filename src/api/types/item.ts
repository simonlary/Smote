import { Class } from "./god.js";

export interface Item {
    id: number;
    parentId?: number;
    name: string;
    validClasses: Class[];
    tier: 1 | 2 | 3 | 4;
    type: "Active" | "Consumable" | "Item";
    isStarter: boolean;
}
