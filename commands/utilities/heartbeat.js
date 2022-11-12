const { SlashCommandBuilder } = require("discord.js")

//Simple command sure, but I mostly keep this around to use as a nice copy/paste template.

module.exports = {
	data: new SlashCommandBuilder()
		.setName("heartbeat")
		.setDescription("Check to see if the bot is responsive."),
	async execute(interaction) {
		await interaction.editReply("I'm alive!")
	},
}