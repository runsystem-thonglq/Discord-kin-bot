const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const scdl = require("soundcloud-downloader").default;
const { SlashCommandBuilder } = require("@discordjs/builders");
require("dotenv").config();
const { env } = require("process");
const queueManager = require("../data");
const playSong = require("../utils/playsong");
const { isValidUrl } = require("../utils/helpers");

module.exports = {
  name: "play",
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a track from SoundCloud"),
  async execute(message, args) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.channel.send("🎧 Cần join channel để nge nhạc !!!");
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
      const CLIENT_ID = env.SOUNDCLOUD_CLIENT_ID;


    // Kiểm tra nếu input là URL SoundCloud hợp lệ
    if (isValidUrl(search) && search.includes("soundcloud.com")) {
      try {
        const track = await scdl.getInfo(search, CLIENT_ID);
        await handleSong(track, message, voiceChannel, CLIENT_ID);
        return;
      } catch (error) {
        return message.channel.send("Invalid SoundCloud URL or track not found!");
      }
    }

      const tracks = await scdl.search({
        query: search,
        resourceType: "tracks",
        limit: 5,
        offset: 0,
        clientId: CLIENT_ID,
      });

      if (tracks?.collection && tracks.collection.length > 0) {
        let reply = "🎵  Chọn 1 bài bằng cách nhập (1-5):\n";
        tracks.collection.forEach((track, index) => {
          reply += `${index + 1}. ${track.title} (${Math.floor(
            track.duration / 1000 / 60
          )}:${Math.floor((track.duration / 1000) % 60)
            .toString()
            .padStart(2, "0")})\n`;
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
        const track = tracks.collection[parseInt(choice) - 1];
        await handleSong(track, message, voiceChannel, CLIENT_ID);
      } else {
        message.channel.send("Không tìm thấy kết quả nào");
      }
    } catch (error) {
      console.log("🚀 ~ execute ~ error:", error)
      message.channel.send("There was an error searching for the track!");
    }
  },
};

async function handleSong(track, message, voiceChannel, clientId) {
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
    title: track.title,
    url: track.permalink_url,
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
        playSong(serverQueue, clientId, message.channel);
      });

      playSong(serverQueue, clientId, message.channel);
    } catch (error) {
      queueManager.deleteQueue(voiceChannel.id);
      return message.channel.send(
        "There was an error connecting to the voice channel!"
      );
    }
  } else {
    message.channel.send(`🎤 Đã thêm vào danh sách: ${track.title}`);
  }
}

