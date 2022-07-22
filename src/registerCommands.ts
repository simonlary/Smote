import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/rest/v9";
import { Client } from "discord.js";
import { Config } from "./config.js";

function arrayToOptionChoices<T extends string | number>(array: T[]) {
  return array.map((x) => ({ name: x.toString(), value: x }));
}

export async function registerCommands(client: Client, config: Config) {
  const applicationId = client.application?.id;
  if (applicationId == null) {
    throw new Error("Couldn't get the application id.");
  }

  const gods = new SlashCommandBuilder()
    .setName("gods")
    .setDescription("Get a list of random Smite gods.")
    .addIntegerOption((option) =>
      option.setName("number").setDescription("The number of random gods to pick.").setMinValue(1).setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("class")
        .setDescription("The class of gods you want random gods from.")
        .setChoices(...arrayToOptionChoices(["Assassin", "Guardian", "Hunter", "Mage", "Warrior"]))
    )
    .addStringOption((option) =>
      option
        .setName("damage")
        .setDescription("The damage type of gods you want random gods from.")
        .setChoices(...arrayToOptionChoices(["Magical", "Physical"]))
    )
    .addStringOption((option) =>
      option
        .setName("range")
        .setDescription("The range of gods you want random gods from.")
        .setChoices(...arrayToOptionChoices(["Melee", "Ranged"]))
    )
    .addStringOption((option) =>
      option
        .setName("pantheon")
        .setDescription("The pantheon of gods you want random gods from.")
        .setChoices(
          ...arrayToOptionChoices([
            "Arthurian",
            "Babylonian",
            "Celtic",
            "Chinese",
            "Egyptian",
            "Great Old Ones",
            "Greek",
            "Hindu",
            "Japanese",
            "Maya",
            "Norse",
            "Polynesian",
            "Roman",
            "Slavic",
            "Voodoo",
            "Yoruba",
          ])
        )
    )
    .toJSON();

  const randombuild = new SlashCommandBuilder()
    .setName("randombuild")
    .setDescription("Get a random build for a random Smite god.")
    .toJSON();

  const rest = new REST({ version: "9" }).setToken(config.token);
  if (config.debugGuilds.length === 0) {
    await rest.put(Routes.applicationCommands(applicationId), { body: [gods, randombuild] });
  } else {
    for (const guildId of config.debugGuilds) {
      await rest.put(Routes.applicationGuildCommands(applicationId, guildId), { body: [gods, randombuild] });
    }
  }
}
