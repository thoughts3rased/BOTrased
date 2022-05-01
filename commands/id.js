const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("id")
		.setDescription("Returns the ID of a specified user, or yours if none are specified.")
		.addUserOption(option => 
			option.setName("target")
				.setDescription("The target user.")    
				.setRequired(false)),
	async execute(interaction) {
		//has the user specified a target that is not themselves?
		if (interaction.options.getMember("target") != null && interaction.options.getMember("target").id != interaction.user.id){
			//if so, give them a 3rd person message
			await interaction.reply(`<@${interaction.options.getMember("target").id}>'s user ID is ${interaction.options.getMember("target").id}.`)
		} else{
			//otherwise, give them a 2nd person message
			await interaction.reply(`Your user ID is ${interaction.user.id}.`)
		}
		//might add special case for asking for the bot's userID, but that's low priority.
		
	},
}