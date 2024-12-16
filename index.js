const { EmbedBuilder } = require("discord.js");
require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log("Bot successfully running.");
});
client.login(process.env.DISCORD_BOT_TOKEN);
client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === "ar ping") {
    const start = Date.now();
    message.reply(":ping_pong: Pong!").then(() => {
      const latency = Date.now() - start;
      message.channel.send(`in ${latency}ms`);
    });
  }
});

const prefix = "ar";

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === `${prefix} help`) {
    const embed = new EmbedBuilder()
      .setColor("#FFFFFF")
      .setTitle("📋 Command List")
      .setDescription(
        "Here is the list of commands!\nFor more info on a specific command, use `ar help {command}`\nNeed more help? Come join our **server**",
      )
      .addFields(
        { name: "🎖 Rankings", value: "`top`", inline: false },
        {
          name: "💰 Economy",
          value:
            "`cash` `give` `daily` `vote` `quest` `checklist` `shop` `buy`",
          inline: false,
        },
        {
          name: "🌱 Animals",
          value:
            "`zoo` `hunt` `sell` `sacrifice` `battle` `inv` `equip` `autohunt` `owodex` `lootbox`\n`crate` `battlesetting` `team` `weapon` `rename` `dismantle`",
          inline: false,
        },
        {
          name: "🎲 Gambling",
          value: "`slots` `coinflip` `lottery` `blackjack`",
          inline: false,
        },
        {
          name: "🎱 Fun",
          value: "`8b` `define` `gif` `pic` `roll` `choose`",
          inline: false,
        },
        {
          name: "🎭 Social",
          value:
            "`ship` `pray` `curse` `marry` `emoji` `profile` `level` `wallpaper`",
          inline: false,
        },
        {
          name: "😂 Meme Generation",
          value: "`meme` `randommeme`",
          inline: false,
        },
        {
          name: "🙂 Emotes",
          value:
            "`blush` `cry` `dance` `lewd` `shrug` `sleepy` `smile` `smug` `thumbsup`\n`thinking` `triggered` `teehee` `grin`",
          inline: false,
        },
        {
          name: "🤗 Actions",
          value:
            "`cuddle` `hug` `kiss` `lick` `nom` `pat` `poke` `slap` `bite` `highfive`\n`wave` `boop` `snuggle` `bully`",
          inline: false,
        },
        {
          name: "🔧 Utility",
          value:
            "`ping` `stats` `server` `disable` `censor` `math` `color` `prefix`",
          inline: false,
        },
      )
      .setFooter({
        text: "Use `ar help {command}` for more details about a command!",
        iconURL: message.author.avatarURL(),
      });

    message.channel.send({ embeds: [embed] });
  }
});
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const { content, author, guild } = message;

  // 'ar cash' command to show balance
  if (content.toLowerCase().startsWith('ar cash')) {
    const nickname = guild.members.cache.get(author.id)?.nickname || author.username;
    const balance = getUserBalance(author.id);  // Get the user's balance

    message.channel.send(`<:cash:1317903725347471473> | **${nickname}**, you currently have **${balance}** Cash!`);
  }
});

const { MessageActionRow, MessageButton } = require('discord.js');
const fs = require('fs');

const balancesFilePath = './balances.json';

function readBalancesFromFile() {
  if (!fs.existsSync(balancesFilePath)) {
    return {}; // If the file doesn't exist, return an empty object
  }
  const data = fs.readFileSync(balancesFilePath, 'utf-8');
  return JSON.parse(data);
}

// Helper function to save balances to file
function saveBalancesToFile(balances) {
  fs.writeFileSync(balancesFilePath, JSON.stringify(balances, null, 2), 'utf-8');
}

// In-memory balance storage (initializing from the file)
let balances = readBalancesFromFile();

// Helper function to get or initialize a user's balance
function getUserBalance(userId) {
  if (!balances[userId]) balances[userId] = 0; // Default balance is 0
  return balances[userId];
}

// When the bot is online
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const { content, author, guild } = message;  // Ensure you destructure the message object

  // 'ar addcash' command for the owner to add cash to their own balance or to another user's balance
  if (content.toLowerCase().startsWith('ar addcash')) {
    const args = content.split(' ');

    // Ensure the amount is valid and is the second to last argument
    const amount = parseInt(args[args.length - 2]);

    // Check if the amount is valid
    if (isNaN(amount) || amount <= 0) {
      message.channel.send(':x: | Please provide a valid amount of cash.');
      return;
    }

    // Check if a user is mentioned
    const mentionedUser = message.mentions.users.first();
    if (!mentionedUser) {
      message.channel.send(':x: | Please mention a user to add cash to.');
      return;
    }

    // Check if the user is the bot owner (optional)
    if (message.author.id !== '1081979270940868698') {
      message.channel.send(':x: | You do not have permission to use this command.');
      return;
    }

    // If the amount is valid, update the mentioned user's balance
    if (!balances[mentionedUser.id]) balances[mentionedUser.id] = 0;
    balances[mentionedUser.id] += amount;

    // Save updated balances
    saveBalancesToFile(balances);

    message.channel.send(`✅ | Successfully added **${amount}** cash to **${mentionedUser.username}**'s balance.`);
  }
});

const { embedBuilder } = require('discord.js');

// Object to store user cooldowns
const workCooldowns = {}; // { userId: timestamp }

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const { content, author } = message;

  // 'ar work' command
  if (content.toLowerCase() === 'ar work') {
    const userId = author.id;
    const currentTime = Date.now();

    // Check if the user is on cooldown
    if (workCooldowns[userId] && currentTime < workCooldowns[userId]) {
      const remainingTime = workCooldowns[userId] - currentTime;
      const minutes = Math.floor((remainingTime / 1000) / 60);
      const seconds = Math.floor((remainingTime / 1000) % 60);

      const cooldownEmbed = new EmbedBuilder()
        .setTitle('Cooldown...')
        .setDescription(`You've already worked! You can work again in **${minutes}m ${seconds}s**.`)
        .setColor('#DC143C');

      return message.channel.send({ embeds: [cooldownEmbed] });
    }

    // Generate random cash between 5000 and 10000
    const cashEarned = Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;

    // Update user's balance
    balances[userId] = (balances[userId] || 0) + cashEarned;

    // Set cooldown to 1 hour (3600000 milliseconds)
    workCooldowns[userId] = currentTime + 3600000;

    // Save updated balance to file
    saveBalancesToFile(balances);

    // Send work success embed
    const workEmbed = new EmbedBuilder()
      .setTitle('Worked as a Janitor 🧹')
      .setDescription(`You earned **${cashEarned.toLocaleString()}** cash!`)
      .setColor('#F0FFFF');

    return message.channel.send({ embeds: [workEmbed]
});
  }
});


client.login(
  "MTMxNzg2MTM2OTExNDEzMjU0Mg.GPIFym.Pw4iA_4-yQJDVV97xSTWEpsSUOl51Vh1NSu9lc",
);