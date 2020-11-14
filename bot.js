require('dotenv').config()
const Discord = require('discord.js');
const client = new Discord.Client();
'use strict';
const fs = require('fs');
var request = require('request');
var bodyParser = require("body-parser");
var path = require('path');
var santi = require('./santi.js');
var morse = require('./morse.js');
client.login(process.env.BOT_TOKEN); //BOT_TOKEN is the Client Secret
var url = "https://api.mcsrvstat.us/2/resetfocus.duckdns.org";
var logChannel;

const {
  Aki
} = require('aki-api');
const region = 'it';
const aki = new Aki(region);



client.on('ready', () => {
  console.log('I am ready!');
  logChannel = client.channels.cache.get('777307224564695071');
});



// --------------PANNELLO MUSSOLINIBOT---------------


// Funzioni per il parsing dei comandi dal file commands.json
function printCommands(commands, message) {
  for (key in commands) {
    var value = commands[key];
    if (message.content.toLowerCase() === key) {
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

// Webserver express
const express = require('express')
const app = express()
const port = process.env.PORT || 8070
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

// Index
app.get('/', (req, res) => {
  var com = updateFile();
  res.render('index', {
    commands: com
  });

})

// Cancella comandi
app.get('/delete', (req, res) => {
  var com = updateFile();
  logChannel.send(":x: " + req.query.remove + ": " + com[req.query.remove] + " rimosso");
  delete com[req.query.remove]
  fs.writeFileSync('commands.json', JSON.stringify(com))
  res.redirect('/');
})
app.listen(port, () => {
  console.log(`Panel listening at http://localhost:${port}`)
})

// Aggiunta comandi
app.post("/", function(req, res) {
  console.log("Ricevuto una richiesta POST");
  console.log(req.body);
  var comando = req.body.comando.trim().toLowerCase();
  var risposta = req.body.risposta.trim();
  var com;
  com = updateFile();
  com[comando] = risposta;
  console.log(req.body.risposta);
  fs.writeFileSync('commands.json', JSON.stringify(com))
  res.redirect('/')
  logChannel.send(":white_check_mark: " + comando + ": " + risposta + " aggiunto");
});





// ------------------COMANDI DEL BOT---------------------
let msg = null;

client.on('message', async message => {
	// Se il messaggio è stato scritto dal bot, verrà ignorato
	if(message.author.bot) return;
	

	// Codice morse, permette di tradurre in tutti e due i versi
	if (message.content.startsWith('morse')) {
	const args = message.content.slice(6).trim();
	if (!args.length) {
		return message.channel.send(`Il messaggio non può essere vuoto! ${message.author}!`);
	} else if(args.startsWith("-") || args.startsWith(".")) {
		const messaggioMorse = morse.decrypt(args);
		message.channel.send(messaggioMorse);
	} else {
		const messaggioMorse = morse.crypt(args);
		message.channel.send(messaggioMorse);
	}
	}
	readCommands(message);
  if (message.content.toLowerCase()=== 'viva il duce' || message.content.toLowerCase()=== 'dvx' || message.content.toLowerCase()=== 'duce') {
    message.reply('https://www.youtube.com/watch?v=LBl64DBHtTk');
  }
  if (message.content.toLowerCase()=== 'bestemmia') {
    message.channel.send(santi.santo() + " " + santi.nome() + " " + santi.agg());
  }
  if (message.content.toLowerCase().includes("broccolo") || message.content.toLowerCase().includes("broccoli")) {
    const voiceChannel = message.member.voice.channel;
    if (voiceChannel === null) {
      message.reply("Devi stare in un canale vocale affinchè il comando funzioni");
    }
    var user = voiceChannel.members.random();
    console.log(`${user.user}`);
    message.reply(`Il broccolo in mezzo al cerchio è: ${user.user}`);
    user.voice.setChannel(null);
  }
  if (message.content.toLowerCase()=== 'orario') {
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
  if (message.content.toLowerCase()=== 'stato server') {
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
  if (message.content.toLowerCase()=== 'akinator') {
    (async function() {
      try {
        await aki.start();
        var embed = {
          "title": "Akinator",
          "description": `${aki.question}`,
          "url": "http://resetfocus.duckdns.org:8080",
          "color": 10598833,
          "timestamp": "2020-10-27T11:22:42.331Z",
          "footer": {
            "icon_url": "https://i.ibb.co/VYt8mSx/akinator.png",
            "text": "MussoliniBOT approva i patti Lateranensi"
          },
          "author": {
            "name": "Akinator (impiegato di MussoliniBOT)",
            "url": "https://discordapp.com",
            "icon_url": "https://i.ibb.co/VYt8mSx/akinator.png"
          },
          "fields": [{
              "name": "Risposte:",
              "value": "👍 Sì\n👎 No\n🤔 Non lo so"
            },
            {
              "name": "Per cancellare il gioco, semplicemente non aggiungere reazioni. Il bot chiuderà la partita da solo.",
              "value": "kek debug"
            }
          ]
        };
        msg = await message.channel.send({
          embed
        });
       // Funzione per generare il messaggio finale di vittoria 
        function genFinalMessage(title, tentativi) {
          const newEmbdFinal = new Discord.MessageEmbed()
            .setTitle(`${title}`)
            .setDescription(`Ho indovinato? Numero di personaggi possibili: ${tentativi}`)
            .setAuthor("MussoliniBOT", "https://i.ibb.co/VYt8mSx/akinator.png", "https://bestemmie.ga")
            .setColor("#ecff00")
            .setFooter("MussoliniBOT approva i patti Lateranensi", "https://i.ibb.co/VYt8mSx/akinator.png")
            .setTimestamp()
            return newEmbdFinal;
        }
        
        var answer = 0;
	// Funzione per aggiungere le reazioni all'embed della domanda
        async function addReactions() {
          try {
            await msg.react('👍');
            await msg.react('👎');
            await msg.react('🤔');
          } catch (error) {
            console.error('One of the emojis failed to react.');
          }
        }

	addReactions();
        
	// Collector di reazioni per ottenere la risposta dell'utente      
	const filter = (reaction, user) => (user.id == message.author.id) && (reaction.emoji.name == '👍' || reaction.emoji.name == '👎' || reaction.emoji.name == '🤔')
        const collector = msg.createReactionCollector(filter, {time: 300000});
        collector.on('collect', (reaction, user) => {
          if (aki.progress >= 70 || aki.currentStep >= 78) {
            (async function() {
              await aki.win();
              console.log('firstGuess:', aki.answers);
              console.log('guessCount:', aki.guessCount);
              const messaggioFinale = genFinalMessage(aki.answers[0].name, aki.guessCount);
              message.channel.send(messaggioFinale);
              collector.stop();
            })()
          }
          
          // ---------------SI--------------------
          else if (reaction.emoji.name == '👍') {
            (async function() {
              answer = 0;
              await aki.step(answer);
              const newEmbd = new Discord.MessageEmbed();
              newEmbd.setDescription(`${aki.question}`);
              newEmbd.setTitle(`${aki.progress}`);
              msg.edit(newEmbd);
              msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
              addReactions()
            })()

            // ---------------NO--------------------  
          } else if (reaction.emoji.name == '👎') {
            (async function() {
              answer = 1;
              await aki.step(answer);
              const newEmbd = new Discord.MessageEmbed();
              newEmbd.setDescription(`${aki.question}`);
              newEmbd.setTitle(`${aki.progress}`);
              msg.edit(newEmbd);
              msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
              addReactions()
            })()

            // ---------------NON LO SO--------------------  
          } else if (reaction.emoji.name == '🤔') {
            (async function() {
              answer = 2;
              await aki.step(answer);
              const newEmbd = new Discord.MessageEmbed();
              newEmbd.setDescription(`${aki.question}`);
              newEmbd.setTitle(`${aki.progress}`);
              msg.edit(newEmbd);
              msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
              addReactions()
            })()
          }
        });

        // ---------------TIMEOUT--------------------
        collector.on('end', collected => {
          message.reply('Nessuna reazione dopo 30 secondi, annullo il gioco.');
          aki.win();
        });
      } catch (err) {
        throw console.log(err);
      }
    })()
  }
});
