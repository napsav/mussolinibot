const Discord = require('discord.js');
const client = new Discord.Client();
client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret
'use strict';
var request = require('request');
var url = "https://api.mcsrvstat.us/2/resetfocus.duckdns.org";
var datafinal = 'online';
function checkServerStatus(url) {
request.get({
	url: url,
	json: true,
	headers: {'User-Agent': 'request'}
		}, (err, res, data) => {
	if (err) {
		console.log('Error:', err);
	} else if (res.statusCode !== 200) {
		console.log('Status:', res.statusCode);
	} else {
	// data is already parsed as JSON:
	// return "Il server è ".data.ip;
		console.log(data.online);
		return "mammt";
	};
});
};


client.on('ready', () => {
    console.log('I am ready!');
});

client.on('message', async message => {
    if (message.content === 'viva il duce' || message.content === 'dvx' || message.content === 'duce') {
       message.reply('https://www.youtube.com/watch?v=LBl64DBHtTk');
       }
    if (message.content === 'chi è il frocio?' || message.content === 'chi è il frocio' || message.content === 'kicka il frocio' || message.content === 'kick frocio') {
	const voiceChannel = message.member.voice.channel;
	var user = voiceChannel.members.random();
	console.log(`${user.user}`);
	message.reply(`Il frocio fortunato è: ${user.user}`);
	user.voice.setChannel(null);
    }
    if (message.content === 'orario') {
	    const embed = new Discord.RichEmbed()
.setTitle("Orario della classe con le pause")
.setAuthor("MussoliniBOT", "https://yagami.xyz/content/uploads/2018/11/discord-512-1.png","https://bestemmie.ga")
.setColor(#ecff00)
.setFooter("MussoliniBOT al tuo servizio, "http://i.imgur.com/w1vhFSR.png")
.setImage("https://i.imgur.com/4mA9ALC.jpeg")
.setTimestamp()
message.channel.send({embed})
    }
    if (message.content === 'stato server') {
request.get({
	url: url,
	json: true,
	headers: {'User-Agent': 'request'}
		}, (err, res, data) => {
	if (err) {
		console.log('Error:', err);
	} else if (res.statusCode !== 200) {
		console.log('Status:', res.statusCode);
	} else {
	// data is already parsed as JSON:
	// return "Il server è ".data.ip;
		if (data.online) {
message.reply("Il server " + data.hostname + " è online | IP: " + data.ip);
} else {
message.reply("Il server è offline");
}
		
	};
});
	}
});





// THIS  MUST  BE  THIS  WAY
