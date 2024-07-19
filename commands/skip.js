const { SlashCommandBuilder } = require('@discordjs/builders');
const { getVoiceConnection, VoiceConnectionStatus } = require('@discordjs/voice');
const queueManager = require('../data');
const playSong = require('../utils/playsong');
const { SOUNDCLOUD_CLIENT_ID } = require('../constants');

module.exports = {
  name: 'skip',

  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current song'),

  async execute(message) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.channel.send('You need to be in a voice channel to skip the music!');
    }

    const serverQueue = queueManager.getQueue(voiceChannel.id);
    const connection = getVoiceConnection(message.guild.id);

    if (serverQueue && connection && connection.state.status === VoiceConnectionStatus.Ready) {
      serverQueue.player.stop();
      message.channel.send('Skipped to the next song.');

      // Kiểm tra nếu còn bài hát trong hàng đợi
      if (serverQueue.songs.length > 0) {
        playSong(serverQueue, SOUNDCLOUD_CLIENT_ID, message.channel);
      } else {
        message.channel.send('The queue is now empty.');
      }
    } else {
      message.channel.send('No music is currently playing.');
    }
  },
};
