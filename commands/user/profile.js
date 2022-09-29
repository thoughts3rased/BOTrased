const { EmbedBuilder, SlashCommandBuilder, Colors } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("profile")
		.setDescription("Check your user profile.")
		.addUserOption(option =>
			option.setName("target")
				.setDescription("User who's profile you want to view.")
				.setRequired(false)),
	async execute(interaction) {
		let targetID
		let targetAvatar
		let targetName
        
		if (interaction.options.getUser("target") == null){
			//if the user hasn't specified a target, set the user as the target
			targetID = interaction.user.id
			targetAvatar = interaction.user.displayAvatarURL()
			targetName = interaction.user.username
		} else {
			targetID = interaction.options.getUser("target").id
			targetAvatar = interaction.options.getUser("target").displayAvatarURL()
			targetName = interaction.options.getUser("target").username
		}
        
		//obtain the target's user record from the database
		const targetUser = await global.userRecords.findOne({where: {userID: targetID}})
        
		//check to see if the target user has a profile
		if (targetUser == null){
			await interaction.reply("This user does not have a profile.")
			return
		}
        
		//fetch all the badges that the target user owns and that they have set as visible
		const targetUserBadgeInventory = await global.inventoryRecords.findAll({where: {userID: targetID, showOnProfile: 1}})
        
		//this string will be the title of the field that contains the badges
		let badgeString = ""
        
		for (let i = 0; i < targetUserBadgeInventory.length; i++) {
			//obtain the badge's item record
			const badge = await global.itemRecords.findOne({where: {itemID: targetUserBadgeInventory[i].get("itemID")}})
			//add the badge's emoji string to the badge string
			badgeString += badge.get("emojiString")
		}
		//embed colour logic
		let profileColour
		if (targetUser.get("embedColour") == null) { //check to see if the user has set an embed colour
			/**
            * The below code determines what colour the embed should be dependant on the user's level
            * For users under level 100, it should be light grey
            * For users between level 100-199, it should be a bronze colour
            * For users between level 200-399, it should be a silver colour
            * For users above level 400, it should be a gold colour
            */
			if (targetUser.get("level") < 100){
				profileColour = Colors.LightGrey
			} else if (targetUser.get("level") < 200){
				profileColour = [166,121,18]
			} else if (targetUser.get("level") < 400){
				profileColour = [104, 105, 104]
			} else {
				profileColour = [221, 224, 0]
			}
		} else {
			//if a user has set their embed colour, just get the hex string from the database
			profileColour = `#${targetUser.get("embedColour")}`
		}
		const embed = new EmbedBuilder()
			.setColor(profileColour)
			.setTitle(`${targetName}'s profile`)
			.addFields(
				{name: "Experience:", value: `${targetUser.get("exp")}`},
				{name: "Level:", value: `Level ${targetUser.get("level")}`},
				{name: "Credits:", value: `${targetUser.get("money")} credits`}
			)
			.setThumbnail(`${targetAvatar}`)
        
		//logic for displaying the user's custom message (if one is set)
		if (targetUser.get("message") != null){
			embed.setDescription(`${targetUser.get("message")}`)
		}

		//logic for displaying the user's next daily handout
		let timeRemainingSecs
        
		//calculate how many seconds until the user is entitled to a daily handout
		if (targetUser.get("lastdaily") != null){
			timeRemainingSecs = (targetUser.get("lastdaily") + 86400) -  Math.floor(Date.now() / 1000)
		} else {
			timeRemainingSecs = 0
		}
        
		//if the user's daily handout is available, display this
		if (timeRemainingSecs <= 0) {
			embed.addFields({name: "Daily Reset:", value: "Daily is available!"})
		} else {
			//otherwise, display a timestamp representing the time at which they can claim their daily handout again
			const nextDailyEpochStamp = Math.floor(Date.now() /1000) + timeRemainingSecs
			embed.addFields({name: "Daily Reset:", value: `Next daily reset at <t:${nextDailyEpochStamp}>`})
		}
        
		//logic for displaying badges (if they have any)
		if (badgeString != ""){
			/**
             * The badges are displayed in the title, not the value due to the fact that you must have both and the gap bothered me
             * However I can't just leave out a field because Discord's API does not like that
             * My patchwork solution is to just set the value of the field to a zero-width space
             */
			embed.addFields({
				name: badgeString, value: "​"
			})
		}
		//reply to the command with the embed
		await interaction.reply({embeds: [embed]})
	},
}
