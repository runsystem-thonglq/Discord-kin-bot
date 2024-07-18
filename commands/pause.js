const { SlashCommandBuilder } = require('@discordjs/builders');
const queue = require('../data');

module.exports = {
  name:'pause',
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Dừng chơi nhạc'),

  async execute(interaction) {
    const serverQueue = queue.get(interaction.guild.id);

    if (!serverQueue || !serverQueue.audioPlayer) {
      return interaction.reply('Không có bài hát nào đang được phát.');
    }

    serverQueue.audioPlayer.pause();
    interaction.reply('Đã dừng chơi nhạc.');
  },
};
