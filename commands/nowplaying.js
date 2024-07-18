const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  name: 'nowplaying',

  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Show the currently playing song'),

  async execute(interaction) {
    const serverQueue = queue.get(interaction.guildId);
    if (serverQueue && serverQueue.songs.length > 0) {
      const nowPlaying = serverQueue.songs[0];
      interaction.reply(`Now playing: ${nowPlaying.title}`);
    } else {
      interaction.reply('No song is currently playing.');
    }
  },
};
