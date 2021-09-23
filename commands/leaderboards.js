const { SlashCommandBuilder} = require('@discordjs/builders');
const { MessageEmbed, MessageButton} = require('discord.js');
const paginationEmbed = require('discordjs-button-pagination');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Check BOTrased\'s leaderboards.')
        .addStringOption(option =>
            option.setName("category")
                .setRequired(true)
                .setDescription("The leaderboard you want to view.")
                .addChoice('credits', 'money')
                .addChoice('experience', 'exp')),
    async execute(interaction) {
        await interaction.deferReply()
        const leaderboardDataResult = await userRecords.findAll({order: [[interaction.options.getString('category'), 'DESC']]}, {limit: 100}).then((leaderboardData) => {return leaderboardData});
        const leaderboardData = leaderboardDataResult.map(result => result.dataValues)
        var leaderboardStringData = []
        var leaderboardPageChunks = []
        var pages = []
        const titleDict = {'money': 'credits', 'exp': 'experience'}
        for (var i = 0; i < leaderboardData.length - 1 && i < 100; i++){
            let currentUser = await interaction.client.users.fetch(leaderboardData[i]['userID'])
            leaderboardStringData.push(`${i+1}. ${currentUser.username}#${currentUser.discriminator} - ${leaderboardData[i][interaction.options.getString('category')]}`)
        }
        for (var i = 0; i < Math.ceil(leaderboardStringData.length / 10); i++){
            leaderboardPageChunks.push(leaderboardStringData.slice((i * 10), ((i + 1) * 10)))
        }
        for (var i=0; i < leaderboardPageChunks.length; i++){
            embed = new MessageEmbed()
                .setTitle(`Top ${leaderboardStringData.length} users by amount of ${titleDict[interaction.options.getString('category')]}`)
                .setDescription(`${leaderboardPageChunks[i].join("\n")}`)
            pages.push(embed)
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