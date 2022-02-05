const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageButton } = require('discord.js');
const pagingationEmbed = require('discordjs-button-pagination')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Commands relating to all shop-related activities')
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
                await interaction.deferReply()
                let shopDataArray = []
                const shopData = await itemRecords.findAll(
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
                console.log(shopDataArray)
                var pages = []
                for(var i = 0; i < shopDataArray.length; i++){
                    var embed = new MessageEmbed()
                        .setTitle("BOTrased's Shop")
                        .setDescription("Browse through my wares and use /buy [item id] when you're done")
                    for(var j = 0; j < 5; j++){
                        var currentIndex = (i * 5) + (j)
                        console.log(shopDataArray[currentIndex])
                        if (!shopDataArray[currentIndex]){
                            break;
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
                buttonList = [
                    new MessageButton()
                        .setCustomId('previousbtn')
                        .setLabel('Previous Page')
                        .setStyle('DANGER'),
                    new MessageButton()
                        .setCustomId('nextbtn')
                        .setLabel('Next Page')
                        .setStyle('SUCCESS')
                ]
                pagingationEmbed(interaction, pages, buttonList)
                break;
            case "buy":
        }
    },
};