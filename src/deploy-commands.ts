import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/rest/v9";
import { Config } from "./config.js";
import { Client } from "discord.js";

async function getApplicationId(token: string) {
    const client = new Client({ intents: [] });
    await client.login(token);
    const id = client.application?.id;
    if (id == null) {
        throw new Error("Couldn't get the application id.");
    }
    client.destroy();
    return id;
}

function arrayToOptionChoices(array: string[]): [name: string, value: string][] {
    return array.map(x => [x, x]);
}

console.log("Loading config...");
const config = await Config.load();

console.log("Fetching application id...");
const applicationId = await getApplicationId(config.token);

console.log("Building commands...");
const gods = new SlashCommandBuilder()
    .setName("gods")
    .setDescription("Get a list of random Smite gods.")
    .addIntegerOption(option =>
        option
            .setName("number")
            .setDescription("The number of random gods to pick.")
            .setMinValue(1)
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName("class")
            .setDescription("The class of gods you want random gods from.")
            .setChoices(arrayToOptionChoices(["Assassin", "Guardian", "Hunter", "Mage", "Warrior"]))
    )
    .addStringOption(option =>
        option
            .setName("damage")
            .setDescription("The damage type of gods you want random gods from.")
            .setChoices(arrayToOptionChoices(["Magical", "Physical"]))
    )
    .addStringOption(option =>
        option
            .setName("range")
            .setDescription("The range of gods you want random gods from.")
            .setChoices(arrayToOptionChoices(["Melee", "Ranged"]))
    )
    .addStringOption(option =>
        option
            .setName("pantheon")
            .setDescription("The pantheon of gods you want random gods from.")
            .setChoices(arrayToOptionChoices(["Arthurian", "Babylonian", "Celtic", "Chinese", "Egyptian", "Great Old Ones", "Greek", "Hindu", "Japanese", "Mayan", "Norse", "Polynesian", "Roman", "Slavic", "Yoruba"]))
    )
    .toJSON();

console.log("Registering commands...");
const rest = new REST({ version: "9" }).setToken(config.token);
if (config.debugGuilds.length === 0) {
    await rest.put(Routes.applicationCommands(applicationId), { body: [gods] });
} else {
    for (const guildId of config.debugGuilds) {
        await rest.put(Routes.applicationGuildCommands(applicationId, guildId), { body: [gods] });
    }
}
