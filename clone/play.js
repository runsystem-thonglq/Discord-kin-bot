const { joinVoiceChannel, createAudioPlayer, createAudioResource, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require("ytdl-core");
const ytSearch = require('yt-search');

const videoChoices = new Map();
const queue = require('../data');
const { SlashCommandBuilder } = require("@discordjs/builders");
module.exports = {
  name: "play",

  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song from YouTube"),
    // .addStringOption((option) =>
    //   option
    //     .setName("query")
    //     .setDescription("The song to search for or the YouTube URL")
    //     .setRequired(true)
    // ),

  async execute(message, args) {
    console.log("🚀 ~ execute ~ args:", args)
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      return message.channel.send("You need to be in a voice channel to play music!");
    }

    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send(
        "I need the permissions to join and speak in your voice channel!"
      );
    }

    if (args?.length === 0) {
      return message.channel.send(
        "You need to provide a YouTube URL or search keyword!"
      );
    }

    const search = args.join(" ");
    try {
      const videoResult = await ytSearch(search);
      if (videoResult && videoResult.videos.length > 0) {
        const videos = videoResult.videos.slice(0, 5);
        let reply = "Please choose a video by typing a number (1-5):\n";

        videos.forEach((video, index) => {
          reply += `${index + 1}. ${video.title} (${video.timestamp})\n`;
        });

        message.channel.send(reply);

        // Save the choices to the map
        videoChoices.set(message.author.id, videos);

        const filter = (response) => {
          return (
            ["1", "2", "3", "4", "5"].includes(response.content) &&
            response.author.id === message.author.id
          );
        };

        const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ["time"] });
        const choice = collected.first().content;
        const video = videos[parseInt(choice) - 1];
        await playSong(video.url, message, voiceChannel);
      } else {
        message.channel.send("No video results found.");
      }
    } catch (error) {
      console.error(error);
      message.channel.send("There was an error searching for the song!");
    }
  },
};

async function playSong(url, message, voiceChannel) {
  try {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    connection.subscribe(player);

    const stream = ytdl(url, { filter: "audioonly" });
    const resource = createAudioResource(stream);
    // player.play(resource);

    player.on(AudioPlayerStatus.Playing, () => {
      console.log("The audio player has started playing!");
    });

    player.on(AudioPlayerStatus.Idle, () => {
      const serverQueue = queue.get(message.guild.id);
      if (serverQueue) {
        serverQueue.songs.shift();
        if (serverQueue.songs.length > 0) {
          playSong(serverQueue.songs[0].url, message, voiceChannel);
        } else {
          connection.destroy();
        }
      }
    });

    message.channel.send(`Now playing: ${url}`);
  } catch (error) {
    console.error("Error playing the song:", error);
    message.channel.send("There was an error playing the song!");
  }
}

// const { joinVoiceChannel, createAudioPlayer, createAudioResource, entersState, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice');
// const ytdl = require('ytdl-core');
// const ytSearch = require('yt-search');

// const videoChoices = new Map();

// module.exports = {
//   name: 'play',
//   description: 'Search and play a song from YouTube.',
//   async execute(message, args) {
//     console.log("🚀 ~ execute ~ message.member.voice:", message.member.voice)
//     const voiceChannel = message.member.voice.channel;

//     if (!voiceChannel) {
//       return message.channel.send('You need to be in a voice channel to play music!');
//     }

//     const permissions = voiceChannel.permissionsFor(message.client.user);
//     if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
//       return message.channel.send('I need the permissions to join and speak in your voice channel!');
//     }

//     if (args.length === 0) {
//       return message.channel.send('You need to provide a YouTube URL or search keyword!');
//     }

//     const search = args.join(' ');

//     try {
//       const videoResult = await ytSearch(search);
//       if (videoResult && videoResult.videos.length > 0) {
//         const videos = videoResult.videos.slice(0, 5);
//         let reply = 'Please choose a video by typing a number (1-5):\n';

//         videos.forEach((video, index) => {
//           reply += `${index + 1}. ${video.title} (${video.timestamp})\n`;
//         });

//         message.channel.send(reply);

//         // Save the choices to the map
//         videoChoices.set(message.author.id, videos);

//         const filter = response => {
//           return (
//             ['1', '2', '3', '4', '5'].includes(response.content) &&
//             response.author.id === message.author.id
//           );
//         };

//         message.channel
//           .awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
//           .then(collected => {
//             const choice = collected.first().content;
//             const video = videos[parseInt(choice) - 1];

//             playSong(video.url, message, voiceChannel);
//           })
//           .catch(() => {
//             message.channel.send('You did not choose a video in time.');
//             videoChoices.delete(message.author.id);
//           });
//       } else {
//         message.channel.send('No video results found.');
//       }
//     } catch (error) {
//       console.error(error);
//       message.channel.send('There was an error searching for the song!');
//     }
//   },
// };

// async function playSong(url, message, voiceChannel) {
//   try {
//     const connection = joinVoiceChannel({
//       channelId: voiceChannel.id,
//       guildId: message.guild.id,
//       adapterCreator: message.guild.voiceAdapterCreator,
//     });

//     const player = createAudioPlayer();
//     connection.subscribe(player);

//     const stream = ytdl(url, { filter: 'audioonly' });
//     const resource = createAudioResource(stream);

//     player.play(resource);

//     player.on(AudioPlayerStatus.Playing, () => {
//       console.log('The audio player has started playing!');
//     });

//     player.on(AudioPlayerStatus.Idle, () => {
//       connection.destroy();
//       console.log('The audio player has stopped playing!');
//     });

//     message.channel.send(`Now playing: ${url}`);
//   } catch (error) {
//     console.error('Error playing the song:', error);
//     message.channel.send('There was an error playing the song!');
//   }
// }
