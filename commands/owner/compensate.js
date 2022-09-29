const { SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("compensate")
		.setDescription("Used for compensating all users with a set amount of credits")
        .addIntegerOption(
            option =>
            option.setName("amount")
            .setDescription("The amount of credits to compensate all users with")
            .setRequired(true)
        ),
	async execute(interaction) {
		await userRecords.increment({money: interaction.options.getInteger("amount")}, {where: {}})
        .then(async () => {
            await interaction.reply(`:white_check_mark: Successfully compensated all users with ${interaction.options.getInteger("amount")} credits.`)
        })
        .catch(async (error) =>{
            await interaction.reply(`:x: Failed to compensate all users.\n Full stack trace: ${'```'}${error.stack}${'```'}`)
        })
	}
}