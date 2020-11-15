require('dotenv').config()
const Discord = require('discord.js');
const client = new Discord.Client();
'use strict';
const fs = require('fs');
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

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

// --------------PANNELLO MUSSOLINIBOT---------------


// Funzioni per il parsing dei comandi dal file commands.json

function parseCommands(message) {
  fs.readFile('commands.json', (err, data) => {
    if (err) throw err;
    let commands = JSON.parse(data);
    for (key in commands) {
      var value = commands[key];
      if (message.content.toLowerCase() === key) {
        message.channel.send(value);
      }
    }
  });
}

function refreshCommandsFile() {
  let data = fs.readFileSync('commands.json', 'utf8');
  let webcommands = JSON.parse(data);
  return webcommands;
}

// Filtro parole
function parseParole(message) {
  fs.readFile('parole.json', (err, data) => {
    if (err) throw err;
    var parole = JSON.parse(data);
    var puntiraw = fs.readFileSync('punti.json', 'utf8');
    var punti = JSON.parse(puntiraw);
    for (p in parole) {
      if (message.content.trim().toLowerCase().includes(p)) {
        message.channel.send(`${message.author}, ${parole[p]} per aver detto "${p}"!`)
        if (message.author in punti) {
          punti[message.author] += parole[p];
        } else {
          punti[message.author] = parole[p];
        }
        fs.writeFileSync('punti.json', JSON.stringify(punti))
      }
    }
  });
}

// Punti file
function refreshPuntiFile() {
  let data = fs.readFileSync('punti.json', 'utf8');
  let punti = JSON.parse(data);
  return punti;
}

// File delle parole
function refreshParoleFile() {
  let data = fs.readFileSync('parole.json', 'utf8');
  let parole = JSON.parse(data);
  return parole;
}

// ------------------ ROUTING ------------------------

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
  var com = refreshCommandsFile();
  res.render('index', {
    commands: com
  });
})

// Ferrenz filter
app.get('/ferrenz', (req, res) => {
  var par = refreshParoleFile();
  res.render('parole', {
    parole: par
  });
})

// Cancella comandi
app.get('/delete', (req, res) => {
  var com = refreshCommandsFile();
  logChannel.send(":x: " + req.query.remove + ": " + com[req.query.remove] + " rimosso");
  delete com[req.query.remove]
  fs.writeFileSync('commands.json', JSON.stringify(com))
  res.redirect('/');
})

// Cancella parole
app.get('/ferrenz/delete', (req, res) => {
  var par = refreshParoleFile();
  logChannel.send(":x: " + req.query.remove + ": " + par[req.query.remove] + " rimosso");
  delete par[req.query.remove]
  fs.writeFileSync('parole.json', JSON.stringify(par))
  res.redirect('/ferrenz');
})


// Aggiunta comandi
app.post("/", function(req, res) {
  console.log("Ricevuto una richiesta POST");
  console.log(req.body);
  var com;
  com = refreshCommandsFile();
  var comando = req.body.comando.trim().toLowerCase();
  var risposta = req.body.risposta.trim();
	if (comando.length === 0 || risposta.length === 0) {
		var alert = "Il comando e la risposta non possono essere vuoti!";
		res.render('index', {
			commands:com,
			alert:alert
		});
	} else {
		  com[comando] = risposta;
		  console.log(req.body.risposta);
		  fs.writeFileSync('commands.json', JSON.stringify(com))
		  res.redirect('/')
		  logChannel.send(":white_check_mark: " + comando + ": " + risposta + " aggiunto");
	}
});

// Aggiunta parole filtrate
app.post("/ferrenz", function(req, res) {
  console.log("Ricevuto una richiesta POST a Ferrenz Filter");
  console.log(req.body);
  var par;
  par = refreshParoleFile();
  var parola = req.body.parola.trim().toLowerCase();
  var punteggio = parseInt(req.body.punteggio);
	if (parola.length === 0 || punteggio.length === 0) {
		var alert = "La parola e il punteggio devono avere un valore";
		res.render('parole', {
			parole:par,
			alert:alert
		});
	} else if (!Number.isInteger(punteggio)) {
    var alert = "Il punteggio deve essere un numero senza valori decimali, ad esempio -10, +10 o 5";
		res.render('parole', {
			parole:par,
			alert:alert
		});
  } else {
		  par[parola] = punteggio;
		  fs.writeFileSync('parole.json', JSON.stringify(par))
		  res.redirect('/ferrenz')
		  logChannel.send(":white_check_mark: " + parola + " - " + punteggio + " aggiunto");
	}
});


app.listen(port, () => {
  console.log(`Panel listening at http://localhost:${port}`)
})


// ------------------COMANDI DEL BOT---------------------
let msg = null;

client.on('message', async message => {
	// Se il messaggio è stato scritto dal bot, verrà ignorato
  if(message.author.bot) return;
  
  // Parsing comandi e parole
  parseCommands(message);
  parseParole(message);

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
  if (message.content.toLowerCase() === 'punteggi' || message.content.toLowerCase() === 'punteggio' || message.content.toLowerCase() === 'punti') {
    var punti = refreshPuntiFile(message);
    if (!isEmpty(punti)) {
      var descr = "";
      for (entry in punti) {
        var str = `${entry} : ${punti[entry]}\n`;
        descr.concat(str);
      }
      const embed = new Discord.MessageEmbed()
      .setTitle("Punteggi")
      .setDescription(descr)
      .setAuthor("GiacomoBOT x Filtro Ferrenz", "https://i.imgur.com/1FmyBHi.jpeg", "https://saverio.ga")
      .setColor("#ecff00")
      .setFooter("Sponsorizzato da LilFerrenz", "https://i.imgur.com/1FmyBHi.jpeg")
      .setTimestamp()
    message.channel.send({
      embed
    })
    } else {
      message.channel.send("Tabella dei punti vuota");
    }
  }
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
    console.log(`${user}`);
    message.reply(`Il broccolo in mezzo al cerchio è: ${user}`);
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
