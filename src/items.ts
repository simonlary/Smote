import { getItems } from "./api/api.js";
import { Class } from "./api/types/god.js";
import { Item } from "./api/types/item.js";

export class Items {
  public static async load() {
    const items = await getItems();
    return new Items(items);
  }

  private constructor(private readonly items: Item[]) {}

  public ofType(type: string) {
    return new Items(this.items.filter((i) => i.type === type));
  }

  public ofTier(tier: number) {
    return new Items(this.items.filter((i) => i.tier === tier));
  }

  public forClass(theClass: string) {
    return new Items(this.items.filter((i) => i.validClasses.includes(theClass as Class)));
  }

  public isStarter(isStarter: boolean) {
    return new Items(this.items.filter((i) => i.isStarter === isStarter));
  }

  public except(itemId: number) {
    return new Items(this.items.filter((i) => i.id !== itemId));
  }

  public getRandom(number: number) {
    return this.items.sort(() => 0.5 - Math.random()).slice(0, number);
  }
}
