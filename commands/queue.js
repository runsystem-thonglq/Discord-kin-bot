const { SlashCommandBuilder } = require('@discordjs/builders');
const queue = require('../data');

module.exports = {
  name:'queue',

  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Show the current queue of songs'),

  async execute(interaction) {
    const serverQueue = queue.get(interaction.guildId);
    if (serverQueue && serverQueue.songs.length > 0) {
      let queueMsg = 'Current queue:\n';
      serverQueue.songs.forEach((song, index) => {
        queueMsg += `${index + 1}. ${song.title}\n`;
      });
      interaction.reply(queueMsg);
    } else {
      interaction.reply('The queue is empty.');
    }
  },
};
