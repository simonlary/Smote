import { getItems } from "./api/api.js";
import { God } from "./api/types/god.js";
import { Item } from "./api/types/item.js";

export class Items {
  public static async load() {
    const items = await getItems();
    return new Items(items);
  }

  private constructor(private readonly items: Item[]) {}

  public withId(itemId: number) {
    const item = this.items.find((i) => i.id === itemId);
    if (item == null) {
      throw new Error(`God with id ${itemId} doesn't exist.`);
    }
    return item;
  }

  public ofType(type: string) {
    return new Items(this.items.filter((i) => i.type === type));
  }

  public ofTier(tier: number) {
    return new Items(this.items.filter((i) => i.tier === tier));
  }

  public forGod(god: God) {
    const filterAcorns = god.name === "Ratatoskr" ? this.items : this.items.filter((i) => !i.name.includes("Acorn"));
    return new Items(filterAcorns.filter((i) => i.validClasses.includes(god.class)));
  }

  public isStarter(isStarter: boolean) {
    return new Items(this.items.filter((i) => i.isStarter === isStarter));
  }

  public isEvolved(isEvolved: boolean) {
    return new Items(this.items.filter((i) => i.name.startsWith("Evolved ") === isEvolved));
  }

  public except(itemId: number) {
    return new Items(this.items.filter((i) => i.id !== itemId));
  }

  public getRandom(number: number) {
    return this.items.sort(() => 0.5 - Math.random()).slice(0, number);
  }
}
