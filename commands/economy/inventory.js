const { EmbedBuilder, ButtonBuilder, SlashCommandBuilder } = require("discord.js")
const paginationEmbed = require("../../helpers/paginationEmbed")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("inventory")
		.setDescription("View your user inventory."),
	async execute(interaction) {
		var inventoryData = []
		await global.itemRecords.findAll({
			include: [{
				model: global.inventoryRecords,
				where: {userID: interaction.user.id}
			}]
		}).then(records =>{
			records.forEach((record) =>{
				inventoryData.push({
					"itemID": record.itemID,
					"name": record.name,
					"description": record.description,
					"showOnProfile": record.inventory.showOnProfile
				})
			})
            
		})
		if (!inventoryData || inventoryData.length === 0) {
			return await interaction.editReply(":x: Your inventory is empty.")
		}
		var pages = []
		const visibleFlagDict = {"0": "", "1":" :eye:"}
		for(var i = 0; i < Math.ceil(inventoryData.length / 10); i++){
			var embed = new EmbedBuilder()
				.setTitle(`${interaction.user.username}'s inventory`)
			for(var j = i *10; j < ((i + 1) * 10); j++){
				if(!inventoryData[j]) break
				embed.addFields(
					{name: `#${inventoryData[j]["itemID"]} - ${inventoryData[j]["name"]}${visibleFlagDict[inventoryData[j]["showOnProfile"]]}`,
						value: inventoryData[j]["description"]}
				)
			}
			pages.push(embed)
		}

		if (pages.length <= 1) {
			return await interaction.editReply({embeds: [pages[0]]})
		}
        
		//buttons to be passed through to the pagination module
		const buttonList = [
			new ButtonBuilder()
				.setCustomId("previousbtn")
				.setLabel("Previous Page")
				.setStyle("DANGER"),
			new ButtonBuilder()
				.setCustomId("nextbtn")
				.setLabel("Next Page")
				.setStyle("SUCCESS")]
		paginationEmbed(interaction, pages, buttonList)
	},        
}