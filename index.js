const { Client, VoiceConnectionStatus, IntentsBitField } = require('discord.js');
const fs = require('fs');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
require('dotenv').config();
const { env } = require('process');
const client = new Client({ 
  intents: [
    IntentsBitField.Flags.Guilds,
   IntentsBitField.Flags.GuildMembers,
   IntentsBitField.Flags.GuildMessages,
   IntentsBitField.Flags.MessageContent,
   IntentsBitField.Flags.GuildVoiceStates, // Ensure voice state intents are enabled
  ]
});



client.commands = new Map();

// Load command files
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {

  console.log("🚀 ~ interaction:", interaction)
});

client.on('messageCreate', async message => {

  if (!message.content.startsWith('/') || message.author.bot) return;
  
  const args = message.content.slice('/').trim().split(/ +/);
  const commandName = args.shift().replace("/","").toLowerCase();

  if (!client.commands.has(commandName)) return;

  const command = client.commands.get(commandName);

  try {
    await command.execute(message,args);
  } catch (error) {
    console.error(error);
    message.reply('There was an error trying to execute that command!');
  }
});



client.login(env.DISCORD_TOKEN);
