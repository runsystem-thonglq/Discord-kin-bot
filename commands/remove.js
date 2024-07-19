const { SlashCommandBuilder } = require('@discordjs/builders');
const queueManager = require('../data'); // Đảm bảo rằng bạn đã import đúng module quản lý hàng đợi

module.exports = {
  name: 'remove',

  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove a song from the queue')
  ,

  async execute(interaction,args) {
    const position = parseInt(args[0]);
    if (
      isNaN(position) ||
      position < 1 ||
      position > serverQueue.songs.length
    ) {
      return message.channel.send(
        "Invalid song number. Please provide a valid number within the queue range."
      );
    }
    
    const serverQueue = queueManager.getQueue(interaction.guildId); // Sử dụng hàm để lấy hàng đợi của máy chủ
    if (serverQueue && serverQueue.songs.length >= position && position >= 1) {
      const removedSong = serverQueue.songs.splice(position - 1, 1)[0];
      interaction.reply(`Removed song: ${removedSong.title}`);
    } else {
      interaction.reply('Invalid song number.');
    }
  },
};
