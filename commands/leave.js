const { SlashCommandBuilder } = require('@discordjs/builders');
const queueManager = require('../data'); // Đảm bảo rằng bạn đã import đúng module quản lý hàng đợi

module.exports = {
  name: 'leave',
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Stop playing music and leave the voice channel'),

  async execute(interaction) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply('You need to be in a voice channel to make the bot leave!');
    }

    const serverQueue = queueManager.getQueue(interaction.guildId); // Sử dụng hàm để lấy hàng đợi của máy chủ
    if (serverQueue) {
      serverQueue.player.stop();
      serverQueue.connection.destroy();
      queueManager.deleteQueue(interaction.guildId); // Sử dụng hàm deleteQueue để xóa hàng đợi của máy chủ
      interaction.reply('Left the voice channel.');
    } else {
      interaction.reply('No music is currently playing.');
    }
  },
};
