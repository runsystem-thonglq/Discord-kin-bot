const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  name:'remove',

  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove a song from the queue')
    .addIntegerOption(option =>
      option.setName('position')
        .setDescription('The position of the song in the queue')
        .setRequired(true)),

  async execute(interaction) {
    const position = interaction.options.getInteger('position');

    const serverQueue = queue.get(interaction.guildId);
    if (serverQueue && serverQueue.songs.length >= position && position >= 1) {
      const removedSong = serverQueue.songs.splice(position - 1, 1)[0];
      interaction.reply(`Removed song: ${removedSong.title}`);
    } else {
      interaction.reply('Invalid song number.');
    }
  },
};
