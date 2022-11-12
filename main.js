const fs = require("fs")
const Sequelize = require("sequelize")
const { Client , Collection, GatewayIntentBits } = require("discord.js")
const io = require("@pm2/io")
const config = require("./config.json")
const { defineTables, syncTables } = require("./sequelizeDef.js")
const { reportError } = require("./helpers/reportError")
const { reportCommandUsage } = require("./helpers/reportCommandUsage.js")
const crypto = require("crypto")
const { AutoPoster } = require('topgg-autoposter')


const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers]})
global.errorCount = 0

global.maintenanceMode = false

global.sequelize = new Sequelize(config.database.schema , config.database.user, config.database.password, {
	host: config.database.host,
	port: config.database.port,
	dialect: "mysql",
	logging: false
})

io.init({
	transactions: true,
	http: true
})

//defining of PM2 metrics
const commandsServed = io.counter({
	name: "Commands served since last boot",
	unit: " commands"
})
const commandsPerMinute = io.meter({
	name: "Commands served per second",
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
	name: "Messages read per second",
	unit: " messages"
})

let autoPoster

if (config.environment !== "dev") {
	autoPoster = AutoPoster(config.misctokens.topgg, client)
}


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

client.once("ready", async () => {
    
	// Sync sequelize tables
	await syncTables()

	console.info(`Ready. Logged in as ${client.user.username}`)
})

setInterval(async () => {
	pm2ServerCount.set(client.guilds.cache.size)
}, 1000)


client.on("interactionCreate", async interaction => {
	if (!interaction.isChatInputCommand()) return

	await interaction.deferReply()
	.then( async () => {
		const command = await client.commands.get(interaction.commandName)

		if (!command) return
		
		if (maintenanceMode && !config.maintenanceSafeCommands.includes(interaction.commandName)){
			return await interaction.editReply(":warning: Maintenance mode is currently **enabled**, meaning that no commands work at this moment in time.")
		}
	
		if (config.disabledCommands.includes(interaction.commandName)){
			return await interaction.editReply(":x: This command has been disabled. Check the /changelog to see why.")
		}

		await reportCommandUsage(command)

		commandsServed.inc()
		commandsPerMinute.mark()

		await command.execute(interaction)
		.catch( async (error) => {
			const errorId = crypto.randomUUID()

			await reportError(errorId, error.stack, command.data.name, interaction.user.id, interaction.guild.id)
			.then(async (error) => {
				if (config.environment !== "dev") await interaction.editReply(`:x: **BOTrased encountered an unexpected error while fulfilling this request.**\nPlease let the developer, Thoughts3rased#3006 know and quote error code ${errorId}.`)
				else await interaction.editReply(`:x: An unexpected error occurred. Full stack trace: \`\`\`${error}\`\`\``)
				console.error(error)
			})
			.catch(async (error) => {
				console.error(error)
				await interaction.editReply(`:x: **BOTrased encountered an unexpected error while fulfilling this request.**\nAn error report was generated, but failed to save. Please let Thoughts3rased#3006 know this has happened.`)
			})

			global.errorCount++
		})
	})
	.catch((e) => {
		console.error(e)
	})
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
	if (Math.floor(user.get("exp") / 100) > await user.get("level")){
		await user.update({level: Math.floor(await user.get("exp") / 100)}, {where: {userID: message.author.id}})
        
		//if both the user and server's level up message toggles are both enabled, send a level up message. 
		if (server.get("levelUpMessage") == 1 && user.get("levelUpMessage") == 1){
			try {
				await message.channel.send(`Congratulations <@${message.author.id}>, you just levelled up to level ${Math.floor(await user.get("exp") / 100)}!`)
			} catch (error){
				console.error(error)
			}
		}
	}
})

client.on("guildMemberAdd", async member => {
	await global.userRecords.findOrCreate({where: {userID: member.id}, defaults: {userID: member.id}})
	server = await global.serverRecords.findOne({where: {serverID: member.guild.id}})

	if (server.get("lockdownMode") === 1) return await member.kick("Lockdown mode kick")

	if (server.get("autoRoleEnabled") === 1 && server.get("autoRoleId") !== null) {
		await member.roles.add(server.get("autoRoleId"))
		.catch(async e => {
			console.error(e)
		})
	}

	if (server.get("eventLogEnabled") === 1 && server.get("eventLogChannelId") !== null) {
		channel = await client.channels.fetch(server.get("eventLogChannelId"))
			.then(async channel => {
				await channel.send()
			})
	}
})

//Logging errors
client.on("error", async error => {
	console.warn(error?.stack)
})

process.on("SIGTERM", () => {
	client.destroy()
	global.sequelize.close()
	process.exit()
})

client.login(config.discord.token)
