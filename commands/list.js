const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('list')
    .setDescription('Show the currently opened list'),
  execute(message, args) {
    const commands = message.client.commands;
    let reply = 'Here are the available commands:\n';

    commands.forEach(command => {
      reply += `\`${command.name}\`: ${command.description}\n`;
    });

    message.channel.send(reply);
  },
};
