

const fs = require("fs")
const { REST, Routes } = require("discord.js")
const config = require("../../config.json")

const commands = []

const commandFiles = fs.readdirSync("./commands/owner").filter(file => file.endsWith(".js"))

for (const file of commandFiles) {
	const command = require(`../../commands/owner/${file}`)
	try{
		commands.push(command.data.toJSON())
	}
	catch(e){
		console.warn(`Error deploying command at file: ./commands/owner/${file}`)
		console.error(e)
	}
}

const rest = new REST({ version: "10" }).setToken(config.discord.token);

(async () => {
	try {
		await rest.put(
			Routes.applicationGuildCommands("803399539557400657", config.discord.ownerGuildId),
			{ body: commands },
		)

		console.log("Successfully registered owner commands.")
	} catch (error) {
		console.error(error) 
	}
})()