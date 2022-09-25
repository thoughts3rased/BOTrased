const fs = require("fs")
const Sequelize = require("sequelize")
const { Client , Collection, Intents } = require("discord.js")
const io = require("@pm2/io")
const config = require("./config.json")
const { defineTables, syncTables } = require("./sequelizeDef.js")
const { reportError } = require("./helpers/reportError")
const crypto = require("crypto")


const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]})
global.errorCount = 0

global.maintenanceMode = false

global.sequelize = new Sequelize(config.database.schema , config.database.user, config.database.password, {
	host: config.database.host,
	port: config.database.port,
	dialect: "mysql",
	logging: false
})

//defining of PM2 metrics
const commandsServed = io.counter({
	name: "Commands served since last boot",
	unit: "commands"
})
const commandsPerMinute = io.meter({
	name: "Commands served in the last minute",
	unit: " commands"
})
const pm2ServerCount = io.metric({
	name: "Servers joined",
	unit: " servers"
})
const messagesRead = io.counter({
	name: "Messages read since last boot",
	unit: " messages"
})
const messagesPerMinute = io.meter({
	name: "Messages read in the last minute",
	unit: " messages"
})

// Define Sequelize Tables
defineTables()

client.commands = new Collection()

const commandFolders = fs.readdirSync("./commands", { withFileTypes: true }).filter(folder => folder?.isDirectory())

commandFolders.forEach(folder => {
    
    const commandFiles = fs.readdirSync(`./commands/${folder.name}`).filter(file => file.endsWith(".js"))
    commandFiles.forEach(file => {
        try{
            const command = require(`./commands/${folder.name}/${file}`)
            client.commands.set(command.data.name, command)
        }
        catch {
            console.warn(`File ${file} could not be initialised. Continuing...`)
        }
    })
})

client.once("ready", () => {
	//set a presence showing that the bot is booting.
	client.user.setPresence({ activities: [{ name: "Initialising..." }], status: "idle" })
    
	// Sync sequelize tables
	syncTables()

	console.info(`Ready. Logged in as ${client.user.username}`)
    
	//set status showing that the bot has finished booting
	client.user.setPresence({ activities: [{ name: "Ready." }], status: "online" })

	setInterval(() => {
		if (maintenanceMode){
			return
		}
		else{
			//these are the status messages that the bot will randomly pick from and cycle through
			const statusMessages = [
				"Peek at my insides on github!",
				"Now supports slash commands!",
				`Currently serving ${client.guilds.cache.size} servers!`,
				"Bleep-bloop-blop",
				"I have a little brother called TESTrased!",
				"Check the changelog with /changelog!",
				"Have you remembered to use /daily today?",
				"Got any servers you'd like to add me to?",
				"Touching grass",
				"Providing input for your mother",
				"What da dog doin?",
				"Currently schizing",
				"Elden Ring",
				"Participating in a minor amount of social tomfoolery",
				"The whip and nene",
				"Donating to Wikipedia",
				"Pollution Simulator",
				"WageCage Simulator",
				"You can do it when you B&Q it",
				"Currently clubbing seals for XP"
			]
			// generate random number between 1 and list length.
			const randomIndex = Math.floor(Math.random() * (statusMessages.length - 1) + 1)
			client.user.setPresence({activities: [{name: statusMessages[randomIndex]}], status: "online"})
		}
	}, 900000)
})
setInterval(() => {
	pm2ServerCount.set(client.guilds.cache.size)
})


client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) return

	if (maintenanceMode && !config.maintenanceSafeCommands.includes(interaction.commandName)){
		return await interaction.reply(":warning: Maintenance mode is currently **enabled**, meaning that no commands work at this moment in time.")
	}

	const command = client.commands.get(interaction.commandName)

	//command usage counting logic 
	if (await global.commandRecords.findOne({where: {command: command.data.name}}) == null){
		//if a record for this command can't be found, create it
		await global.commandRecords.create({command: command.data.name, count: 1})
	} else {
		//otherwise, just increment the existing record
		await global.commandRecords.increment("count", {where: {command: command.data.name}})
	}
	commandsServed.inc()
	commandsPerMinute.mark()

	if (!command) return

	try{
		await command.execute(interaction)
	} catch (error) {
		if (!interaction.deferred && !interaction.replied){
			await interaction.deferReply()
		}
		const errorId = crypto.randomUUID()
		await reportError(errorId, error.stack, command.data.name, interaction.user.id, interaction.guild.id)
			.then(() => {
				interaction.editReply(`:x: **BOTrased encountered an unexpected error while fulfilling this request.**\nPlease let the developer, Thoughts3rased#3006 know and quote error code ${errorId}.`)
			})
			.catch((error) => {
				console.error(error)
				interaction.editReply(`:x: **BOTrased encountered an unexpected error while fulfilling this request.**\nAn error report was generated, but failed to save. Please let Thoughts3rased#3006 know this has happened.`)
			})
		global.errorCount++
	}
})

client.on("messageCreate", async message => {

	if (maintenanceMode) return
	
	messagesRead.inc(1)
	messagesPerMinute.mark()
	if (message.author.bot){
		return
	}
	//get the message author's profile, and if it can't be found create it
	var [user] = await global.userRecords.findOrCreate({where: {userID: message.author.id}, defaults: {userID: message.author.id}})
	//get the server's entry in the database, and if it can't be found create it
	const [server] = await global.serverRecords.findOrCreate({where: {serverID: message.guild.id}, defaults: {serverID: message.guild.id}})
    
	//calculate credit and exp handout amounts and update their respective records
	const expAmount =  Math.floor(Math.random() * 3)
	const creditAmount = Math.floor(Math.random() * 5)
	await user.increment("exp", {by: expAmount, where: {userID: message.author.id}})
	await user.increment("money", {by: creditAmount, where: {userID: message.author.id}})
    
	//obtain updated record for target user
	user = await global.userRecords.findOne({where: {userID: message.author.id}})
    
	//level up checking logic
	if (Math.floor(user.get("exp") / 100) > user.get("level")){
		await user.update({level: Math.floor(user.get("exp") / 100)}, {where: {userID: message.author.id}})
        
		//if both the user and server's level up message toggles are both enabled, send a level up message. 
		if (server.get("levelUpMessage") == 1 && user.get("levelUpMessage") == 1){
			try {
				await message.channel.send(`Congratulations <@${message.author.id}>, you just levelled up to level ${Math.floor(user.get("exp") / 100)}!`)
			} catch (error){
				console.error(error)
			}
		}
	}
})

client.login(config.discord.token)
