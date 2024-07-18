const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  name: 'jump',
  data: new SlashCommandBuilder()
    .setName('jump')
    .setDescription('Jump to a specific song in the queue')
    .addIntegerOption(option =>
      option.setName('position')
        .setDescription('The position of the song in the queue')
        .setRequired(true)),

  async execute(interaction) {
    const position = interaction.options.getInteger('position');

    const serverQueue = queue.get(interaction.guildId);
    if (serverQueue && serverQueue.songs.length >= position && position >= 1) {
      serverQueue.songs.splice(0, position - 1);
      serverQueue.player.stop();
      interaction.reply(`Jumped to song number ${position}.`);
    } else {
      interaction.reply('Invalid song number.');
    }
  },
};
