const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Use to claim some free credits every 24 hours'),
    async execute(interaction) {
        const user = await userRecords.findOne({where: {userID: interaction.user.id}})
        let timeRemainingSecs
        
        if (user.get('lastdaily') != null){ //if a user has claimed a daily before
            //calculate the amount of seconds until their next daily handout
            timeRemainingSecs = (user.get('lastdaily') + 86400) -  Math.floor(Date.now() / 1000)
        } else {
            //otherwise, they've never claimed a daily before and we can just set the amount of seconds remaining to zero
            timeRemainingSecs = 0
        };
        
        if (timeRemainingSecs <= 0) { //is the amount of seconds left before the next daily handout less than or equal to 0?
            let range
            let lucky
            //daily handouts can have two types, lucky and non-lucky. These significantly change the amount of credits that are handed out.
            //lucky handouts should have about a 0.5% chance of happening
            if (Math.random() < 0.05){
                range = [1000, 2500]
                lucky = true
            } else {
                range = [150, 300]
                lucky = false
            }
            
            //random generation of daily handouts
            const creditAmount = Math.floor(Math.random() * (range[1] - range[0])) + range[0]
            
            //increment the user's money count with the handout
            await user.increment('money', {by: creditAmount, where: {userID: interaction.user.id}})
            
            //update the user's last daily to the current epoch timestamp
            await user.update({lastdaily: Math.floor(Date.now()/1000)}, {where: {userID: interaction.user.id}})
            
            if (lucky){ //special message for a lucky handout
                interaction.reply(`Amazing! Your total handout comes to **${creditAmount}** credits!`)
                return
            }
            interaction.reply(`Your daily handout comes to **${creditAmount}** credits.`)

        } else { //if the amount of remaining seconds isn't zero, the user isn't entitled to a daily handout and we should reply with a timestamp of their next handout.
            const nextDailyEpochStamp = Math.floor(Date.now() /1000) + timeRemainingSecs
            interaction.reply(`You've claimed your daily too recently. Next handout at: **<t:${nextDailyEpochStamp}>**`)
        };
    },
};