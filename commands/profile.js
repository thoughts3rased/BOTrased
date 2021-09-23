const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Check your user profile.')
        .addUserOption(option =>
            option.setName('target')
            .setDescription('User who\'s profile you want to view.')
            .setRequired(false)),
    async execute(interaction) {
        let targetID
        let targetAvatar
        let targetName
        if (interaction.options.getUser('target') == null){
            targetID = interaction.user.id
            targetAvatar = interaction.user.displayAvatarURL()
            targetName = interaction.user.username
        } else {
            targetID = interaction.options.getUser('target').id
            targetAvatar = interaction.options.getUser('target').displayAvatarURL()
            targetName = interaction.options.getUser('target').username
        }
        const targetUser = await userRecords.findOne({where: {userID: targetID}})
        if (targetUser == null){
            interaction.reply("This user does not have a profile.")
            return
        }
        const targetUserBadgeInventory = await inventoryRecords.findAll({where: {userID: targetID, showOnProfile: 1}})
        let badgeString = ''
        for (let i = 0; i < targetUserBadgeInventory.length; i++) {
            badge = await itemRecords.findOne({where: {itemID: targetUserBadgeInventory[i].get("itemID")}})
            badgeString += badge.get("emojiString")
        };
        let profileColour
        if (targetUser.get('embedColour') == null) {
            if (targetUser.get('level') < 100){
                profileColour = 'LIGHT_GREY'
            } else if (targetUser.get('level') < 200){
                profileColour = [166,121,18]
            } else if (targetUser.get('level') < 400){
                profileColour = [104, 105, 104]
            } else {
                profileColour = [221, 224, 0]
            };
        } else {
            profileColour = `#${targetUser.get('embedColour')}`
        }
        const embed = new MessageEmbed()
            .setColor(profileColour)
            .setTitle(`${targetName}'s profile`)
            .addFields(
                {name: "Experience:", value: `${targetUser.get('exp')}`},
                {name: "Level:", value: `Level ${targetUser.get('level')}`},
                {name: "Credits:", value: `${targetUser.get('money')} credits`}
            )
            .setThumbnail(`${targetAvatar}`)
        if (targetUser.get('message') != null){
            embed.setDescription(`${targetUser.get('message')}`)
        };
        let timeRemainingSecs
        if (targetUser.get('lastdaily') != null){
            timeRemainingSecs = (targetUser.get('lastdaily') + 86400) -  Math.floor(Date.now() / 1000)
        } else {
            timeRemainingSecs = 0
        };
        if (timeRemainingSecs <= 0) {
            embed.addFields({name: "Daily Reset Timer:", value: "Daily is available!"})
        } else {
            var hours = Math.floor(timeRemainingSecs / 60 / 60);
            var minutes = Math.floor(timeRemainingSecs / 60) - (hours * 60);
            var seconds = timeRemainingSecs % 60;
            var timeRemainingString = String(hours).padStart(2, "0") + ":" + String(minutes).padStart(2, "0") + ':' + String(seconds).padStart(2, "0")
            embed.addFields({name: "Daily Reset Timer:", value: `${timeRemainingString} remaining`})
        };
        if (badgeString != ''){
            embed.addFields({
                name: badgeString, value: "​"
            })
        };
        await interaction.reply({embeds: [embed]});
    },
};
