const { SlashCommandBuilder } = require("@discordjs/builders");
const queueManager = require("../data");
const playSong = require("../utils/playsong");
const { SOUNDCLOUD_CLIENT_ID } = require("../constants");

module.exports = {
  name: "jump",
  data: new SlashCommandBuilder()
    .setName("jump")
    .setDescription("Jump to a specific song in the queue")
    .addIntegerOption((option) =>
      option
        .setName("position")
        .setDescription("The position of the song in the queue")
        .setRequired(true)
    ),

  async execute(message, args) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.channel.send(
        "You need to be in a voice channel to use this command!"
      );
    }

    const serverQueue = queueManager.getQueue(voiceChannel.id);
    if (!serverQueue) {
      return message.channel.send("There is no active queue in this channel.");
    }

    const position = parseInt(args[0]);
    if (
      isNaN(position) ||
      position < 1 ||
      position > serverQueue.songs.length
    ) {
      return message.channel.send(
        "Invalid song number. Please provide a valid number within the queue range."
      );
    }
    // Get the song at the specified position
    const song = serverQueue.songs[position - 1];

    // Remove the song from its current position
    serverQueue.songs.splice(position - 1, 1);

    // Add the song to the beginning of the queue
    serverQueue.songs.unshift(song);
    // for ide event remove the first song
    serverQueue.songs.unshift(song);

    // Stop the current song
    serverQueue.player.stop();
    message.channel.send(`Chuyển qua bài 🎶 ${position}. ${song.title}`);

    console.log(
      "🚀 ~ execute ~ serverQueue.songs:",
      song,
      serverQueue.songs.map((z)=>z.title)
    );
  },
};
