const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageButton, Permissions } = require('discord.js');
const paginationEmbed = require('discordjs-button-pagination');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('modlog')
        .setDescription('Check the log of all the actions performed with BOTrased')
        .addStringOption(option => 
            option.setName("actiontype")
                .setRequired(false)
                .setDescription("Search for a specific type of action in the modlog.")
                .addChoice("ban", "ban")
                .addChoice("kick", "kick")
                .addChoice("nickname change", "name")
                .addChoice("channel message clear", "clear")
                .addChoice("warn", "warn")),
    async execute(interaction) {
        //Check to see if the user has the appropriate permissions for this command
        if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)){
            return await interaction.reply({content: "You do not have the appropriate permission to use that command.", ephemeral: true})
        };
        
        //This may take a while to generate the modlog, so we need to defer the reply to give us 15 minutes to generate our response
        await interaction.deferReply();

        //I don't like how I've had to do this, fix later and make it cleaner
        //If the user doesn't specify an action we want to pull all modlog entries for that server.
        //It's crucial that we do not allow modlogs for other servers to be viewed, even if the user is an administrator in the other server.
        let modLogData
        if (!interaction.options.getString("actiontype")){
            modLogData = await adminlogRecords.findAll({order: [["logID", "DESC"]], where: {serverID: interaction.guild.id}})
        } else {
            modLogData = await adminlogRecords.findAll({order: [["logID", "DESC"]], where: {serverID: interaction.guild.id, type: interaction.options.getString("actiontype")}})
        }

        //Process the result from the database into an array of dictionaries
        const processedModLogData = modLogData.map(result => result.dataValues)

        if (processedModLogData.length === 0){
            return await interaction.editReply(":x: There are no records for your server with the specified filters.")
        }

        //Used to store the modlog data, in arrays of 10
        let modlogDataChunks = []
        
        //Split the modlog data into chunks of 10
        for (var i = 0; i < Math.ceil(processedModLogData.length / 10); i++){
            modlogDataChunks.push(processedModLogData.slice((i * 10), ((i + 1) * 10)))
        }

        //This will be used to store the embed pages that we'll pass through to the pagination module
        let pages = []

        //Since I use the choice values to specify the type in the SQL statement, I need to convert them into proper strings here for the description if a user searches for a specific type of action and for display in each field
        const searchTypeDict = {
            "ban": "User Ban",
            "kick": "User Kick",
            "name": "Nickname Change",
            "clear": "Message Bulk Delete",
            "warn": "User Warn"
        }

        for (var i = 0; i < modlogDataChunks.length; i++){
            currentPage = new MessageEmbed()
                .setTitle(`Administrator log for ${interaction.guild.name}`)
            if (interaction.options.getString("actiontype")) {
                currentPage.setDescription(`You searched for: ${searchTypeDict[interaction.options.getString("actiontype")]}`)
            }
            //embed page generation
            for (var j = 0; j < modlogDataChunks[i].length; j++){
                //fetch the administrator that issued the action
                let currentAdministrator = await interaction.client.users.fetch(modlogDataChunks[i][j]['adminID'])
                
                //Initialise standard line in all records
                let fieldValueString = `Type - ${searchTypeDict[modlogDataChunks[i][j]["type"]]}\nAdministrator - ${currentAdministrator.username}#${currentAdministrator.discriminator}\n`
                
                //We want the wording to change based on if it is a clear command or not, so we check for this and adjust accordingly
                if (modlogDataChunks[i][j]["type"] == "clear"){
                    try{
                        let currentChannel = await interaction.client.channels.fetch(modlogDataChunks[i][j]['recipientID'])
                        fieldValueString += `Channel - #${currentChannel.name}\nAmount of Messages Cleared - ${modlogDataChunks[i][j]['reason']}\n`
                    } catch {
                        fieldValueString += `Channel - #deleted-channel\nAmount of Messages Cleared - ${modlogDataChunks[i][j]['reason']}\n`
                    }
                } else {
                    let currentRecipient = await interaction.client.users.fetch(modlogDataChunks[i][j]['recipientID'])
                    fieldValueString += `Recipient - ${currentRecipient.username}#${currentRecipient.discriminator}\n`
                    if (modlogDataChunks[i][j]['reason'] !== null){
                        fieldValueString += `Reason - ${modlogDataChunks[i][j]['reason']}\n`
                    }
                }
                fieldValueString += `Time - <t:${modlogDataChunks[i][j]["time"]}>`
                currentPage.addFields(
                    {name: `Case #${modlogDataChunks[i][j]["logID"]}`, value: `${fieldValueString}`}
                )
            }
            pages.push(currentPage)    
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

        paginationEmbed(interaction, pages, buttonList)
    },
};