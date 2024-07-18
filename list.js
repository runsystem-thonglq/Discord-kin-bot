module.exports = {
  name: 'list',
  description: 'List all commands.',
  execute(message, args) {
    const commands = message.client.commands;
    let reply = 'Here are the available commands:\n';

    commands.forEach(command => {
      reply += `\`${command.name}\`: ${command.description}\n`;
    });

    message.channel.send(reply);
  },
};
