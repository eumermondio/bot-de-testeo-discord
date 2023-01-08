// Imports
const {
    REST,
    Routes
} = require('discord.js');
const {
    clientId,
    token
} = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');
const Discord = require("discord.js")
const {
    EmbedBuilder,
    Collection,
    Events
} = require('discord.js');
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
    console.log("Bot encendido");
    cargarComandos()
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
})

// Evento de mensajes
client.on("messageCreate", (message) => {
    avisoGeneral(message);
    if (/^!p/.test(message.content)) {
        const exampleEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle(`**:robot: ACTUALIZACIÓN DEL BOT :robot:**`)
            .setAuthor({
                name: client.user.username + "#" + client.user.discriminator,
                iconURL: client.user.avatarURL()
            })
            .setDescription('*Notas de la actualización :arrow_heading_down:*')
            .setThumbnail("https://i.imgur.com/axh1NvF.png")
            .addFields({
                name: 'Regular field title',
                value: 'Some value here'
            }, {
                name: '\u200B',
                value: '\u200B'
            }, {
                name: 'Inline field title',
                value: 'Some value here',
                inline: true
            }, {
                name: 'Inline field title',
                value: 'Some value here',
                inline: true
            }, )
            .addFields({
                name: 'Inline field title',
                value: 'Some value here',
                inline: true
            })
            .setImage(client.user.avatarURL())
            .setTimestamp()
            .setFooter({
                text: 'Sistema de avisos generales, creado por eumermondio#6071',
                iconURL: client.user.avatarURL()
            });

        message.channel.send({
            embeds: [exampleEmbed]
        });
    }
})

// LogIn
client.login(token)

// Funciones

// Envia un mensaje a todos los canales de aviso ( SOLO FUNCIONA SI SOY YO EL K LO MANDA DESDE EL CANAL DE MI SV )
function avisoGeneral(message) {
    if (/^\!aviso/.test(message.content)) {
        // Comprobar que solo se pueda ejecutar el comando desde el canal de mi server y que no lo pueda ejecutar nadie k no sea yo
        if (message.channel.id === "1060165732404580444" && message.author.discriminator === "6071" && message.author.username === "eumermondio") {
            let params = message.content.trim().split(" ");
            params.shift();
            if (params.length >= 1) {
                client.channels.cache.forEach(canal => {
                    if (canal.name === "avisos-de-bot") {
                        canal.send(params.join(" "))
                    }
                })
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