const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const { SlashCommandBuilder } = require("@discordjs/builders");
const ytdl = require('ytdl-core');
const ytsearch = require('yt-search');
require("dotenv").config();
const queueManager = require("../data");
const playSong = require("../utils/playYT");
const play = require('play-dl');
module.exports = {
  name: "play",
  data: new SlashCommandBuilder()
    .setName("play")
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
      let video;
      if (play.yt_validate(search) === 'video') {
        const videoInfo = await play.video_info(search);
        video = { title: videoInfo.video_details.title, url: videoInfo.video_details.url };
      } else {
        const searchResult = await play.search(search, { limit: 1 });
        if (!searchResult.length) return message.channel.send("Không tìm thấy kết quả nào");
        video = { title: searchResult[0].title, url: searchResult[0].url };
      }
      await handleSong(video, message, voiceChannel);
    } catch (error) {
      console.error(error);
      message.channel.send("There was an error searching for the track!");
    }
  },
};

async function handleSong(video, message, voiceChannel) {
  console.log("🚀 ~ handleSong ~ Starting handleSong function");
  let serverQueue = queueManager.getQueue(voiceChannel.id);

  if (!serverQueue) {
    console.log("🚀 ~ handleSong ~ Creating new queue");
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
    title: video.title,
    url: video.url,
  });
  console.log(`🚀 ~ handleSong ~ Added song to queue: ${video.title}`);

  if (!serverQueue.playing) {
    console.log("🚀 ~ handleSong ~ Starting playback");
    serverQueue.playing = true;
    try {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
      });
      console.log("🚀 ~ handleSong ~ Voice connection established");
      serverQueue.connection = connection;
      serverQueue.player = createAudioPlayer();
      connection.subscribe(serverQueue.player);

      serverQueue.player.on(AudioPlayerStatus.Playing, () => {
        console.log("🚀 ~ handleSong ~ AudioPlayerStatus.Playing event fired");
        if (serverQueue.songs.length > 0) {
          console.log("🚀 ~ handleSong ~ Now playing:", serverQueue.songs[0].title);
          message.channel.send(
            `🔊 Đang phát: ${serverQueue.songs[0].title} ${serverQueue.songs[0].url}`
          );
        }
      });

      serverQueue.player.on(AudioPlayerStatus.Idle, () => {
        console.log("🚀 ~ handleSong ~ AudioPlayerStatus.Idle event fired");
        serverQueue.songs.shift();
        playSong(serverQueue, message.channel);
      });

      serverQueue.player.on('error', (error) => {
        console.error('🚀 ~ handleSong ~ Audio player error:', error);
        console.error('Error details:', error.resource.metadata);
        // Implement additional error handling or recovery logic here
      });

      playSong(serverQueue, message.channel);
    } catch (error) {
      console.error("🚀 ~ handleSong ~ Error in playback setup:", error);
      queueManager.deleteQueue(voiceChannel.id);
      return message.channel.send(
        "There was an error connecting to the voice channel!"
      );
    }
  } else {
    message.channel.send(`🎤 Đã thêm vào danh sách: ${video.title}`);
  }
}