const { SlashCommandBuilder } = require('@discordjs/builders');
const queueManager = require('../data');

module.exports = {
  name: 'queue',
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Hiển thị danh sách phát hiện tại'),

  async execute(message) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.channel.send("Bạn cần ở trong một kênh thoại để xem danh sách phát!");
    }

    const serverQueue = queueManager.getQueue(voiceChannel.id);
    if (!serverQueue || serverQueue.songs.length === 0) {
      return message.channel.send("Danh sách phát hiện tại đang trống.");
    }

    let queueMsg = 'Danh sách phát hiện tại:\n';
    serverQueue.songs.forEach((song, index) => {
      queueMsg += `${index + 1}. ${song.title}\n`;
    });

    message.channel.send(queueMsg);
  },
};