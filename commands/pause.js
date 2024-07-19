const { getVoiceConnection } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  name: 'pause',
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Dừng chơi nhạc'),

  async execute(message) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.channel.send("Bạn cần ở trong một kênh thoại để dừng nhạc!");
    }

    const connection = getVoiceConnection(message.guild.id);
    if (!connection) {
      return message.channel.send("Bot không đang phát nhạc trong kênh thoại nào.");
    }

    const player = connection.state.subscription.player;
    if (!player) {
      return message.channel.send("Không có bài hát nào đang được phát.");
    }

    player.pause();
    message.channel.send('Đã dừng chơi nhạc.');
  },
};