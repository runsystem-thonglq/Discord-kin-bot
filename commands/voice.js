const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('@discordjs/builders');
const gtts = require('gtts');
const fs = require('fs');
const path = require('path');

module.exports = {
  name:'voice',
  data: new SlashCommandBuilder()
    .setName('voice')
    .setDescription('Chuyển văn bản thành giọng nói')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Văn bản cần chuyển thành giọng nói')
        .setRequired(true)
    ),

  async execute(interaction,args) {
    const text = args.join(" ");
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply('Bạn cần vào kênh thoại để bot nói!');
    }

    const permissions = voiceChannel.permissionsFor(interaction.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
      return interaction.reply('Bot cần quyền kết nối và nói trong kênh thoại!');
    }

    const filePath = path.join(__dirname, 'tts.mp3');
    const gttsInstance = new gtts(text, 'vi'); // 'vi' for Vietnamese

    gttsInstance.save(filePath, async (err) => {
      if (err) {
        console.error(err);
        return interaction.reply('Có lỗi xảy ra khi chuyển văn bản thành giọng nói.');
      }

      try {
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: interaction.guild.id,
          adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();
        connection.subscribe(player);

        const resource = createAudioResource(filePath);
        player.play(resource);

        player.on(AudioPlayerStatus.Playing, () => {
          console.log('OK :)))');
        });

        player.on(AudioPlayerStatus.Idle, () => {
          connection.destroy();
          fs.unlinkSync(filePath);
        });

        interaction.reply('OK :)))');
      } catch (error) {
        console.error('Error playing the TTS audio:', error);
        interaction.reply('Có lỗi xảy ra khi bot nói.');
      }
    });
  },
};
