const { SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("flip")
		.setDescription("Flip a coin."),
	async execute(interaction) {
		const numberResult = Math.random()
		await interaction.editReply(numberResult > 0.5 ? "<:heads:809568187707817994>" : "<:tails:809568669029236766>")
		.then(async () => {
			await interaction.channel.send(`You got ${numberResult > 0.5? "**heads**" : "**tails**"}.`)
		})
	},
}