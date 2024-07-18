const { Client, VoiceConnectionStatus, IntentsBitField } = require('discord.js');
const fs = require('fs');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
require('dotenv').config();
const { env } = require('process');
const port = env.PORT || 4000;
const express = require('express')
const app = express()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

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
  client.guilds.cache.forEach(guild => {
    console.log(`ID của máy chủ "${guild.name}" là: ${guild.id}`);
  });
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

client.on('guildMemberAdd', member => {
  const guild = client.guilds.cache.get(oldState.guild.id);
  const channel = member.guild.systemChannel; // Hoặc thay bằng ID của kênh chào mừng
  const defaultChannel = guild.channels.cache.find(channel => channel.type == 0 )||channel
  if (defaultChannel) {
    defaultChannel.send(`Chào mừng ${member} đã tham gia máy chủ!`);
  }
});

client.on('presenceUpdate', (oldPresence, newPresence) => {
  if (!oldPresence || oldPresence.status === 'offline') {
    const member = newPresence.member;
    const guild = client.guilds.cache.get(oldState.guild.id);
    const channel = member.guild.systemChannel; // Hoặc thay bằng ID của kênh chào mừng
    const defaultChannel = guild.channels.cache.find(channel => channel.type == 0 )||channel
    if (defaultChannel) {
      defaultChannel.send(`Chào mừng ${member} đã online!`);
    }
  }
});

client.on('voiceStateUpdate', (oldState, newState) => {
  const guild = client.guilds.cache.get(oldState.guild.id);
  // guild.channels.cache.forEach(g => {
  //   console.log(`ID của máy chủ "${g.name}" là: ${g.id} channel.type:${g.type}  : ${g.guild.systemChannelId }`);
  // });
  const member = newState.member;
  const channel = newState.channel; // Kênh mà thành viên mới tham gia
  const defaultChannel = guild.channels.cache.find(channel => channel.type == 0 )||channel

  if (channel) {
    // Thành viên tham gia hoặc chuyển sang kênh voice mới
    defaultChannel.send(`Chào bé ${member} đã tham gia kênh voice ${channel.name}!`);
  } else {
    // Thành viên rời kênh voice
    const oldChannel = oldState.channel;
    if (oldChannel) {
      defaultChannel.send(`Tạm biệt bé ${member} đã rời kênh voice ${oldChannel.name}.`);
    }
  }
});
client.login(env.DISCORD_TOKEN);
