require('dotenv').config()
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
var logChannel; 

const { Aki } = require('aki-api');
const region = 'it';
const aki = new Aki(region);



client.on('ready', () => {
  console.log('I am ready!');
  logChannel = client.channels.cache.get('770021533208805377');
});



function printCommands(commands, message) {
  for (key in commands) {
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
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.get('/', (req, res) => {
  var com = updateFile();
  res.render('index', {
    commands: com
  });
  
})

app.get('/delete', (req, res) => {
  var com = updateFile();
  logChannel.send("Comando "+req.query.remove+": "+com[req.query.remove]+" rimosso");
  delete com[req.query.remove]
  fs.writeFileSync('commands.json', JSON.stringify(com))
  res.redirect('/');
})
app.listen(port, () => {
  console.log(`Panel listening at http://localhost:${port}`)
})

app.post("/", function(req, res) {
  console.log("Ricevuto una richiesta POST");
  console.log(req.body);
  var newdata = {};
  var comando = req.body.comando.trim();
  var risposta = req.body.risposta.trim();
  newdata = {
    comando,
    risposta
  }
  var com;
  com = updateFile();
  com[comando] = risposta;
  console.log(req.body.risposta);
  fs.writeFileSync('commands.json', JSON.stringify(com))
  res.redirect('/')
  logChannel.send("Comando "+comando+": "+risposta+" aggiunto");
});



client.on('message', async message => {
  readCommands(message);
  var mess = message.content.toLowerCase();
  if (mess === 'viva il duce' || mess === 'dvx' || mess === 'duce') {
    message.reply('https://www.youtube.com/watch?v=LBl64DBHtTk');
  }
  if (mess === 'bestemmia') {
    message.channel.send(santi.santo() + " " + santi.nome() + " " + santi.agg());
  }
  if (mess === 'chi è il frocio?' || mess === 'chi è il frocio' || mess === 'kicka il frocio' || mess === 'kick frocio') {
    const voiceChannel = message.member.voice.channel;
    if (voiceChannel === null) {
      message.reply("Devi stare in un canale vocale affinchè il comando funzioni");
    }
    var user = voiceChannel.members.random();
    console.log(`${user.user}`);
    message.reply(`Il frocio fortunato è: ${user.user}`);
    user.voice.setChannel(null);
  }
  if (mess === 'orario') {
    const embed = new Discord.MessageEmbed()
      .setTitle("Orario della classe con le pause")
      .setDescription("**1.** 9:10 - 10:00\n**2.** 10:00 - 10:40 **PAUSA** 10:40 - 10.50\n**3.** 10:50 - 11.40\n**4.** 11:40 - 12:20 **PAUSA** 12:20-12:30\n**5.** 12:30 - 13:20")
      .setAuthor("MussoliniBOT", "https://www.sottosoprabrindisi.it/wp-content/uploads/2016/06/Orari_LP.png", "https://bestemmie.ga")
      .setColor("#ecff00")
      .setFooter("MussoliniBOT al tuo servizio", "https://www.sottosoprabrindisi.it/wp-content/uploads/2016/06/Orari_LP.png")
      .setImage("https://i.imgur.com/4yl1j1C.png")
      .setTimestamp()
    message.channel.send({
      embed
    })
  }
  if (mess === 'stato server') {
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
  if (mess === 'akinator') {
  aki.start();
  }
  if (mess === 'continua') {
  var answer = 0;
                    message.channel.send(aki.question + '\n'
                            + '👍 per sì, 👎 per no.');

                    // Reacts so the user only have to click the emojis
                    message.react('👍').then(r => {
                            message.react('👎');
                    });

// First argument is a filter function
message.awaitReactions((reaction, user) => user.id == message.author.id && (reaction.emoji.name == '👍' || reaction.emoji.name == '👎'),
                            { max: 1, time: 30000 }).then(collected => {
                                    if (collected.first().emoji.name == '👍') {
                                            answer = 1;
                                            aki.step(answer);
                                            message.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                                            
                                            
                                            
                                    } else {
                                            answer = 0;
                                            aki.step(answer);
                                            message.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                                            
                                            
                                    }
                            }).catch(() => {
                                    message.reply('Nessuna reazione dopo 30 secondo, annullo il gioco.');
                            });
if (aki.progress >= 70 || aki.currentStep >= 78) {
  await aki.win();
  
  console.log('firstGuess:', aki.answers);
  console.log('guessCount:', aki.guessCount);
}


/*


await aki.step(myAnswer);

if (aki.progress >= 70 || aki.currentStep >= 78) {
  await aki.win();
  console.log('firstGuess:', aki.answers);
  console.log('guessCount:', aki.guessCount);
}
*/
  }

});
