import { getGods } from "./api/api.js";
import { God } from "./api/types/god.js";

export class Gods {
    public static async load() {
        const gods = await getGods();
        return new Gods(gods);
    }

    private constructor(private readonly gods: God[]) {}

    public withId(godId: number) {
        const god = this.gods.find((g) => g.id === godId);
        if (god == null) {
            throw new Error(`God with id ${godId} doesn't exist.`);
        }
        return god;
    }

    public withClass(theClass: string) {
        return new Gods(this.gods.filter((g) => g.class === theClass));
    }

    public withDamage(damage: string) {
        return new Gods(this.gods.filter((g) => g.damage === damage));
    }

    public withRange(range: string) {
        return new Gods(this.gods.filter((g) => g.range === range));
    }

    public withPantheon(pantheon: string) {
        return new Gods(this.gods.filter((g) => g.pantheon === pantheon));
    }

    public getRandom(number: number) {
        return this.gods.sort(() => 0.5 - Math.random()).slice(0, number);
    }
}
