const { SlashCommandBuilder } = require("@discordjs/builders")
const { Permissions, MessageEmbed, BanOptions } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ban")
		.setDescription("Bans a user and sends a message in DMs. Requires \"Ban Members\" permission.")
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
		if(!interaction.member.permissions.has(Permissions.FLAGS.KICK_MEMBERS, true)){
			return await interaction.reply("You do not have the appropriate permissions to use this command.")
		}
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
		const embed = new MessageEmbed()
			.setColor("RED")
			.setTitle(`You have been permanently banned from ${interaction.guild.name}!`)
			.setThumbnail("https://i.imgur.com/HBYFM4H.png")
			.addFields(
				{name: "Reason:", value: reason},
				{name: "Banned by:", value: `${interaction.user.username}#${interaction.user.discriminator}`}
			)
		await interaction.options.getMember("target").createDM()
			.then((DMChannel) => {
				let banMessage = DMChannel.send({embeds: [embed]}).then(() => {
					interaction.editReply("Ban message sent successfully.")
				})    
					.catch((e) => {
						interaction.editReply("There was an issue sending this user their ban message.")
					})
					.then(() => {
						interaction.options.getMember("target").ban({days: 0, reason: reason}).then(() => {
							interaction.followUp("Ban performed successfully.")
						})
							.catch((e) => {
								interaction.followUp("There was an issue while trying to ban this user.")
								banMessage.delete()
								console.log(e.stack)
							})
					})
			})
        
		try{
			const newRecord = adminlogRecords.create({serverID: interaction.guild.id, recipientID: interaction.options.getUser("target").id, adminID: interaction.user.id, type: "ban", reason: interaction.options.getString("reason"), time: Math.floor(Date.now() /1000), botUsed: true})
			await interaction.followUp("Ban entry created.")
		} catch(error){
			console.log(error.stack)
			await interaction.followUp("Error creating log entry. Case not recorded.")
		}
	}
}