const { Permissions, EmbedBuilder, SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("warn")
		.setDescription("Warns a user with a message in DMs. Requires \"Kick Members\" permission.")
		.addUserOption(option =>
			option
				.setName("target")
				.setDescription("The user who you want to warn.")
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName("reason")
				.setDescription("The reason for warning this user.")
				.setRequired(false)),
	async execute(interaction) {
		if(!interaction.member.permissions.has(Permissions.FLAGS.KICK_MEMBERS, true)){
			return await interaction.reply("You do not have the appropriate permissions to use this command.")
		}
		if(interaction.user.id == interaction.options.getUser("target").id){
			return await interaction.reply("You cannot warn yourself.")
		}
		if(interaction.client.user.id == interaction.options.getUser("target").id){
			return await interaction.reply("I can't warn myself, that's mean!")
		}
		await interaction.deferReply()
		let reason
		if (!interaction.options.getString("reason")){
			reason = "No reason given."
		} else {
			reason = interaction.options.getString("reason")
		}
		const embed = new EmbedBuilder()
			.setColor("GOLD")
			.setTitle("You have been warned!")
			.setThumbnail("https://i.imgur.com/w5CDAw7.png")
			.addFields(
				{name: "Reason:", value: reason},
				{name: "Sever:", value: interaction.guild.name},
				{name: "Warned by:", value: `${interaction.user.username}#${interaction.user.discriminator}`}
			)
		try{
			await interaction.options.getUser("target").send({embeds: [embed]})
			await interaction.editReply("Warn successful.")
		} catch (error) {
			console.error(error.stack)
			await interaction.editReply("There was an issue sending this user their warn message.")
		}
		try{
			const newRecord = adminlogRecords.create({serverID: interaction.guild.id, recipientID: interaction.options.getUser("target").id, adminID: interaction.user.id, type: "warn", reason: interaction.options.getString("reason"), time: Math.floor(Date.now() /1000), botUsed: true})
			await interaction.followUp("Warn entry created.")
		} catch(error){
			console.error(error.stack)
			await interaction.followUp("Error creating log entry. Case not recorded.")
		}
	}
}