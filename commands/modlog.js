const { SlashCommandBuilder } = require('@discordjs/builders');

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
        //This may take a while to generate the modlog, so we need to defer the reply to give us 15 minutes to generate our response
        await interaction.deferReply();

        //I don't like how I've had to do this, fix later and make it cleaner
        //If the user doesn't specify an action we want to pull all modlog entries for that server.
        //It's crucial that we do not allow modlogs for other servers to be viewed, even if the user is an administrator in the other server.
        if (!interaction.options.getString("actiontype")){
            const modLogData = await adminlogRecords.findAll({order: [["logID", "DESC"]], where: {serverID: interaction.guild.id}})
        } else {
            const modLogData = await adminlogRecords.findAll({order: [["logID", "ESC"]], where: {serverID: interaction.guild.id, type: interaction.options.getString("actiontype")}})
        }
        //Process the result from the database into an array of dictionaries
        const processedModLogData = modLogData.map(result => result.dataValues)

        //Used to store the modlog data, in arrays of 10
        let modlogDataChunks = []
        
        //Split the modlog data into chunks of 10
        for (var i = 0; i < Math.ceil(processedModLogData.length / 10); i++){
            modlogDataChunks.push(processedModLogData.slice((i * 10), ((i + 1) * 10)))
        }

        
    },
};