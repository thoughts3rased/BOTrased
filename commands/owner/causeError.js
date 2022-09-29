const { SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("throwerror")
		.setDescription("Deliberately throw an error to check error handling"),
	async execute(interaction) {
		await interaction.reply(`${x.aaaaaa}`)
	},
}