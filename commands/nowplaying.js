const { SlashCommandBuilder } = require('@discordjs/builders');
const queues = require('../data'); // Giả sử queue được khai báo và quản lý trong file data.js

module.exports = {
  name: 'nowplaying',

  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Show the currently playing song'),

  async execute(interaction) {
    const serverQueue = queues.get(interaction.guildId);
    if (serverQueue && serverQueue.songs.length > 0) {
      const nowPlaying = serverQueue.songs[0];
      interaction.reply(`Now playing: ${nowPlaying.title}`);
    } else {
      interaction.reply('No song is currently playing.');
    }
  },
};
