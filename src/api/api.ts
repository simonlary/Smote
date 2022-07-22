import { God } from "./types/gods.js";
import { ApiGod } from "./api-types/gods.js";
import fetch from "node-fetch";

export async function getGods(): Promise<God[]> {
  const response = await fetch("https://cms.smitegame.com/wp-json/smite-api/all-gods/1");
  const data = (await response.json()) as ApiGod[];
  return data.map(apiGodToGod);
}

function apiGodToGod(apiGod: ApiGod): God {
  return {
    name: apiGod.name,
    class: apiGod.role === "Mage, Ranged" ? "Mage" : apiGod.role,
    damage: apiGod.type.includes("Physical") ? "Physical" : "Magical",
    range: apiGod.type.includes("Melee") ? "Melee" : "Ranged",
    pantheon: apiGod.pantheon,
  };
}
