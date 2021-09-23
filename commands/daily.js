const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Use to claim some free credits every 24 hours'),
    async execute(interaction) {
        const user = await userRecords.findOne({where: {userID: interaction.user.id}})
        let timeRemainingSecs
        if (user.get('lastdaily') != null){
            timeRemainingSecs = (user.get('lastdaily') + 86400) -  Math.floor(Date.now() / 1000)
        } else {
            timeRemainingSecs = 0
        };
        if (timeRemainingSecs <= 0) {
            let range
            let lucky
            if (Math.random() < 0.05){
                range = [1000, 2500]
                lucky = true
            } else {
                range = [150, 300]
                lucky = false
            }
            const creditAmount = Math.floor(Math.random() * (range[1] - range[0])) + range[0]
            await user.increment('money', {by: creditAmount, where: {userID: interaction.user.id}})
            await user.update({lastdaily: Math.floor(Date.now()/1000)}, {where: {userID: interaction.user.id}})
            if (lucky){
                interaction.reply(`Amazing! Your total handout comes to **${creditAmount}** credits!`)
                return
            }
            interaction.reply(`Your daily handout comes to **${creditAmount}** credits.`)

        } else {
            var hours = Math.floor(timeRemainingSecs / 60 / 60);
            var minutes = Math.floor(timeRemainingSecs / 60) - (hours * 60);
            var seconds = timeRemainingSecs % 60;
            var timeRemainingString = String(hours).padStart(2, "0") + ":" + String(minutes).padStart(2, "0") + ':' + String(seconds).padStart(2, "0")
            interaction.reply(`You've claimed your daily too recently. Time remaining **${timeRemainingString}**`)
        };
    },
};