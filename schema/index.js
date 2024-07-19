// Danh sách các slash command của bot

const { Constants } = require("discord.js");

const schema = [
  {
    name: "play",
    description: "Plays a song or playlist on SoundCloud",
    options: [
      {
        name: "input",
        type: 3,
        description:
          "The url or keyword to search videos or playlist on SoundCloud",
        required: true,
      },
    ],
  },
  {
    name: "voice",
    description: "Text to speech",
    options: [
      {
        name: "input",
        type: 3,
        description: "Entering the text, bot will speech this",
        required: true,
      },
    ],
  },
  {
    name: "skip",
    description: "Skip to the next song in the queue",
  },
  {
    name: "queue",
    description: "See the music queue",
  },
  {
    name: "pause",
    description: "Pauses the song that is currently playing",
  },
  {
    name: "resume",
    description: "Resume playback of the current song",
  },
  {
    name: "leave",
    description: "Leave the voice channel",
  },
  {
    name: "nowplaying",
    description: "See the song that is currently playing",
  },
  {
    name: "jump",
    description: "Jump to song in queue by position",
    options: [
      {
        name: "position",
        type: 10,
        description: "The position of song in queue",
        required: true,
      },
    ],
  },
  {
    name: "remove",
    description: "Remove song in queue by position",
    options: [
      {
        name: "position",
        type: 10,
        description: "The position of song in queue",
        required: true,
      },
    ],
  },
  {
    name: "ping",
    description: "See the ping to server",
  },
  {
    name: "help",
    description: "See the help for this bot",
  },
];

module.exports = {
  schema
};
