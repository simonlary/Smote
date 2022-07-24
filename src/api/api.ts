import { Class, God } from "./types/god.js";
import { ApiGod } from "./api-types/apiGod.js";
import fetch from "node-fetch";
import { Item } from "./types/item.js";
import { ApiItem } from "./api-types/apiItem.js";

export async function getGods(): Promise<God[]> {
  const response = await fetch("https://cms.smitegame.com/wp-json/smite-api/all-gods/1");
  const data = (await response.json()) as ApiGod[];
  return data.map(apiGodToGod);
}

function apiGodToGod(apiGod: ApiGod): God {
  return {
    id: apiGod.id,
    name: apiGod.name,
    imageUrl: apiGod.card,
    class: apiGod.role === "Mage, Ranged" ? "Mage" : apiGod.role,
    damage: apiGod.type.includes("Physical") ? "Physical" : "Magical",
    range: apiGod.type.includes("Melee") ? "Melee" : "Ranged",
    pantheon: apiGod.pantheon,
  };
}

export async function getItems(): Promise<Item[]> {
  const response = await fetch("https://cms.smitegame.com/wp-json/smite-api/getItems/1");
  const data = (await response.json()) as ApiItem[];
  return data.filter((i) => i.ActiveFlag === "y").map(apiItemToItem);
}

function apiItemToItem(apiItem: ApiItem): Item {
  return {
    id: apiItem.ItemId,
    parentId: apiItem.ChildItemId === 0 ? undefined : apiItem.ChildItemId,
    name: apiItem.DeviceName,
    validClasses: getValidClasses(apiItem),
    tier: apiItem.ItemTier,
    type: apiItem.Type,
    isStarter: apiItem.StartingItem,
  };
}

function getValidClasses(apiItem: ApiItem) {
  const validClasses = new Set<Class>();

  // Check item availability based on the power type on the item.
  const hasPhysicalPower = itemHasStat(apiItem, "Physical Power");
  const hasMagicalPower = itemHasStat(apiItem, "Magical Power");
  if (hasPhysicalPower && !hasMagicalPower) {
    validClasses.add("Assassin");
    validClasses.add("Hunter");
    validClasses.add("Warrior");
  } else if (hasMagicalPower && !hasPhysicalPower) {
    validClasses.add("Guardian");
    validClasses.add("Mage");
  } else {
    validClasses.add("Assassin");
    validClasses.add("Hunter");
    validClasses.add("Warrior");
    validClasses.add("Guardian");
    validClasses.add("Mage");
  }

  // Limit the restricted roles if there are any.
  if (apiItem.RestrictedRoles.includes("assassin")) {
    validClasses.delete("Assassin");
  }
  if (apiItem.RestrictedRoles.includes("guardian")) {
    validClasses.delete("Guardian");
  }
  if (apiItem.RestrictedRoles.includes("hunter")) {
    validClasses.delete("Hunter");
  }
  if (apiItem.RestrictedRoles.includes("mage")) {
    validClasses.delete("Mage");
  }
  if (apiItem.RestrictedRoles.includes("warrior")) {
    validClasses.delete("Warrior");
  }

  return [...validClasses.values()];
}

function itemHasStat(apiItem: ApiItem, stat: string) {
  for (const item of apiItem.ItemDescription.Menuitems) {
    if (item.Description.includes(stat)) {
      return true;
    }
  }
  return false;
}
