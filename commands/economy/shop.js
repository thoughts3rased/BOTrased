const { EmbedBuilder, ButtonBuilder, SlashCommandBuilder } = require("discord.js")
const pagingationEmbed = require("../../helpers/paginationEmbed")
module.exports = {
	data: new SlashCommandBuilder()
		.setName("shop")
		.setDescription("Commands relating to all shop-related activities")
		.addSubcommand(subcommand =>
			subcommand
				.setName("view")
				.setDescription("View the contents of the item shop."))
		.addSubcommand(subcommand =>
			subcommand
				.setName("buy")
				.setDescription("Purchase an item from the item shop")
				.addIntegerOption(option =>
					option
						.setName("itemid")
						.setDescription("The item ID of the item you want to buy")
						.setRequired(true))),
	async execute(interaction) {
		switch(interaction.options.getSubcommand()){
		case "view":
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
			var pages = []
			for(var i = 0; i < Math.ceil(shopDataArray.length/5); i++){
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
			pagingationEmbed(interaction, pages, buttonList)
			break

			
		case "buy":
			const item = await itemRecords.findOne({where: {itemID: interaction.options.getInteger("itemid"), purchasable: 1}})
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
			await inventoryRecords.create({userID: interaction.user.id, itemID: interaction.options.getInteger("itemid")})
			return await interaction.editReply(`You have successfully purchased **${item.get("name")}** and it has been added to your inventory. Please come again!`)
		}
	},
}