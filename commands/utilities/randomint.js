const { SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("randomint")
		.setDescription("Generate a random number between 0 and a specified integer.")
		.addIntegerOption(option =>
			option.setName("number1")
				.setDescription("The lower limit, or the upper limit if this is not specified.")
				.setRequired(true))
		.addIntegerOption(option =>
			option.setName("number2")
				.setDescription("The upper limit.")
				.setRequired(false)),
	async execute(interaction) {
		let upper
		let lower
		if (interaction.options.getInteger("number2") != null){
			lower = interaction.options.getInteger("number1")
			upper = interaction.options.getInteger("number2")
		} else{
			lower = 0
			upper = interaction.options.getInteger("number1")
		}
		if (lower > upper){
			await interaction.editReply("Your lower limit must be lower than your higher limit.")
			return
		}
		await interaction.editReply(`Your generated number is ${Math.floor(Math.random() * (upper - lower) ) + lower}`)
	},
}