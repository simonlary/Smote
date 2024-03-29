import { Bot } from "./bot.js";
import { Config } from "./config.js";

let bot: Bot;

try {
    console.log("Loading config...");
    const config = new Config();

    console.log("Instanciating bot...");
    // We need to keep this reference so the bot doesn't get garbage collected.
    bot = await Bot.create(config);
} catch (error) {
    console.error(`An error occured while starting the bot : ${error}`);
    process.exit();
}

process.addListener("SIGINT", () => {
    bot.shutdown();
});

process.addListener("SIGTERM", () => {
    bot.shutdown();
});
