const { SlashCommandBuilder } = require('@discordjs/builders');
const { AttachmentBuilder } = require('discord.js');
const googleTTS = require('google-tts-api');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ts')
    .setDescription('Chuyển đổi văn bản thành giọng nói')
    .addStringOption(option => 
      option.setName('text')
        .setDescription('Văn bản cần chuyển đổi')
        .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply();

    const text = interaction.options.getString('text');

    try {
      // Tạo URL âm thanh từ Google TTS
      const url = googleTTS.getAudioUrl(text, {
        lang: 'vi',
        slow: false,
        host: 'https://translate.google.com',
      });

      // Tải xuống file âm thanh
      const response = await axios({
        method: 'get',
        url: url,
        responseType: 'arraybuffer'
      });

      // Tạo attachment từ buffer
      const attachment = new AttachmentBuilder(Buffer.from(response.data), { name: 'tts.mp3' });

      // Gửi file âm thanh
      await interaction.editReply({  files: [attachment] });

    } catch (error) {
      console.error('Lỗi:', error);
      await interaction.editReply('Có lỗi xảy ra khi chuyển đổi văn bản thành giọng nói.');
    }
  },
};