const { SlashCommandBuilder } = require('@discordjs/builders');
const { getVoiceConnection, VoiceConnectionStatus } = require('@discordjs/voice');
const queueManager = require('../data');

module.exports = {
  name: 'resume',

  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume the paused song'),

  async execute(message) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.channel.send('You need to be in a voice channel to resume the music!');
    }

    const serverQueue = queueManager.getQueue(voiceChannel.id);
    const connection = getVoiceConnection(message.guild.id);

    if (serverQueue && connection && connection.state.status === VoiceConnectionStatus.Ready) {
      if (serverQueue.player.unpause()) {
        message.channel.send('Music resumed.');
      } else {
        message.channel.send('The music is not paused.');
      }
    } else {
      message.channel.send('No music is currently paused or playing.');
    }
  },
};