const { EmbedBuilder, ButtonBuilder, SlashCommandBuilder, ButtonStyle } = require("discord.js")
const pagingationEmbed = require("../../helpers/paginationEmbed")

const buyItem = async (interaction, itemID) => {
	const item = await itemRecords.findOne({where: {itemID: itemID, purchasable: 1}})
	const user = await userRecords.findOne({where: {userID: interaction.user.id}})
	if(!item){
		return await interaction.editReply(":x: The item ID you entered does not correspond to an item that exists or the item is not purchasable.")
	}
	if(await inventoryRecords.findOne({where: {userID: interaction.user.id, itemID: interaction.options.getInteger("itemid")}})){
		return await interaction.editReply(":x: You already own this item.")
	}
	if(user.get("money") < item.get("price")){
		return await interaction.editReply(":x: You don't have enough credits to purchase this item.")
	}
	await userRecords.increment({money: 0 - item.get("price")}, {where: {userID: interaction.user.id}})
	await inventoryRecords.create({userID: interaction.user.id, itemID: itemID})
	return await interaction.editReply(`You have successfully purchased **${item.get("name")}** and it has been added to your inventory. Please come again!`)
}




module.exports = {
	data: new SlashCommandBuilder()
		.setName("shop")
		.setDescription("View the shop"),
	async execute(interaction) {
		const shopDataArray = []
		await itemRecords.findAll(
			{where: {purchasable : 1}}).then(
			records => {
				records.forEach((record) =>{
					shopDataArray.push({
						itemID: record.itemID,
						type: record.type,
						name: record.name,
						price: record.price,
						description: record.description
					})
				})
			}
		)
		
		pageButtonArray = [
			new ButtonBuilder()
				.
		]

		var pages = []
		var pageButtons = []
		for(var i = 0; i < Math.ceil(shopDataArray.length/5); i++){
			currentPageButtons = []
			var embed = new EmbedBuilder()
				.setTitle("BOTrased's Shop")
				.setDescription("Browse through my wares and use /buy [item id] when you're done")
			for(var j = 0; j < 5; j++){
				var currentIndex = (i * 5) + (j)
				if (!shopDataArray[currentIndex]){
					break
				}
				embed.addFields(
					{name: `#${shopDataArray[currentIndex]["itemID"]} - ${shopDataArray[currentIndex]["name"]} (${shopDataArray[currentIndex]["type"]})`,
						value:`Price: ${shopDataArray[currentIndex]["price"]} credits\n${shopDataArray[currentIndex]["description"]}`,
						inline: false}
				)
			}
			pages.push(embed)
		}
		if (pages.length <= 1){
			return await interaction.editReply({embeds: [pages[0]]})
		}
		const buttonList = [
			new ButtonBuilder()
				.setCustomId("previousbtn")
				.setLabel("Previous Page")
				.setStyle("DANGER"),
			new ButtonBuilder()
				.setCustomId("nextbtn")
				.setLabel("Next Page")
				.setStyle("SUCCESS")
		]
			
	},
}