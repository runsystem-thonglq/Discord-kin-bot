const {
  getVoiceConnection,
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
} = require("@discordjs/voice");
const { SlashCommandBuilder } = require("@discordjs/builders");
const gtts = require("gtts");
const fs = require("fs");
const path = require("path");
const queueManager = require("../data");

module.exports = {
  name: "voice",
  data: new SlashCommandBuilder()
    .setName("voice")
    .setDescription("Chuyển văn bản thành giọng nói")
    .addStringOption((option) =>
      option
        .setName("text")
        .setDescription("Văn bản cần chuyển thành giọng nói")
        .setRequired(true)
    ),

  async execute(interaction, args) {
    const text = args.join(" ");
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply("Bạn cần vào kênh thoại để bot nói!");
    }

    const permissions = voiceChannel.permissionsFor(interaction.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return interaction.channel.send(
        "Bot cần quyền kết nối và nói trong kênh thoại!"
      );
    }

    const filePath = path.join(__dirname, "tts.mp3");
    const gttsInstance = new gtts(text, "vi"); // 'vi' for Vietnamese

    gttsInstance.save(filePath, async (err) => {
      if (err) {
        console.error(err);
        return interaction.channel.send(
          "Có lỗi xảy ra khi chuyển văn bản thành giọng nói."
        );
      }

      try {
        const serverQueue = queueManager.getQueue(voiceChannel.id);
        const connection = getVoiceConnection(interaction.guild.id);

        if (
          serverQueue &&
          connection &&
          connection.state.status === VoiceConnectionStatus.Ready
        ) {
          serverQueue.player.pause();
          const ttsPlayer = createAudioPlayer();
          connection.subscribe(ttsPlayer);

          const resource = createAudioResource(filePath);
          ttsPlayer.play(resource);

          ttsPlayer.on(AudioPlayerStatus.Playing, () => {
            // console.log("Đang phát TTS audio.");
          });

          ttsPlayer.on(AudioPlayerStatus.Idle, () => {
            if (
              serverQueue &&
              connection &&
              connection.state.status === VoiceConnectionStatus.Ready
            ) {
              connection.subscribe(serverQueue.player);

              serverQueue.player.unpause();
            }
            fs.unlinkSync(filePath);
          });
        } else {
          // Create a new voice connection and audio player for TTS
          const ttsConnection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
          });

          const ttsPlayer = createAudioPlayer();
          ttsConnection.subscribe(ttsPlayer);

          const resource = createAudioResource(filePath);
          ttsPlayer.play(resource);

          ttsPlayer.on(AudioPlayerStatus.Playing, () => {
            // console.log("Đang phát TTS audio.");
          });

          ttsPlayer.on(AudioPlayerStatus.Idle, () => {
            ttsConnection.destroy();
            fs.unlinkSync(filePath);
          });
        }

        interaction.channel.send("Đang chuyển văn bản thành giọng nói...");
      } catch (error) {
        console.error("Error playing the TTS audio:", error);
        interaction.channel.send("Có lỗi xảy ra khi bot nói.");
      }
    });
  },
};
