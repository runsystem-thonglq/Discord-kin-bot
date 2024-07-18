const { SlashCommandBuilder } = require('@discordjs/builders');
const queue = require('../data');

module.exports = {
  name:'skip',

  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current song'),

  async execute(interaction) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply('You need to be in a voice channel to skip the music!');
    }

    const serverQueue = queue.get(interaction.guildId);
    if (serverQueue && serverQueue.connection && serverQueue.connection.state.status === VoiceConnectionStatus.Ready) {
      serverQueue.player.stop();
      interaction.reply('Skipped to the next song.');
    } else {
      interaction.reply('No music is currently playing.');
    }
  },
};
