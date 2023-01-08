const {
	SlashCommandBuilder
} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Muestra el tiempo de respuesta del bot'),
	async execute(interaction) {
		let ping = Date.now() - interaction.createdTimestamp;
		await interaction.reply(`El ping del bot es de ${ping} ms`);
	},
};