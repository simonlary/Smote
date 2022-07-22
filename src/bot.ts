import { Client, CommandInteraction, Intents, Interaction, MessageEmbed } from "discord.js";
import { Config } from "./config.js";
import { Gods } from "./gods.js";
import { Items } from "./items.js";
import { registerCommands } from "./registerCommands.js";

export class Bot {
  public static async create(config: Config) {
    console.log("Creating client...");
    const client = new Client({
      intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES],
    });

    console.log("Loading Smite data...");
    const gods = await Gods.load();
    const items = await Items.load();

    console.log("Creating bot...");
    const bot = new Bot(config, client, gods, items);

    console.log("Logging in...");
    await client.login(config.token);

    console.log("Registering commands...");
    await registerCommands(client, config);

    console.log("Bot started!");
    return bot;
  }

  private constructor(
    private readonly config: Config,
    private readonly client: Client,
    private readonly gods: Gods,
    private readonly items: Items
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
        case "randombuild":
          await this.executeRandomBuildCommand(interaction);
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
      .setColor(0xa37553)
      .setDescription(this.formatInList(result));

    await interaction.reply({ embeds: [embed] });
  };

  private executeRandomBuildCommand = async (interaction: CommandInteraction) => {
    const [god] = this.gods.getRandom(1);

    const starter = this.items.forClass(god.class).ofType("Item").ofTier(2).isStarter(true).getRandom(1)[0];
    const glyph = this.items.forClass(god.class).ofType("Item").ofTier(4).isStarter(false).getRandom(1)[0];
    const otherItems = this.items
      .forClass(god.class)
      .ofType("Item")
      .ofTier(3)
      .isStarter(false)
      .except(glyph.parentId ?? 0)
      .getRandom(4);
    const items = [starter, ...otherItems, glyph];

    const relics = this.items.ofType("Active").ofTier(4).getRandom(2);

    const embed = new MessageEmbed()
      .setColor(0xa37553)
      .setTitle(god.name)
      .setThumbnail(god.imageUrl)
      .addField("Items", this.formatInList(items))
      .addField("Relics", this.formatInList(relics));

    await interaction.reply({ embeds: [embed] });
  };

  private formatInList(list: { name: string }[]) {
    return list.map((obj, index) => `${index + 1}. ${obj.name}`).join("\n");
  }
}
