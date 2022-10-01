const { PermissionFlagsBits, SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("nickname")
		.setDescription("Change a member's nickname.")
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
		.addUserOption(option =>
			option.setName("target")
				.setDescription("The user who's nickname you want to change.")
				.setRequired(true))
		.addStringOption(option =>
			option.setName("newnickname")
				.setDescription("The nickname you want to give to the user.")
				.setRequired(true)),
	async execute(interaction) {
		if (interaction.options.getString("newnickname").length > 32){
			return await interaction.editReply(":x: The nickname you have entered is too long.")
		}
		await interaction.options.getMember("target").setNickname(interaction.options.getString("newnickname"))
			.then(async () => {
				await interaction.editReply("Nickname changed successfully")
			})
			.then(async () => {
				await global.adminlogRecords.create({serverID: interaction.guild.id, recipientID: interaction.options.getUser("target").id, adminID: interaction.user.id, type: "name", reason: null, time: Math.floor(Date.now() /1000), botUsed: true})
			})
			.catch(async (e) =>{
				console.error(e)
				await interaction.followUp(":x: There was an issue recording the action in the database.")
			})
	},
}