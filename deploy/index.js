const { schema } = require("../schema/index");

function deploy(client) {
  client.on("messageCreate", async (message) => {
    if (!message.guild) return;
    // Chỉ cho phép deploy khi là người sở hữu server
    if (!client.application?.owner) await client.application?.fetch();
    if (
      message.content.toLowerCase() === "!deploy" &&
      message.author.id === client.application?.owner?.id
    ) {
      try {
        await client.application.commands.set(schema)
        await message.channel.send("Deployed!");
      } catch (e) {
        console.log("🚀 ~ client.on ~ e:", e);
        message.channel.send("Fail to deploy!");
      }
    }
  });
}

module.exports = deploy;
