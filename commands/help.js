const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'help',
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show the list of commands'),

  async execute(interaction) {
    const helpMsg = `
      List of commands:
      - /play <query> - Play a song from SoundClound.
      - /pause - Pause the current song.
      - /resume - Resume the paused song.
      - /skip - Skip the current song.
      - /leave - Stop playing music and leave the voice channel.
      - /nowplaying - Show the currently playing song.
      - /queue - Show the current queue of songs.
      - /jump <position> - Jump to a specific song in the queue.
      - /remove <position> - Remove a song from the queue.
      - /ping - Check the bot's ping to the server.
      - /help - Show this help message.
    `;
    interaction.reply(helpMsg);
  },
};
