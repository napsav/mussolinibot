const Discord = require('discord.js');
const client = new Discord.Client();
'use strict';
const fs = require('fs');
var request = require('request');
var bodyParser = require("body-parser");
var path = require('path');
var santi = require('./santi.js');
client.login(process.env.BOT_TOKEN); //BOT_TOKEN is the Client Secret
var url = "https://api.mcsrvstat.us/2/resetfocus.duckdns.org";

client.on('ready', () => {
    console.log('I am ready!');
});

function printCommands(commands, message) {
    	for(key in commands) {
		var value = commands[key];
		if (message.content === key) {
			message.channel.send(value);
		}
    	}
}

function readCommands(message) {
fs.readFile('commands.json', (err, data) => {
	    if (err) throw err;
	    let commands = JSON.parse(data);
	    printCommands(commands, message);
});
}

function updateFile() {
let data = fs.readFileSync('commands.json', 'utf8');
let webcommands = JSON.parse(data);
return webcommands;
}


const express = require('express')
const app = express()
const port = process.env.PORT || 8080
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get('/', (req, res) => {
	  var com = updateFile();
	  console.log();
	  delete com[req.query.remove]
	  fs.writeFileSync('commands.json', JSON.stringify(com))
	  res.render('index', {commands: com});
	  
})

app.listen(port, () => {
	  console.log(`Example app listening at http://localhost:${port}`)
})

app.post("/", function(req,res){
    console.log("Ricevuto una richiesta POST");
	console.log(req.body);
    var newdata = {};
	var comando = req.body.comando 
	var risposta = req.body.risposta
	newdata = {comando, risposta}
	var com;
	com = updateFile();
	com[comando] = risposta;
    console.log(req.body.risposta);
	fs.writeFileSync('commands.json', JSON.stringify(com))
	res.render('index', {commands: com});
});



client.on('message', async message => {
	readCommands(message);
    if (message.content === 'viva il duce' || message.content === 'dvx' || message.content === 'duce') {
        message.reply('https://www.youtube.com/watch?v=LBl64DBHtTk');
    }
    if (message.content === 'bestemmia') {
	message.channel.send(santi.santo() + " " + santi.nome() + " " + santi.agg());
    }
    if (message.content === 'chi è il frocio?' || message.content === 'chi è il frocio' || message.content === 'kicka il frocio' || message.content === 'kick frocio') {
        const voiceChannel = message.member.voice.channel;
	if (voiceChannel === null) {message.reply("Devi stare in un canale vocale affinchè il comando funzioni");}
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
