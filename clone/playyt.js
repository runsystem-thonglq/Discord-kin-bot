const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { google } = require('googleapis');
require("dotenv").config();
const { env } = require("process");
const queueManager = require("../data");
const playYT = require("../utils/playYT");

module.exports = {
  name: "pyoutube",
  data: new SlashCommandBuilder()
    .setName("pyoutube")
    .setDescription("Play a track from YouTube"),
  async execute(message, args) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.channel.send("🎧 Cần join channel để nghe nhạc !!!");
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
      const YOUTUBE_API_KEY = env.YOUTUBE_API_KEY;
      const youtube = google.youtube({
        version: 'v3',
        auth: YOUTUBE_API_KEY
      });

      const response = await youtube.search.list({
        part: 'snippet',
        q: search,
        type: 'video',
        maxResults: 5
      });

      const videos = response.data.items;

      if (videos && videos.length > 0) {
        let reply = "🎵  Chọn 1 bài bằng cách nhập (1-5):\n";
        videos.forEach((video, index) => {
          reply += `${index + 1}. ${video.snippet.title}\n`;
        });
        message.channel.send(reply);

        const filter = (response) => {
          return (
            ["1", "2", "3", "4", "5"].includes(response.content) &&
            response.author.id === message.user.id
          );
        };
        const collected = await message.channel.awaitMessages({
          filter,
          max: 1,
          time: 30000,
          errors: ["time"],
        });
        const choice = collected.first().content;
        const video = videos[parseInt(choice) - 1];
        await handleSong(video, message, voiceChannel);
      } else {
        message.channel.send("Không tìm thấy kết quả nào");
      }
    } catch (error) {
      console.error(error);
      message.channel.send("There was an error searching for the track!");
    }
  },
};

async function handleSong(video, message, voiceChannel) {
  let serverQueue = queueManager.getQueue(voiceChannel.id);

  if (!serverQueue) {
    serverQueue = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: false,
      player: null,
    };
    queueManager.setQueue(voiceChannel.id, serverQueue);
  }

  serverQueue.songs.push({
    title: video.snippet.title,
    url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
  });

  if (!serverQueue.playing) {
    serverQueue.playing = true;
    try {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
      });
      serverQueue.connection = connection;
      serverQueue.player = createAudioPlayer();
      connection.subscribe(serverQueue.player);

      serverQueue.player.on(AudioPlayerStatus.Playing, () => {
        if (serverQueue.songs.length > 0) {
          console.log("🚀 ~ playSong ~ Playing:", serverQueue.songs.length);
          message.channel.send(
            `🔊 Đang phát: ${serverQueue.songs[0].title} ${serverQueue.songs[0].url}`
          );
        }
      });

      serverQueue.player.on(AudioPlayerStatus.Idle, () => {
        console.log("🚀 ~ playSong ~ STOPPP:", serverQueue.songs.length);
        serverQueue.songs.shift();
        playYT(serverQueue, message.channel);
      });

      playYT(serverQueue, message.channel);
    } catch (error) {
      queueManager.deleteQueue(voiceChannel.id);
      return message.channel.send(
        "There was an error connecting to the voice channel!"
      );
    }
  } else {
    message.channel.send(`🎤 Đã thêm vào danh sách: ${video.snippet.title}`);
  }
}