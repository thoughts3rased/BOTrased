const fs = require('fs');
const Sequelize = require('sequelize')
const { Client , Collection, Intents, Permissions } = require("discord.js");
const io = require('@pm2/io')


const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});
global.errorCount = 0

global.sequelize = new Sequelize(process.env.DATABASE_SCHEMA, 'BOTrased', process.env.DATABASE_PASSWORD, {
    host: 'maccraft.serveminecraft.net',
    port: 1273,
    dialect: "mysql",
    logging: false
});

//defining of PM2 metrics
const commandsServed = io.counter({
    name: "Commands served since last boot",
    unit: "commands"
})
const commandsPerMinute = io.meter({
    name: "Commands served in the last minute",
    unit: "commands"
})
const pm2ServerCount = io.metric({
    name: "Servers joined",
    unit: "servers"
})
const messagesRead = io.metric({
    name: "Messages read since last boot",
    unit: "messages"
})
const messagesPerMinute = io.meter({
    name: "Messages read in the last minute",
    unit: "messages"
})

global.userRecords = sequelize.define('users', {
    userID: {
        type: Sequelize.CHAR(18),
        primaryKey: true,
        allowNull: false
    },
    exp: {
        type: Sequelize.BIGINT.UNSIGNED,
        defaultValue: 0
    },
    level: {
        type: Sequelize.BIGINT.UNSIGNED,
        defaultValue: 0
    },
    money: {
        type: Sequelize.BIGINT.UNSIGNED,
        defaultValue: 0
    },
    message: {
        type: Sequelize.STRING(144),
        defaultValue: null
    },
    levelUpMessage: {
        type: Sequelize.TINYINT(1),
        defaultValue: 1
    },
    lastdaily: {
        type: Sequelize.BIGINT.UNSIGNED,
        defaultValue: null
    },
    embedColour: {
        type: Sequelize.CHAR(6),
        defaultValue: null
    }
}, {
    timestamps: false
})

global.serverRecords = sequelize.define('servers', {
    serverID: {
        type: Sequelize.CHAR(18),
        primaryKey: true,
        allowNull: false
    },
    levelUpMessage: {
        type: Sequelize.TINYINT(1),
        defaultValue: 1
    }
}, {
    timestamps:false
})

global.adminlogRecords = sequelize.define('adminlogs', {
    logID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    serverID: {
        type: Sequelize.CHAR(18)
    },
    recipientID: {
        type: Sequelize.CHAR(18)
    },
    adminID: {
        type: Sequelize.CHAR(18)
    },
    type: {
        type: Sequelize.STRING(15),
        isIn: [['warn', 'ban', 'kick', 'clear', 'name']],
        allowNull: false
    },
    reason: {
        type: Sequelize.STRING(240),
        defaultValue: null
    },
    time: {
        type: Sequelize.BIGINT
    },
    botUsed: {
        type: Sequelize.TINYINT(1)
    }

}, {
    timestamps: false
})

global.inventoryRecords = sequelize.define('inventory', {
    userID: {
        type: Sequelize.CHAR(18),
        allowNull: false,
        primaryKey: true
    },
    itemID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    showOnProfile: {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        defaultValue: 0
    }
}, {
    timestamps: false,
    freezeTableName: true
})

global.itemRecords = sequelize.define('items', {
    itemID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
        type: Sequelize.STRING(45)
    },
    name: {
        type: Sequelize.STRING(45)
    },
    emojiString: {
        type: Sequelize.STRING(80)
    },
    price: {
        type: Sequelize.INTEGER
    },
    description: {
        type: Sequelize.STRING(240)
    },
    purchasable: {
        type: Sequelize.TINYINT(1),
        defaultValue: 1
    }
}, {
    timestamps: false
})

global.commandRecords = sequelize.define('commandusage', {
    command: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    count: {
        type: Sequelize.BIGINT.UNSIGNED,
        defaultValue: 0
    }
}, {
    timestamps: false
})

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

client.once('ready', () => {
    //set a presence showing that the bot is booting.
    client.user.setPresence({ activities: [{ name: 'Initialising...' }], status: 'idle' });
    
    //sync and initialise all table models
    userRecords.sync()
    console.log("User table synchronised and online.")
    serverRecords.sync()
    console.log("Server table synchronised and online.")
    adminlogRecords.sync()
    console.log("Admin Log table synced and online.")
    inventoryRecords.sync()
    console.log("Inventory table synced and online.")
    itemRecords.sync()
    console.log("Item table synced and online.")
    commandRecords.sync()
    console.log("Command Usage table synced and online.")
    console.log(`Ready. Logged in as ${client.user.username}`)
    
    //set status showing that the bot has finished booting
    client.user.setPresence({ activities: [{ name: 'Ready.' }], status: 'online' });

    setInterval(() => {
        //these are the status messages that the bot will randomly pick from and cycle through
        const statusMessages = [
            "Now in JavaScript!",
            "Living to fight another day.",
            "Prefixes be gone!",
            "Peek at my insides on github!",
            "Now supports slash commands!",
            `Currently serving ${client.guilds.cache.size} servers!`,
            "No help command required.",
            "Bleep-bloop-blop",
            "I have a little brother called TESTrased!",
            "Check the changelog with /changelog!",
            "Have you remembered to use /daily today?",
            "Got any servers you'd like to add me to?"
        ]
        // generate random number between 1 and list length.
        const randomIndex = Math.floor(Math.random() * (statusMessages.length - 1) + 1);
        client.user.setPresence({activities: [{name: statusMessages[randomIndex]}], status: 'online'});
      }, 120000);
    });
    setInterval(() => {
        pm2ServerCount.set(client.guilds.cache.size)
    })


client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    //command usage counting logic 
    if (await commandRecords.findOne({where: {command: command.data.name}}) == null){
        //if a record for this command can't be found, create it
        await commandRecords.create({command: command.data.name, count: 1})
    } else {
        //otherwise, just increment the existing record
        await commandRecords.increment('count', {where: {command: command.data.name}})
    };
    commandsServed.inc()
    commandsPerMinute.mark()

    if (!command) return;

    try{
        await command.execute(interaction);
    } catch (error) {
        await interaction.reply(`**Oh no! BOTrased encountered an unexpected error!**\nFull traceback: \`\`\`${error.stack}\`\`\`\nYou should send this to the developer, Thoughts3rased. \n(hint: if you can, use /info to get a link to the support server)`);
        errorCount++
    }
})

client.on('messageCreate', async message => {
    messagesRead.inc()
    messagesPerMinute.mark()
    if (message.author.bot){
        return
    };
    //get the message author's profile, and if it can't be found create it
    var [user, created] = await userRecords.findOrCreate({where: {userID: message.author.id}, defaults: {userID: message.author.id}})
    //get the server's entry in the database, and if it can't be found create it
    const [server, recordCreated] = await serverRecords.findOrCreate({where: {serverID: message.guild.id}, defaults: {serverID: message.guild.id}})
    
    //calculate credit and exp handout amounts and update their respective records
    const expAmount =  Math.floor(Math.random() * 3)
    const creditAmount = Math.floor(Math.random() * 5)
    await user.increment('exp', {by: expAmount, where: {userID: message.author.id}})
    await user.increment('money', {by: creditAmount, where: {userID: message.author.id}})
    
    //obtain updated record for target user
    user = await userRecords.findOne({where: {userID: message.author.id}})
    
    //level up checking logic
    if (Math.floor(user.get('exp') / 100) > user.get('level')){
        await user.update({level: Math.floor(user.get('exp') / 100)}, {where: {userID: message.author.id}})
        
        //if both the user and server's level up message toggles are both enabled, send a level up message. 
        if (server.get('levelUpMessage') == 1 && user.get('levelUpMessage') == 1){
            try {
                await message.channel.send(`Congratulations <@${message.author.id}>, you just levelled up to level ${Math.floor(user.get('exp') / 100)}!`)
            } catch (error){
                console.log(error)
            }
        }
    }
})

client.login(process.env.TOKEN);