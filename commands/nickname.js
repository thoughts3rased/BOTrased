const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nickname')
        .setDescription('Change a member\'s nickname.')
        .addUserOption(option =>
            option.setName("target")
                .setDescription("The user who's nickname you want to change.")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("newnickname")
                .setDescription("The nickname you want to give to the user.")
                .setRequired(true)),
    async execute(interaction) {
        //guild members are required to have the "Manage Nicknames" permission in order to use this command
        if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_NICKNAMES)){
            return await interaction.reply("You do not have the appropriate permissions to use this command.")
        };
        if (interaction.options.getString("newnickname").length > 32){
            return await interaction.reply("The nickname you have entered is too long.")
        }
        await interaction.deferReply().then(() => {
            interaction.options.getMember('target').setNickname(interaction.options.getString('newnickname'))
            interaction.editReply("Nickname changed successfully")
        }).catch((e) =>{
            console.log(e)
            interaction.editReply(`There was an error performing that action. Full traceback:\n\`\`\`${e}\`\`\``)
        }).then(() => {
            const newRecord = adminlogRecords.create({serverID: interaction.guild.id, recipientID: interaction.options.getUser('target').id, adminID: interaction.user.id, type: "name", reason: null, time: Math.floor(Date.now() /1000), botUsed: true});
        }).catch((e) =>{
            console.log(e)
            interaction.followUp("There was an issue recording the action in the database.")
        })
    },
};