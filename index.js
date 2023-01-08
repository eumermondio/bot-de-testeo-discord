// Imports
const {
    REST,
    Routes
} = require('discord.js');
const {
    clientId,
    token
} = require('./configs/config.json');
const fs = require('node:fs');
const path = require('node:path');
const Discord = require("discord.js")
const {
    EmbedBuilder,
    Collection,
    Events
} = require('discord.js');
const {
    userInfo
} = require('node:os');
const {
    ServerResponse
} = require('node:http');
const {
    table
} = require('node:console');
const client = new Discord.Client({
    intents: ["AutoModerationConfiguration", "AutoModerationExecution", "DirectMessageReactions", "DirectMessageTyping", "DirectMessages", "GuildBans", "GuildEmojisAndStickers", "GuildIntegrations", "GuildInvites", "GuildMembers", "GuildMessageReactions", "GuildMessageTyping", "GuildMessages", "GuildPresences", "GuildScheduledEvents", "GuildVoiceStates", "GuildWebhooks", "Guilds", "MessageContent"],
});
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Cuando el bot enciende
client.on("ready", () => {
    console.clear();
    console.log(`Bot encendido\nLogueado como: ${client.user.username}#${client.user.discriminator}`);
    client.user.setPresence({
        status: "dnd"
    });
    client.user.setActivity("bot de testeo | creador eumermondio#6071")
})

// Eventos ( Comandos / )
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true
        });
    }
    console.log(interaction);
});

// Evento de cuando entra el bot a un server
client.on("guildCreate", server => {
    crearCanalDeAvisos(server);
    cargarComandos();
})

// Evento de mensajes
client.on("messageCreate", (message) => {
    avisoGeneral(message);
    avisoUpdates(message);
    buscaminas(message);
})

// LogIn
client.login(token)

// Funciones

// Buscaminas para jugar
function buscaminas(message) {
    if (/^!buscaminas\s[0-9]+/.test(message.content)) {
        let numMinas = parseInt(message.content.trim().split(" ")[1]);
        console.log(numMinas);
        let minas = ":boom:";
        let vacio = ":white_large_square:";
        let tablero = "";
        let salto = "";
        let casilla = [];
        let rnd = 0;
        if (numMinas == NaN || numMinas == 0 || numMinas >= 25 || numMinas == undefined) {
            message.reply("El numero de minas no es correcto");
        } else {
            // Generar el grid
            for (let i = 0; i < 25; i++) {
                if (i < numMinas) {
                    casilla.push(minas);
                } else {
                    casilla.push(vacio);
                }
            }

            // Mezclar los emotes
            let cambios = 20;
            let aux = "";
            let rnd2 = 0;
            while (cambios > 0) {
                rnd = Math.round(Math.random() * 24);
                rnd2 = Math.round(Math.random() * 24);
                aux = casilla[rnd];
                casilla[rnd] = casilla[rnd2];
                casilla[rnd2] = aux;
                cambios--;
            }

            // Crear el string del tablero y mostrarlo por mensaje
            for (let i = 0; i < 25; i++) {
                if (((i + 1) % 5) == 0) {
                    salto = "\n";
                }
                tablero += `||${casilla[i]}||${salto}`;
                salto = "";
            }
            message.channel.send(tablero);
        }
    }
}

// Plantilla para avisos de updates del bot
function avisoUpdates(message) {
    if (/^!act$/.test(message.content)) {
        const exampleEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle(`**:robot: ACTUALIZACIÓN DEL BOT :robot:**`)
            .setAuthor({
                name: client.user.username + "#" + client.user.discriminator,
                iconURL: client.user.avatarURL()
            })
            .setDescription('*Notas de la actualización V1.1 :arrow_heading_down:*')
            .setThumbnail("https://i.imgur.com/axh1NvF.png")
            .addFields({
                name: ':arrow_right: Código del bot reescrito :white_check_mark:',
                value: 'Se ha reescrito el código del bot de acuerdo a los nuevos estándares y versión de NodeJS reestructurando el código y mejorando su eficiencia'
            }, {
                name: ':arrow_right: Añadidas nuevas funcionalidades :white_check_mark:',
                value: 'Se han arreglado algunos comandos y se han añadido nuevas funcionalidades. ***No compatible*** con comandos ***/*** use ***!*** a su vez',
                inline: true
            }, {
                name: ':arrow_right: Añadida funcionalidad exclusiva del autor :white_check_mark:',
                value: 'Hace referencia a comandos que sólo puede usar el creador del bot eumermondio#6071 y nadie más',
                inline: true
            }, )
            .addFields({
                name: ':arrow_right: Mejorado el sistema de envío de mensajes :white_check_mark:',
                value: 'Se ha implementado un sistema de mensajes basado en ***embeds*** con el cual se mejora considerablemente la experiencia de usuario'
            })
            .setImage(client.users.cache.find(user => user.id === "529698592877838346").avatarURL())
            .setTimestamp()
            .setFooter({
                text: 'Sistema de avisos generales, creado por eumermondio#6071',
                iconURL: client.user.avatarURL()
            });

        message.channel.send({
            embeds: [exampleEmbed]
        });
    }
}

// Envia un mensaje a todos los canales de aviso ( SOLO FUNCIONA SI SOY YO EL K LO MANDA DESDE EL CANAL DE MI SV )
function avisoGeneral(message) {
    let c = 0;
    let servers = "";
    if (/^\!avtest/.test(message.content)) {
        // Comprobar que solo se pueda ejecutar el comando desde el canal de mi server y que no lo pueda ejecutar nadie k no sea yo
        if (message.channel.id === "1060165732404580444" && message.author.discriminator === "6071" && message.author.username === "eumermondio") {
            let params = message.content.trim().split(" ");
            params.shift();
            if (params.length >= 1) {
                client.channels.cache.forEach(canal => {
                    if (canal.name === "avisos-de-bot") {
                        canal.send(params.join(" "))
                        c++;
                        servers += canal.guild.name + ", ";
                    }
                })
                message.reply(`Se han enviado ${c} avisos a los servers: ${servers}`)
            } else {
                message.reply("Se debe especificar al menos un parámetro al comando")
            }
        } else {
            message.reply("No estás autorizado a usar este comando aquí")
        }
    }
}

// Crea un canal de aviso por server
function crearCanalDeAvisos(server) {
    let encontrado = false;
    server.channels.cache.forEach(canal => {
        if (canal.name === "avisos-de-bot") {
            encontrado = true;
        }
    })
    if (!encontrado) {
        server.channels.create({
            name: "Avisos de bot"
        })
    }
}

// Carga los comandos de /
function cargarComandos() {
    const commands = [];
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        commands.push(command.data.toJSON());
    }

    const rest = new REST({
        version: '10'
    }).setToken(token);

    (async () => {
        try {
            console.log(`Started refreshing ${commands.length} application (/) commands.`);

            const data = await rest.put(
                Routes.applicationCommands(clientId), {
                    body: commands
                },
            );

            console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            console.error(error);
        }
    })();
}