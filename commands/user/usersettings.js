const { EmbedBuilder, SlashCommandBuilder, Colors } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("usersettings")
		.setDescription("Modify various user settings.")
		.addSubcommand(subcommand =>
			subcommand
				.setName("userlevelupmessage")
				.setDescription("Change whether your level up message appears.")
				.addStringOption(option =>
					option.setName("state")
						.setRequired(true)
						.setDescription("The option for this setting.")
						.addChoices(
							{ name: "on", value: "1" },
							{ name: "off", value: "0" }
						)))
		.addSubcommand(subcommand =>
			subcommand
				.setName("profilemessage")
				.setDescription("Set your profile message.")
				.addStringOption(option =>
					option
						.setName("newmessage")
						.setDescription("The new message you want to change your current message to.")
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName("clearprofilemessage")
				.setDescription("Clears your profile message."))
		.addSubcommand(subcommand =>
			subcommand
				.setName("profilecolour")
				.setDescription("Use a hex value to set the colour displayed on your profile.")
				.addStringOption(option =>
					option
						.setName("colour")
						.setDescription("The hex value for the colour you want to set.")
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName("show")
				.setDescription("Shows your current setting configuration."))
		.addSubcommand(subcommand =>
			subcommand
				.setName("displaybadge")
				.setDescription("Toggle whether a badge is displayed on your profile or not.")
				.addIntegerOption(option =>
					option
						.setName("itemid")
						.setDescription("The item ID of the badge you want to make visible (use /inventory to get this).")
						.setRequired(true))),
	async execute(interaction) {
		/**
         * Since all subcommands here deal with the author's user record, it's best to just get this done with a single line outside of the switch case
         * Even if a specific subcommand doesn't use it, it saves me repeating this line over and over
         */
		const userRecord = await userRecords.findOne({where: {userID: interaction.user.id}})
		switch(interaction.options.getSubcommand()){
		case "userlevelupmessage":
			const result = {"1": "**ON**", "0": "**OFF**"}
			await userRecord.update({levelUpMessage: interaction.options.getString("state")}, {where: {userID: interaction.user.id}})
			await interaction.editReply(`Level up messages are now turned ${result[interaction.options.getString("state")]} for you.`)
			break
		case "profilemessage":
			await userRecord.update({message: interaction.options.getString("newmessage")}, {where: {userID: interaction.user.id}})
			await interaction.editReply(`Your profile message has been set to:\n${interaction.options.getString("newmessage")}`)   
			break
		case "clearprofilemessage":
			await userRecord.update({message: null}, {where: {userID: interaction.user.id}})
			await interaction.editReply("Profile message cleared successfully.")    
			break
		case "profilecolour":
			const colour = interaction.options.getString("colour").toLowerCase()
			if (colour.length != 6 || !colour.match(/^[0123456789abcdef]+$/g)){
				await interaction.editReply("That is not a valid hex value. Please ensure you remove the # and try again.")
				return
			}
			await userRecord.update({embedColour: colour}, {where: {userID: interaction.user.id}})
			await interaction.editReply("Profile colour successfully updated.")
			break
		case "show":
			const states = {1: "Enabled", 0: "Disabled"}
			const userColour = userRecord.get("embedColour")
			const embed = new EmbedBuilder()
				.setColor(Colors.LightGrey)
				.setTitle(`${interaction.user.username}'s settings configuration`)
				.addFields(
					{name: "Level Up Messages:", value: `${states[userRecord.get("levelUpMessage")]}`},
					{name: "Profile Colour Hex Value:", value: userColour != null ? `#${userColour.toUpperCase()}` : "None set"}
                        
				)
			if (userRecord.get("message")){
				embed.addFields(
					{name: "Profile Message:", value: `${userRecord.get("message")}`}
				)
			}
			await interaction.editReply({embeds: [embed]})
			break
		case "displaybadge":
			const userInventory = await inventoryRecords.findOne({where: {userID: interaction.user.id, itemID: interaction.options.getInteger("itemid")}})
			const targetBadge = await itemRecords.findOne({where: {itemID: interaction.options.getInteger("itemid"), type: "badge"}})
			if (!userInventory){
				return await interaction.editReply("You do not own this item.")
			}
			if(!targetBadge){
				return await interaction.editReply("Invalid badge selected.")
			}
			if (userInventory.get("showOnProfile") == 1){
				await userInventory.update({showOnProfile: 0}, {where: {userID: interaction.user.id, itemID: interaction.options.getInteger("itemid")}})
				return await interaction.editReply(`Your ${targetBadge.get("name")} has been hidden from your profile.`)
			}
			await userInventory.update({showOnProfile: 1}, {where: {userID: interaction.user.id, itemID: interaction.options.getInteger("itemid")}})
			return await interaction.editReply(`Your ${targetBadge.get("name")} will now be shown on your profile.`)
            
		}
	},
}