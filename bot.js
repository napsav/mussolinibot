const Discord = require('discord.js');

const client = new Discord.Client();
 
client.on('ready', () => {
    console.log('I am ready!');
});

client.on('message', message => {
    if (message.content === 'viva il duce' || message.content === 'dvx' || message.content === 'duce') {
       message.reply('https://www.youtube.com/watch?v=LBl64DBHtTk');
       }
});

 

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret
