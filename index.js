const { Client, IntentsBitField } = require('discord.js');
const fs = require('fs');
const { VoiceConnectionStatus,joinVoiceChannel, createAudioPlayer, createAudioResource, getVoiceConnection, NoSubscriberBehavior } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
require('dotenv').config();
const { env } = require('process');
const port = env.PORT || 4000;
const express = require('express')
const app = express()
const gtts = require('gtts');
const path = require('path');
const bootstrap = require('./deploy/bootrap');
const queueManager = require("./data");
const play = require('play-dl')

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
   IntentsBitField.Flags.GuildVoiceStates,
   IntentsBitField.Flags.DirectMessages,
  ], partials: ['CHANNEL', 'MESSAGE']
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
  if (!interaction.isCommand()) return;

  const commandName = interaction.commandName.toLowerCase();

  if (!client.commands.has(commandName)) return;

  const command = client.commands.get(commandName);
  const args = interaction.options.data.map(option => option.value); // Lấ
  try {
    await command.execute(interaction,args);
  } catch (error) {
    console.error(error);
    interaction.channel.send('There was an error trying to execute that command!');
  }
});


// client.on('messageCreate', async message => {
//     console.log(222);
//   // if (!message.content.startsWith('/') || message.author.bot) return;
  
//   // const args = message.content.slice('/').trim().split(/ +/);
//   // const commandName = args.shift().replace("/","").toLowerCase();

//   // if (!client.commands.has(commandName)) return;

//   // const command = client.commands.get(commandName);

//   // try {
//   //   await command.execute(message,args);
//   // } catch (error) {
//   //   console.error(error);
//   //   message.channel.send('There was an error trying to execute that command!');
//   // }
// });






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

client.on('voiceStateUpdate', async (oldState, newState) => {
  // Kiểm tra xem thành viên có phải là bot hay không
  const guild = client.guilds.cache.get(oldState.guild.id);
  const member = newState.member;
  if (member.user.bot) return;

  let channel = newState.channel; // Kênh mà thành viên mới tham gia
  const defaultChannel = guild.channels.cache.find(channel => channel.type == 0 ) || channel;

  let message;
  if (channel) {
    // Thành viên tham gia hoặc chuyển sang kênh voice mới
    message = `Chào bé ${member.displayName} đã tham gia   ${channel.name}!`;
  } else {
    // Thành viên rời kênh voice
    channel = oldState.channel;
    if (channel) {
      message = `Tạm biệt bé ${member.displayName} đã rời   ${channel.name}.`;
    }
  }

  if (message) {
    const filePath = path.join(__dirname, 'greeting.mp3');
    const speech = new gtts(message, 'vi');

    speech.save(filePath, async function (err, result) {
      if (err) {
        console.error(err);
        return;
      }

      if (channel) {
        
        const serverQueue = queueManager.getQueue(channel.id);
        const connection = getVoiceConnection(guild.id);
        
        if (
          serverQueue &&
          connection &&
          connection.state.status === VoiceConnectionStatus.Ready
        ){
          serverQueue.player.pause();
          const player = createAudioPlayer();
          connection.subscribe(player);
  
          const resource = createAudioResource(filePath);
          player.play(resource);
  
          player.on('error', error => {
            console.error('Error playing audio:', error);
          });
  
          player.on('idle', () => {
            try {
              if (
                serverQueue &&
                connection &&
                connection.state.status === VoiceConnectionStatus.Ready
              ) {
                connection.subscribe(serverQueue.player);
  
                serverQueue.player.unpause();
              }
              fs.unlinkSync(filePath); // Xóa tệp âm thanh sau khi phát
            } catch (error) {
              
            }
          });
        }
        else{

          const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
          });
  
          const player = createAudioPlayer();
          connection.subscribe(player);
  
          const resource = createAudioResource(filePath);
          player.play(resource);
  
          player.on('error', error => {
            console.error('Error playing audio:', error);
          });
  
          player.on('idle', () => {
            try {
              
              player.stop();
              connection.destroy();
              fs.unlinkSync(filePath); // Xóa tệp âm thanh sau khi phát
            } catch (error) {
              
            }
          });
        }
        
        
      }
    });
  }
});

// client.on('voiceStateUpdate', (oldState, newState) => {
//   // Kiểm tra xem thành viên có phải là bot hay không
//   const guild = client.guilds.cache.get(oldState.guild.id);
//   // guild.channels.cache.forEach(g => {
//     //   console.log(`ID của máy chủ "${g.name}" là: ${g.id} channel.type:${g.type}  : ${g.guild.systemChannelId }`);
//     // });
//     const member = newState.member;
//     if (member.user.bot) return;
//   const channel = newState.channel; // Kênh mà thành viên mới tham gia
//   const defaultChannel = guild.channels.cache.find(channel => channel.type == 0 )||channel

//   if (channel) {
//     // Thành viên tham gia hoặc chuyển sang kênh voice mới
//     defaultChannel.send(`Chào bé ${member} đã tham gia kênh voice ${channel.name}!`);
//   } else {
//     // Thành viên rời kênh voice
//     const oldChannel = oldState.channel;
//     if (oldChannel) {
//       defaultChannel.send(`Tạm biệt bé ${member} đã rời kênh voice ${oldChannel.name}.`);
//     }
//   }
// });
client.login(env.DISCORD_TOKEN).then(()=>{
  bootstrap(client);
});
