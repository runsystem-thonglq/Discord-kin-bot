const { joinVoiceChannel, createAudioPlayer, createAudioResource, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice');
const scdl = require('soundcloud-downloader').default;
const { SlashCommandBuilder } = require("@discordjs/builders");
const queue = require('../data');
require('dotenv').config();
const { env } = require('process');
module.exports = {
  name: "play",
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a track from SoundCloud"),
  async execute(message, args) {
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
        "You need to provide a SoundCloud URL or search keyword!"
      );
    }
    const search = args.join(" ");
    try {
      const CLIENT_ID = env.SOUNDCLOUD_CLIENT_ID; // Replace with your SoundCloud Client ID
      const tracks = await scdl.search({
        query: search,
        resourceType: 'tracks',
        limit: 5,
        offset: 0,
        clientId: CLIENT_ID,
      });
      console.log("🚀 ~ execute ~ tracks:", tracks)

      if (tracks?.collection && tracks.collection.length > 0) {
        let reply = "Please choose a track by typing a number (1-5):\n";
        tracks.collection.forEach((track, index) => {
          reply += `${index + 1}. ${track.title} (${Math.floor(track.duration / 1000 / 60)}:${Math.floor(track.duration / 1000 % 60).toString().padStart(2, '0')})\n`;
        });
        message.channel.send(reply);

        const filter = (response) => {
          return (
            ["1", "2", "3", "4", "5"].includes(response.content) &&
            response.author.id === message.author.id
          );
        };
        const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ["time"] });
        const choice = collected.first().content;
        const track = tracks.collection[parseInt(choice) - 1];
        console.log("🚀 ~ execute ~ track:", track)
        await playSong(track.permalink_url, message, voiceChannel, CLIENT_ID);
      } else {
        message.channel.send("No track results found.");
      }
    } catch (error) {
      console.error(error);
      message.channel.send("There was an error searching for the track!");
    }
  },
};

async function playSong(url, message, voiceChannel, clientId) {
  try {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });
    const player = createAudioPlayer();
    connection.subscribe(player);

    const stream = await scdl.download(url, clientId);
    const resource = createAudioResource(stream);
    player.play(resource);

    player.on(AudioPlayerStatus.Playing, () => {
      console.log("The audio player has started playing!");
    });

    player.on(AudioPlayerStatus.Idle, () => {
      const serverQueue = queue.get(message.guild.id);
      if (serverQueue) {
        serverQueue.songs.shift();
        if (serverQueue.songs.length > 0) {
          playSong(serverQueue.songs[0].url, message, voiceChannel, clientId);
        } else {
          connection.destroy();
        }
      }
    });

    message.channel.send(`Now playing: ${url}`);
  } catch (error) {
    console.error("Error playing the track:", error);
    message.channel.send("There was an error playing the track!");
  }
}