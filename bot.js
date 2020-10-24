const Discord = require('discord.js');
const client = new Discord.Client();
client.login(process.env.BOT_TOKEN); //BOT_TOKEN is the Client Secret
'use strict';
var request = require('request');
var url = "https://api.mcsrvstat.us/2/resetfocus.duckdns.org";
var datafinal = 'online';


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
        const embed = new Discord.MessageEmbed()
            .setTitle("Orario della classe con le pause")
            .setDescription("**1.** 9:10 - 10:10\n**2.** 10:00 - 10:40 **PAUSA** 10:40 - 10.50\n**3.** 10:50 - 11.40\n**4.** 11:40 - 12:20 **PAUSA** 12:20-12:30\n**5.** 12:30 - 13:20")
            .setAuthor("MussoliniBOT", "https://www.sottosoprabrindisi.it/wp-content/uploads/2016/06/Orari_LP.png", "https://bestemmie.ga")
            .setColor("#ecff00")
            .setFooter("MussoliniBOT al tuo servizio", "https://www.sottosoprabrindisi.it/wp-content/uploads/2016/06/Orari_LP.png")
            .setImage("https://i.imgur.com/4yl1j1C.png")
            .setTimestamp()
        message.channel.send({
            embed
        })
    }
    if (message.content === 'stato server') {
        request.get({
            url: url,
            json: true,
            headers: {
                'User-Agent': 'request'
            }
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
