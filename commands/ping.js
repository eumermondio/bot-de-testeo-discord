const {
	SlashCommandBuilder
} = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Muestra el tiempo de respuesta del bot'),
	async execute(interaction) {
		if (interaction.commandName === 'ping') {
			await interaction.reply(`El ping del bot es de ${interaction.client.ws.ping} ms`);
			await wait(1000);
			await interaction.editReply(`El ping del bot es de ${interaction.client.ws.ping} ms`);
			await interaction.followUp('Pong again!');
			const message = await interaction.fetchReply();
			message.react('😄');
		}
	}
};