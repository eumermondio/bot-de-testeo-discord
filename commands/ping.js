const {
	SlashCommandBuilder
} = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Muestra el tiempo de respuesta del bot'),
	async execute(interaction) {
		await interaction.reply(`El ping del bot es de ${interaction.client.ws.ping} ms`);
	},
};