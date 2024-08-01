import { God } from "./api/types/god.js";
import { Item } from "./api/types/item.js";
import { Config } from "./config.js";
import { Gods } from "./gods.js";
import { Items } from "./items.js";
import { registerCommands } from "./registerCommands.js";
import {
    ActionRowBuilder,
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
    GatewayIntentBits,
    Interaction,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
} from "discord.js";

export class Bot {
    public static async create(config: Config) {
        console.log("Creating client...");
        const client = new Client({
            intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
        });

        console.log("Loading Smite data...");
        const gods = await Gods.load();
        const items = await Items.load();

        console.log("Creating bot...");
        const bot = new Bot(client, gods, items);

        console.log("Logging in...");
        await client.login(config.token);

        console.log("Registering commands...");
        await registerCommands(client, config);

        console.log("Bot started!");
        return bot;
    }

    private constructor(
        private readonly client: Client,
        private readonly gods: Gods,
        private readonly items: Items,
    ) {
        this.client.on("disconnect", () => {
            console.log("Disconnected");
        });
        this.client.on("interactionCreate", this.onInteractionCreate);
    }

    public shutdown() {
        console.log("Shutting down...");
        this.client.destroy();
    }

    private onInteractionCreate = async (interaction: Interaction) => {
        if (interaction.isChatInputCommand()) {
            this.onCommandInteraction(interaction);
        } else if (interaction.isStringSelectMenu()) {
            this.onSelectMenuInteraction(interaction);
        } else {
            console.warn(`Received an interaction that is not a command : ${interaction.type}`);
        }
    };

    private onCommandInteraction = async (interaction: ChatInputCommandInteraction) => {
        console.log(
            `User "${interaction.user.tag}" (${interaction.user.id}) executed command "${interaction.commandName}".`,
        );

        try {
            switch (interaction.commandName) {
                case "gods":
                    await this.executeGodsCommand(interaction);
                    break;
                case "randombuild":
                    await this.executeRandomBuildCommand(interaction);
                    break;
                default:
                    console.warn(`Received an invalid command name to execute : ${interaction.commandName}`);
            }
        } catch (e) {
            console.error(e);
            if (interaction.replied) {
                await interaction.followUp({
                    content: "Sorry, there was an error executing you command.",
                    ephemeral: true,
                });
            } else {
                await interaction.reply({
                    content: "Sorry, there was an error executing you command.",
                    ephemeral: true,
                });
            }
        }
    };

    private onSelectMenuInteraction = async (interaction: StringSelectMenuInteraction) => {
        console.log(
            `User "${interaction.user.tag}" (${interaction.user.id}) executed selection "${interaction.customId}".`,
        );

        try {
            if (interaction.customId.startsWith("reroll")) {
                await this.executeRerollSelectMenu(interaction);
            } else {
                console.warn(`Received an invalid select menu name to execute : ${interaction.customId}`);
            }
        } catch (e) {
            console.error(e);
            if (interaction.replied) {
                await interaction.followUp({
                    content: "Sorry, there was an error executing your selection.",
                    ephemeral: true,
                });
            } else {
                await interaction.reply({
                    content: "Sorry, there was an error executing your selection.",
                    ephemeral: true,
                });
            }
        }
    };

    private executeGodsCommand = async (interaction: ChatInputCommandInteraction) => {
        const options = {
            number: interaction.options.getInteger("number", true),
            class: interaction.options.getString("class"),
            damage: interaction.options.getString("damage"),
            range: interaction.options.getString("range"),
            pantheon: interaction.options.getString("pantheon"),
        };

        let filtered = this.gods;
        if (options.class != null) {
            filtered = filtered.withClass(options.class);
        }
        if (options.damage != null) {
            filtered = filtered.withDamage(options.damage);
        }
        if (options.range != null) {
            filtered = filtered.withRange(options.range);
        }
        if (options.pantheon != null) {
            filtered = filtered.withPantheon(options.pantheon);
        }

        const result = filtered.getRandom(options.number);

        const embed = new EmbedBuilder()
            .setTitle("Smite Gods")
            .setColor(0xa37553)
            .setDescription(this.formatInList(result));

        await interaction.reply({ embeds: [embed] });
    };

    private executeRandomBuildCommand = async (interaction: ChatInputCommandInteraction) => {
        const [god] = this.gods.getRandom(1);

        const starter = this.getRandomStarter(god);
        const glyph = this.getRandomGlyph(god);
        const otherItems = this.getRandomItems(god, glyph, 4);
        const items = [starter, ...otherItems, glyph];
        const shard = this.getRandomShard();
        const relics = this.getRandomRelics(2);

        const reply = this.createRandomBuildReply(god, items, shard, relics);

        await interaction.reply({ ...reply, content: interaction.user.toString() });
    };

    private executeRerollSelectMenu = async (interaction: StringSelectMenuInteraction) => {
        if (interaction.message.interaction?.user.id !== interaction.user.id) {
            await interaction.reply({ content: "You can't reroll someone else's items!", ephemeral: true });
            return;
        }

        const params = new URLSearchParams(interaction.customId.replace("reroll", ""));
        const godId = params.get("god");
        const itemsIds = params.get("items")?.split(",");
        const shardId = params.get("shard");
        const relicsIds = params.get("relics")?.split(",");
        if (godId == null || itemsIds == null || shardId == null || relicsIds == null) {
            throw new Error(`Invalid reroll customId : ${interaction.customId}`);
        }

        const god = this.gods.withId(+godId);
        const items = itemsIds.map((id) => this.items.withId(+id));
        let shard = this.items.withId(+shardId);
        const relics = relicsIds.map((id) => this.items.withId(+id));

        const itemToRerollIndex = items.findIndex((i) => i.id === +interaction.values[0]);
        const relicToRerollIndex = relics.findIndex((i) => i.id === +interaction.values[0]);
        if (itemToRerollIndex >= 0) {
            if (itemToRerollIndex === 0) {
                items[0] = this.getRandomStarter(god, items[0]);
            } else if (itemToRerollIndex === 5) {
                items[5] = this.getRandomGlyph(god, items[5]);
            } else {
                items[itemToRerollIndex] = this.getRandomItems(god, items[5], 1, ...items)[0];
            }
        } else if (shard.id === +interaction.values[0]) {
            shard = this.getRandomShard(shard);
        } else if (relicToRerollIndex >= 0) {
            relics[relicToRerollIndex] = this.getRandomRelics(1, ...relics)[0];
        } else {
            throw new Error(`Invalid reroll item id : ${interaction.values[0]}`);
        }

        const newReply = this.createRandomBuildReply(god, items, shard, relics);
        await interaction.update(newReply);
    };

    private getRandomStarter(god: God, ...except: Item[]) {
        return this.items
            .exceptAll(except)
            .forGod(god)
            .ofType("Item")
            .ofTier(2)
            .isStarter(true)
            .isEvolved(false)
            .getRandom(1)[0];
    }

    private getRandomGlyph(god: God, ...except: Item[]) {
        return this.items
            .exceptAll(except)
            .forGod(god)
            .ofType("Item")
            .ofTier(4)
            .isStarter(false)
            .isEvolved(false)
            .getRandom(1)[0];
    }

    private getRandomShard(...except: Item[]) {
        return this.items.exceptAll(except).ofType("Active").ofTier(2).getRandom(1)[0];
    }

    private getRandomItems(god: God, glyph: Item, number: number, ...except: Item[]) {
        return this.items
            .exceptAll(except)
            .forGod(god)
            .ofType("Item")
            .ofTier(3)
            .isStarter(false)
            .except(glyph.parentId ?? 0)
            .getRandom(number);
    }

    private getRandomRelics(number: number, ...except: Item[]) {
        return this.items.exceptAll(except).ofType("Active").ofTier(4).getRandom(number);
    }

    private createRandomBuildReply(god: God, items: Item[], shard: Item, relics: Item[]) {
        const embed = new EmbedBuilder()
            .setColor(0xa37553)
            .setTitle(god.name)
            .setThumbnail(god.imageUrl)
            .addFields([
                { name: "Items", value: this.formatInList(items) },
                { name: "Shard", value: this.formatInList([shard]) },
                { name: "Relics", value: this.formatInList(relics) },
            ]);

        const selectMenuId = `reroll?god=${god.id}&items=${items.map((i) => i.id).join(",")}&shard=${
            shard.id
        }&relics=${relics.map((i) => i.id)}`;
        const selectMenuOptions = [...items, shard, ...relics].map(this.itemToSelectMenuOption);
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(selectMenuId)
            .setPlaceholder("Reroll Item")
            .addOptions(selectMenuOptions);
        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
        return { embeds: [embed], components: [row] };
    }

    private itemToSelectMenuOption(item: Item) {
        return {
            label: item.name,
            value: item.id.toString(),
        };
    }

    private formatInList(list: { name: string }[]) {
        return list.map((obj, index) => `${index + 1}. ${obj.name}`).join("\n");
    }
}
