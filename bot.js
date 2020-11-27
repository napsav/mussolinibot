require('dotenv').config()
const Discord = require('discord.js');
const client = new Discord.Client();
'use strict';
const fs = require('fs');
var bodyParser = require("body-parser");
var lunr = require("lunr")
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

// -------------------------------------
//             FUNZIONI
// -------------------------------------

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

async function addSearchReactions(msg) {
  try {
    await msg.react('1️⃣');
    await msg.react('2️⃣');
    await msg.react('3️⃣');
    await msg.react('4️⃣');
    await msg.react('5️⃣');
  } catch (error) {
    console.error('One of the emojis failed to react.');
  }
}

const reactionsEnum = {
  '1️⃣': 1,
  '2️⃣': 2,
  '3️⃣': 3,
  '4️⃣': 4,
  '5️⃣': 5
}

function getEmbedRisultato() {
  var embedFinale = new Discord.MessageEmbed()
    .setTimestamp()
    .setFooter("La vera domanda è: perchè no? (Intanto hai trovato il ban)", "https://cdn.discordapp.com/embed/avatars/0.png")
    .setAuthor("GiacomoBOT x ALGORITMI INCREDIBILI (li hai trovati)", "https://cdn.discordapp.com/embed/avatars/0.png", "https://github.com/napsav/mussolinibot/tree/scout")
  return embedFinale
}

function dividiArray(array, k) {
  var n = array.length
  var resto = n % k
  const final = []
  if (resto === 0) {
    var daDividere = array
    var restantiArray = []
  } else {
    var daDividere = array
    var restantiArray = []
    for (var i = 0; i < resto; i++) {
      restantiArray.push(daDividere.pop())
    }
  }
  for (let i = 0; i < daDividere.length; i += k) {
    final.push(daDividere.slice(i, i + k))
  }
  restantiArray.forEach((elem, index) => final[final.length - 1 - index].push(elem))
  return final;
}

function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}


// --------------PANNELLO MUSSOLINIBOT---------------

// Bans

const bans_data = fs.readFileSync('bans.json', 'utf-8');
const bans = JSON.parse(bans_data);

// Indexing dei bans

var index = lunr(function () {
  this.ref("id")
  this.field("titolo")
  this.field("testo")
  this.field("descrizione")

  bans.forEach(element => {
    this.add(element)
  });
})


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
app.post("/", function (req, res) {
  console.log("Ricevuto una richiesta POST");
  console.log(req.body);
  var com;
  com = refreshCommandsFile();
  var comando = req.body.comando.trim().toLowerCase();
  var risposta = req.body.risposta.trim();
  if (comando.length === 0 || risposta.length === 0) {
    var alert = "Il comando e la risposta non possono essere vuoti!";
    res.render('index', {
      commands: com,
      alert: alert
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
app.post("/ferrenz", function (req, res) {
  console.log("Ricevuto una richiesta POST a Ferrenz Filter");
  console.log(req.body);
  var par;
  par = refreshParoleFile();
  var parola = req.body.parola.trim().toLowerCase();
  var punteggio = parseInt(req.body.punteggio);
  if (parola.length === 0 || punteggio.length === 0) {
    var alert = "La parola e il punteggio devono avere un valore";
    res.render('parole', {
      parole: par,
      alert: alert
    });
  } else if (!Number.isInteger(punteggio)) {
    var alert = "Il punteggio deve essere un numero senza valori decimali, ad esempio -10, +10 o 5";
    res.render('parole', {
      parole: par,
      alert: alert
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
  if (message.author.bot) return;

  // Parsing comandi e parole
  parseCommands(message);
  parseParole(message);

  // Codice morse, permette di tradurre in tutti e due i versi
  if (message.content.toLowerCase().startsWith('morse')) {
    const args = message.content.slice(6).trim();
    if (!args.length) {
      return message.channel.send(`Il messaggio non può essere vuoto! ${message.author}!`);
    } else if (args.startsWith("-") || args.startsWith(".")) {
      const messaggioMorse = morse.decrypt(args);
      message.channel.send(messaggioMorse);
    } else {
      const messaggioMorse = morse.crypt(args);
      message.channel.send(messaggioMorse);
    }
  }

  if (message.content.toLowerCase().startsWith("dividi")) {
    const args = message.content.toLowerCase().slice(6).trim().split(" ")
    const comando = args.shift().trim()
    console.log(comando)
    console.log(args)
    const voiceChannel = message.member.voice.channel;
    var k = Number.parseInt(args)
    if (!args.length) {
      return message.channel.send("Devi inserire un numero, ad esempio: 'dividi in 5' o 'dividi per', e il bot dividerà le persone connesse al canale vocale in gruppi da 5.")
    } else if (isNaN(k)) {
      return message.channel.send("Devi inserire un numero valido! Ricorda: sono ammessi solo numeri interi.")
    } else if (voiceChannel === null) {
      return message.channel.send("Vi dovete tutti trovare in un canale vocale affinchè il comando funzioni.")
    } else {
      var membriMap = voiceChannel.members
      var membriArray = Array.from(membriMap.values())
      shuffleArray(membriArray)
      console.log(membriArray)
      if (membriArray.length < k) {
        message.channel.send("Non puoi inserire un numero più grande (o uguale) di quello delle persone disponibili")
      } else {
        if(comando === "per") {
          var final = dividiArray(membriArray, k)
          console.log(final)
          final.forEach((sub, index)=> {
            var messaggio = `${index+1}° gruppo: `
            sub.forEach(user => messaggio+=`${user.user} `)
            message.channel.send(messaggio)
          })
        } else if (comando === "in") {
          var final = dividiArray(membriArray, Math.floor(membriArray.length / k))
          console.log(final)
          final.forEach((sub, index)=> {
            var messaggio = `${index+1}° gruppo: `
            sub.forEach(user => messaggio+=`${user.user} `)
            message.channel.send(messaggio)
          })
        } else {
          message.channel.send(`Comando ${comando} non riconosciuto. Puoi scrivere "dividi in <numero>" per stabilire il numero di gruppi, o "dividi per <numero>" per stabilire il numero di persone in un gruppo.`)
        }
      }
    }
  }

  if (message.content.toLowerCase() === "testa o croce") {
    var ris = Math.round(Math.random())
    console.log(ris)
    if (ris) {
      message.channel.send("Croce")
    } else {
      message.channel.send("Testa")
    }
  }

  // ------------------------RICERCA BAN----------------------------------

  if (message.content.startsWith('cercaban')) {
    const args = message.content.slice(8).trim().toLowerCase();
    if (!args.length) {
      return message.channel.send(`Non puoi eseguire una ricerca vuota ${message.author}`);
    } else {
      const filter = (reaction, user) => (user.id == message.author.id) && (reaction.emoji.name == '1️⃣' || reaction.emoji.name == '2️⃣' || reaction.emoji.name == '3️⃣' || reaction.emoji.name == '4️⃣' || reaction.emoji.name == '5️⃣' || reaction.emoji.name == '◀️')
      var embed = new Discord.MessageEmbed()
        .setTitle(`Risultati della ricerca`)
        .setTimestamp()
        .setColor("#f5b041")
        .setFooter("La vera domanda è: perchè no?", "https://cdn.discordapp.com/embed/avatars/0.png")
        .setAuthor("GiacomoBOT x ALGORITMI INCREDIBILI (e dove trovarli)", "https://cdn.discordapp.com/embed/avatars/0.png", "https://github.com/napsav/mussolinibot/tree/scout")

      var search = index.search(args + "~1")
      if (search.length <= 4) {
        embed.setDescription(`Trovati ${search.length} risultati: `)
        search.forEach((elem, i) => {
          embed.addField(`${i + 1} - ${bans[elem["ref"]]["titolo"]}`, `${bans[elem["ref"]]["descrizione"]}`, false)
        })
      } else {
        for (var i = 0; i <= 4; i++) {
          embed.setDescription(`Trovati ${search.length} risultati, ma ne verranno mostrati solo 5: `)
          embed.addField(`${i + 1} - ${bans[search[i]["ref"]]["titolo"]}`, `${bans[search[i]["ref"]]["descrizione"]}`, false)
        }
      }
      var embedFinale = getEmbedRisultato()
      var mess = await message.channel.send({ embed }) //.then(mess => 
      addSearchReactions(mess)
      const collector = mess.createReactionCollector(filter, { time: 300000 });
      collector.on('collect', (reaction, user) => {
        if (reaction.emoji.name == '◀️') {
          mess.edit(embed)
          embedFinale = getEmbedRisultato()
          mess.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
          addSearchReactions(mess)
        } else {
          console.log(reactionsEnum[reaction.emoji.name])
          mess.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
          const selezionato = bans[search[reactionsEnum[reaction.emoji.name] - 1]["ref"]]
          if (selezionato["testo"].length < 1023) {
            embedFinale.addField("Testo", `${selezionato["testo"]}\n\nPerfavore ignora gli altri tasti in basso.`, false)
          } else {
            embedFinale.addField("Testo", "Sì è verificato un problema che al momento non voglio risolvere. Questo problema è invece il cugino dell'altro. Sono le 4 di notte e gestire le eccezioni non è la mia priorità. Quindi quello che si merita è questo: un error handling di merda. In effetti potresti chiederti, perchè scrivi questo messaggio inutile al posto di risolvere il problema? Domanda perfettamente valida.", false);
          }
          if (selezionato["youtube"]) {
            embedFinale.addField("Video", `[YouTube](${selezionato["video"]})`, false)
          } else {
            if (selezionato.hasOwnProperty('video')) {
              embedFinale.addField("Video", `[mp4](${selezionato["video"]})\n[webm](${selezionato["video-webm"]})`, true)
            }
            if (selezionato.hasOwnProperty('audio')) {
              embedFinale.addField("Audio", `[mp3](${selezionato["audio"]})`, true)
            }
          }
          embedFinale.setTitle(`${selezionato["titolo"]}`)
          embedFinale.setDescription(`${selezionato["descrizione"]}`)

          mess.edit(embedFinale)
          mess.react("◀️")
        }
      })
      collector.on('end', collected => {

      });
    }
  }

  // -------------------------BAN CASUALE---------------------------------

  if (message.content.toLowerCase() === "ban") {
    var ban = bans[Math.floor(Math.random() * bans.length)];
    var embed = new Discord.MessageEmbed()
      .setTitle(`${ban["titolo"]}`)
      .setDescription(`${ban["descrizione"]}`)
      .setFooter("Ho sprecato una notte per questa funzione", "https://cdn.discordapp.com/embed/avatars/0.png")
      .setAuthor("GiacomoBOT x bansiamoscraper", "https://cdn.discordapp.com/embed/avatars/0.png", "https://github.com/napsav/bansiamoscraper")
      .setTimestamp()
    if (ban["testo"].length < 1023) {
      embed.addField("Testo", `${ban["testo"]}`, false)
    } else {
      embed.addField("Testo", "Sì è verificato un problema che al momento non voglio risolvere.", false);
    }
    if (ban["youtube"]) {
      embed.addField("Video", `[YouTube](${ban["video"]})`, false)
    } else {
      if (ban.hasOwnProperty('video')) {
        embed.addField("Video", `[mp4](${ban["video"]})\n[webm](${ban["video-webm"]})`, true)
      }
      if (ban.hasOwnProperty('audio')) {
        embed.addField("Audio", `[mp3](${ban["audio"]})`, true)
      }
    }
    message.channel.send({ embed });
  }


  // -----------------------PUNTEGGI-----------------------------


  if (message.content.toLowerCase() === 'punteggi' || message.content.toLowerCase() === 'punteggio' || message.content.toLowerCase() === 'punti') {
    var punti = refreshPuntiFile(message);
    if (!isEmpty(punti)) {
      var descr = "";
      var sorted = [];
      punti = Object.entries(punti).sort(([, a], [, b]) => a - b);
      console.log(punti);
      for (entry of punti) {
        var str = `${entry[0]}: ${entry[1]}\n`;
        descr += str;
      }
      var embed = new Discord.MessageEmbed()
        .setTitle("Punteggi")
        .setDescription(descr)
        .setAuthor("GiacomoBOT x Filtro Ferrenz", "https://i.imgur.com/1FmyBHi.jpeg", "http://resetfocus.duckdns.org:8070/ferrenz")
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
  if (message.content.toLowerCase() === 'akinator') {
    (async function () {
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
            "value": "Odio javascript"
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
        const collector = msg.createReactionCollector(filter, { time: 300000 });
        collector.on('collect', (reaction, user) => {
          if (aki.progress >= 70 || aki.currentStep >= 78) {
            (async function () {
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
            (async function () {
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
            (async function () {
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
            (async function () {
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
