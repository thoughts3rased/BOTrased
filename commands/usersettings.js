const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('usersettings')
        .setDescription('Modify various user settings.')
        .addSubcommand(subcommand =>
            subcommand
                .setName("userlevelupmessage")
                .setDescription("Change whether your level up message appears.")
                .addStringOption(option =>
                    option.setName("state")
                        .setRequired(true)
                        .setDescription("The option for this setting.")
                        .addChoice('on', '1')
                        .addChoice('off', '0')))
        .addSubcommand(subcommand =>
            subcommand
                .setName("profilemessage")
                .setDescription("Set your profile message.")
                .addStringOption(option =>
                    option
                        .setName("newmessage")
                        .setDescription("The new message you want to change your current message to.")
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName("clearprofilemessage")
                .setDescription("Clears your profile message."))
        .addSubcommand(subcommand =>
            subcommand
                .setName("profilecolour")
                .setDescription("Use a hex value to set the colour displayed on your profile.")
                .addStringOption(option =>
                    option
                        .setName("colour")
                        .setDescription("The hex value for the colour you want to set.")
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName("show")
                .setDescription("Shows your current setting configuration.")),
    async execute(interaction) {
        const userRecord = await userRecords.findOne({where: {userID: interaction.user.id}})
        switch(interaction.options.getSubcommand()){
            case "userlevelupmessage":
                const result = {"1": "**ON**", "0": "**OFF**"}
                await userRecord.update({levelUpMessage: interaction.options.getString("state")}, {where: {userID: interaction.user.id}})
                await interaction.reply(`Level up messages are now turned ${result[interaction.options.getString("state")]} for you.`)
                break;
            case "profilemessage":
                await userRecord.update({message: interaction.options.getString("newmessage")}, {where: {userID: interaction.user.id}})
                await interaction.reply(`Your profile message has been set to:\n${interaction.options.getString("newmessage")}`)   
                break;
            case "clearprofilemessage":
                await userRecord.update({message: null}, {where: {userID: interaction.user.id}})
                await interaction.reply("Profile message cleared successfully.")    
                break;
            case "profilecolour":
                const colour = interaction.options.getString("colour").toLowerCase()
                if (colour.length != 6 || !colour.match(/^[0123456789abcdef]+$/g)){
                    await interaction.reply("That is not a valid hex value. Please ensure you remove the # and try again.")
                    return
                }
                await userRecord.update({embedColour: colour}, {where: {userID: interaction.user.id}})
                await interaction.reply("Profile colour successfully updated.")
                break;
            case "show":
                const states = {1: "Enabled", 0: "Disabled"}
                const embed = new MessageEmbed()
                    .setColor("LIGHT_GREY")
                    .setTitle(`${interaction.user.username}'s settings configuration`)
                    .addFields(
                        {name: "Level Up Messages:", value: `${states[userRecord.get('levelUpMessage')]}`},
                        {name: "Profile Colour Hex Value:", value: `#${userRecord.get('embedColour').toUpperCase()}`}
                        
                    )
                if (userRecord.get('message')){
                    embed.addFields(
                        {name: "Profile Message:", value: `${userRecord.get('message')}`}
                    )
                }
                await interaction.reply({embeds: [embed]})
            ;
        }
    },
};