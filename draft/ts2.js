const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ts')
    .setDescription('Chuyển đổi văn bản thành giọng nói')
    .addStringOption(option => 
      option.setName('text')
        .setDescription('Văn bản cần chuyển đổi')
        .setRequired(true)),

  async execute(interaction) {
    const text = interaction.options.getString('text');
    
    // Encode text để sử dụng trong URL
    const encodedText = encodeURIComponent(text);
    
    // Tạo URL cho Google Translate TTS
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=vi&client=tw-ob`;

    // Tạo embed với link âm thanh
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Text-to-Speech')
      .setDescription(`Nhấn vào [đây](${ttsUrl}) để nghe âm thanh`)
      .setFooter({ text: 'Powered by Google Translate TTS' });

    await interaction.reply({ embeds: [embed] });
  },
};