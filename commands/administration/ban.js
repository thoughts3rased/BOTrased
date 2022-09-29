const { PermissionFlagsBits, EmbedBuilder, SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ban")
		.setDescription("Bans a user and sends a message in DMs.")
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.addUserOption(option =>
			option
				.setName("target")
				.setDescription("The user who you want to ban.")
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName("reason")
				.setDescription("The reason for banning this user.")
				.setRequired(false)),
	async execute(interaction) {
		if(interaction.user.id == interaction.options.getUser("target").id){
			return await interaction.reply("You cannot ban yourself.")
		}
		if(interaction.client.user.id == interaction.options.getUser("target").id){
			return await interaction.reply("I can't ban myself, however if you'd like me to leave, kick me manually.")
		}
		await interaction.deferReply()
		let reason
		if (!interaction.options.getString("reason")){
			reason = "No reason given."
		} else {
			reason = interaction.options.getString("reason")
		}
		const embed = new EmbedBuilder()
			.setColor("RED")
			.setTitle(`You have been permanently banned from ${interaction.guild.name}!`)
			.setThumbnail("https://i.imgur.com/HBYFM4H.png")
			.addFields(
				{name: "Reason:", value: reason},
				{name: "Banned by:", value: `${interaction.user.username}#${interaction.user.discriminator}`}
			)
		await interaction.options.getMember("target").createDM()
			.then(async (DMChannel) => {
				let banMessage = await DMChannel.send({embeds: [embed]}).then(async () => {
					await interaction.editReply("Ban message sent successfully.")
				})    
					.catch(async (e) => {
						console.error(e.stack)
						await interaction.editReply("There was an issue sending this user their ban message.")
					})
					.then(async () => {
						await interaction.options.getMember("target").ban({days: 0, reason: reason})
						.then(async () => {
							await interaction.followUp("Ban performed successfully.")
						})
							.catch(async (e) => {
								await interaction.followUp("There was an issue while trying to ban this user.")
								banMessage.delete()
								console.error(e.stack)
							})
					})
			})
        
		try{
			global.adminlogRecords.create({serverID: interaction.guild.id, recipientID: interaction.options.getUser("target").id, adminID: interaction.user.id, type: "ban", reason: interaction.options.getString("reason"), time: Math.floor(Date.now() /1000), botUsed: true})
			await interaction.followUp("Ban entry created.")
		} catch(error){
			console.error(error.stack)
			await interaction.followUp("Error creating log entry. Case not recorded.")
		}
	}
}