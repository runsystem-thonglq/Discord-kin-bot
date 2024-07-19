require('dotenv').config();
const { env } = require('process');
module.exports={
  SOUNDCLOUD_CLIENT_ID:env.SOUNDCLOUD_CLIENT_ID,
  PORT:env.PORT,
  DISCORD_TOKEN:env.DISCORD_TOKEN
}