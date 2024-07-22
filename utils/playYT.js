const { createAudioResource, StreamType } = require('@discordjs/voice');
const play = require('play-dl');
const queueManager = require('../data');

async function playSong(serverQueue, textChannel, jumpIndex = 0) {
  console.log("🚀 ~ playSong ~ Starting playSong function");
  
  if (!serverQueue || !serverQueue.connection) {
    console.log("🚀 ~ playSong ~ No server queue or connection");
    return;
  }

  console.log("🚀 ~ playSong ~ Connection state:", serverQueue.connection.state.status);
  console.log("🚀 ~ playSong ~ Player state:", serverQueue.player.state.status);

  if (serverQueue.songs.length === 0) {
    console.log("🚀 ~ playSong ~ Queue is empty, cleaning up");
    serverQueue.playing = false;
    serverQueue.connection.destroy();
    queueManager.deleteQueue(serverQueue.voiceChannel.id);
    return;
  }

  const song = serverQueue.songs[jumpIndex];
  
  try {
    // Validate YouTube URL
    if (!play.yt_validate(song.url)) {
      throw new Error('Invalid YouTube URL');
    }

    // Get stream info
    const stream = await play.stream(song.url);
    
    const resource = createAudioResource(stream.stream, {
      inputType: stream.type,
      inlineVolume: true
    });
    
    serverQueue.player.play(resource);
    
    textChannel.send(`🎵 Now playing: ${song.title}`);

    // Optional: Add event listeners for more control
    serverQueue.player.once('idle', () => {
      console.log("🚀 ~ playSong ~ Song finished, playing next");
      serverQueue.songs.shift();
      playSong(serverQueue, textChannel);
    });
    serverQueue.player.on('error', (error) => {
      console.error('🚀 ~ handleSong ~ Audio player error:', error);
      console.error('Error details:', error.resource.metadata);
      // Implement additional error handling or recovery logic here
    });


  } catch (error) {
    console.error("Error playing the track:", error);
    textChannel.send("There was an error playing the track. Skipping to the next song.");
    serverQueue.songs.shift();
    playSong(serverQueue, textChannel);
  }
}

module.exports = playSong;