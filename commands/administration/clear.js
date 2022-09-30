const { PermissionFlagsBits, SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("clear")
		.setDescription("Clear a specific amount of messages in a specified channel.")
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addIntegerOption(option =>
			option.setName("amount")
				.setDescription("The amount of messages that the bot should clear.")
				.setRequired(true))
		.addChannelOption(option =>
			option.setName("targetchannel")
				.setDescription("The channel that you want to clear messages in.")),
	async execute(interaction) {
		//To determine what channel the bulk deletion should be targeted at, we should check to see if an argument has been passed
		let targetChannel
		if (interaction.options.getChannel("targetchannel") == null){
			targetChannel = interaction.channel
		} else {
			targetChannel = interaction.options.getChannel("targetchannel")
		}

		await targetChannel.messages.fetch({limit: interaction.options.getInteger("amount")})
			.then(async (messages) => {
				messages.forEach(async (message) => {
					//We don't want the original interaction message deleting since that would cause an error, so we check for it during deletion
					if (message.author.id != interaction.client.id && !message.interaction){
						await message.delete()
					}
				})
				await interaction.editReply(`Successfully deleted ${messages.size} messages.`)
			}).catch(async (e) => {
				console.error(e)
				await interaction.editReply(`An error occurred during message deletion. Traceback:\n\`\`\`${e}\`\`\`\n(Please send this to the developer)`)
			}).then(async () => {
				await global.adminlogRecords.create({serverID: interaction.guild.id, recipientID: targetChannel.id, adminID: interaction.user.id, type: "clear", reason: interaction.options.getInteger("amount"), time: Math.floor(Date.now() /1000), botUsed: true})
			}).catch(async (e) => {
				console.error(e)
				await interaction.followUp({content: "There was an error recording this administrative action.", ephemeral: true})
			})
		}
	}