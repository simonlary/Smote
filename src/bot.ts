import { Client, CommandInteraction, Intents, Interaction, MessageEmbed } from "discord.js";
import { Config } from "./config.js";
import { Gods } from "./gods.js";
import { registerCommands } from "./registerCommands.js";

export class Bot {
  public static async create(config: Config) {
    console.log("Creating client...");
    const client = new Client({
      intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES],
    });

    console.log("Loading Smite data...");
    const gods = await Gods.load();

    console.log("Creating bot...");
    const bot = new Bot(config, client, gods);

    console.log("Logging in...");
    await client.login(config.token);

    console.log("Registering commands...");
    await registerCommands(client, config);

    console.log("Bot started!");
    return bot;
  }

  private constructor(private readonly config: Config, private readonly client: Client, private readonly gods: Gods) {
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
    if (!interaction.isCommand()) {
      console.warn(`Received an interaction that is not a command : ${interaction.type}`);
      return;
    }

    console.log(
      `User "${interaction.user.tag}" (${interaction.user.id}) executed command "${interaction.commandName}".`
    );

    try {
      switch (interaction.commandName) {
        case "gods":
          await this.executeGodsCommand(interaction);
          break;
        default:
          console.warn(`Received an invalid command name to autocomplete : ${interaction.commandName}`);
      }
    } catch (e) {
      console.error(e);
      if (interaction.replied) {
        await interaction.followUp({ content: "Sorry, there was an error executing you command.", ephemeral: true });
      } else {
        await interaction.reply({ content: "Sorry, there was an error executing you command.", ephemeral: true });
      }
    }
  };

  private executeGodsCommand = async (interaction: CommandInteraction) => {
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

    const embed = new MessageEmbed()
      .setTitle("Smite Gods")
      .setColor(0xedc10e)
      .setDescription(result.map((god, index) => `${index + 1}. ${god}`).join("\n"));

    await interaction.reply({ embeds: [embed] });
  };
}
