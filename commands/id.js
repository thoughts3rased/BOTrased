const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('id')
        .setDescription('Returns the ID of a specified user, or yours if none are specified.')
        .addUserOption(option => 
            option.setName('target')
            .setDescription('The target user.')    
            .setRequired(false)),
    async execute(interaction) {
        if (interaction.options.getMember('target') != null && interaction.options.getMember('target').id != interaction.user.id){
            await interaction.reply(`<@${interaction.options.getMember("target").id}>'s user ID is ${interaction.options.getMember("target").id}.`)
        } else{
            await interaction.reply(`Your user ID is ${interaction.user.id}.`)
        }
        ;
    },
};