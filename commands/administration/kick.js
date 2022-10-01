const { PermissionFlagsBits, EmbedBuilder, SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("kick")
		.setDescription("Kicks a user and sends a message in DMs. Requires \"Kick Members\" permission.")
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
		.addUserOption(option =>
			option
				.setName("target")
				.setDescription("The user who you want to kick.")
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName("reason")
				.setDescription("The reason for kicking this user.")
				.setRequired(false)),
	async execute(interaction) {
		if(interaction.user.id == interaction.options.getUser("target").id){
			return await interaction.editReply(":x: You cannot kick yourself.")
		}
		if(interaction.client.user.id == interaction.options.getUser("target").id){
			return await interaction.editReply(":x: I can't kick myself, however if you'd like me to leave, kick me manually.")
		}
		let reason
		if (!interaction.options.getString("reason")){
			reason = "No reason given."
		} else {
			reason = interaction.options.getString("reason")
		}
		const embed = new EmbedBuilder()
			.setColor("ORANGE")
			.setTitle(`You have been kicked from ${interaction.guild.name}!`)
			.setThumbnail("https://i.imgur.com/XpWbrhp.png")
			.addFields(
				{name: "Reason:", value: reason},
				{name: "Kicked by:", value: `${interaction.user.username}#${interaction.user.discriminator}`}
			)
		await interaction.options.getMember("target").createDM()
			.then(async (DMChannel) => {
				let kickMessage = await DMChannel.send({embeds: [embed]}).then(async () => {
					await interaction.editReply("Kick message sent successfully.")
				})    
					.catch(async (e) => {
						console.error(e)
						await interaction.editReply(":x: There was an issue sending this user their kick message.")
					})
					.then(async () => {
						await interaction.options.getMember("target").kick().then(async () => {
							await interaction.followUp("Kick performed successfully.")
						})
							.catch(async (e) => {
								await interaction.followUp(":x: There was an issue while trying to kick this user.")
								await kickMessage.delete()
								console.error(e.stack)
							})
					})
			})
		try{
			await global.adminlogRecords.create({serverID: interaction.guild.id, recipientID: interaction.options.getUser("target").id, adminID: interaction.user.id, type: "kick", reason: interaction.options.getString("reason"), time: Math.floor(Date.now() /1000), botUsed: true})
			await interaction.followUp("Kick entry created.")
		} catch(error){
			console.error(error.stack)
			await interaction.followUp("Error creating log entry. Case not recorded.")
		}
	}
}