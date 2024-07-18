const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  name: 'leave',
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Stop playing music and leave the voice channel'),

  async execute(interaction) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply('You need to be in a voice channel to make the bot leave!');
    }

    const serverQueue = queue.get(interaction.guildId);
    if (serverQueue) {
      serverQueue.player.stop();
      serverQueue.connection.destroy();
      queue.delete(interaction.guildId);
      interaction.reply('Left the voice channel.');
    } else {
      interaction.reply('No music is currently playing.');
    }
  },
};
