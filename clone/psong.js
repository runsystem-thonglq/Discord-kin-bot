const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const scdl = require('soundcloud-downloader').default;
const queueManager = require('../data');

async function playSong(serverQueue, clientId, textChannel,jumpIndex=0) {
  console.log("🚀 ~ playSong ~ serverQueue:", serverQueue.songs.map((z)=>z.title))
  if (serverQueue.songs.length === 0) {
    serverQueue.playing = false;
    serverQueue.connection.destroy();
    queueManager.deleteQueue(serverQueue.voiceChannel.id);
    return;
  }

  const song =serverQueue.songs[jumpIndex];
  try {
    const stream = await scdl.download(song.url, clientId);
    const resource = createAudioResource(stream);
    serverQueue.player.play(resource);

    // serverQueue.player.on(AudioPlayerStatus.Playing, () => {
    //   console.log("🚀 ~ playSong ~ Playing:", serverQueue.songs.length,`${song.title}`)
    //   textChannel.send(`Now playing: ${song.title}`);
    // });

    // serverQueue.player.on(AudioPlayerStatus.Idle, () => {
    //   console.log("🚀 ~ playSong ~ STOPPP:", serverQueue.songs.length,song)
    //   serverQueue.songs.shift();
    //   playSong(serverQueue, clientId, textChannel);
    // });
  } catch (error) {
    console.error("Error playing the track:", error);
    textChannel.send("There was an error playing the track!");
    serverQueue.songs.shift();
    playSong(serverQueue, clientId, textChannel);
  }
}

module.exports=playSong