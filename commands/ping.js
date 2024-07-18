const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  name:'ping',

  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot\'s ping to the server'),

  async execute(interaction) {
    const ping = Date.now() - interaction.createdTimestamp;
    interaction.reply(`Ping: ${ping}ms`);
  },
};
