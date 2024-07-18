const { SlashCommandBuilder } = require('@discordjs/builders');
const queue = require('../data');

module.exports = {
  name:'resume',

  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume the paused song'),

  async execute(interaction) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply('You need to be in a voice channel to resume the music!');
    }

    const serverQueue = queue.get(interaction.guildId);
    if (serverQueue && serverQueue.connection && serverQueue.connection.state.status === VoiceConnectionStatus.Ready) {
      serverQueue.player.unpause();
      interaction.reply('Music resumed.');
    } else {
      interaction.reply('No music is currently paused.');
    }
  },
};
