

const fs = require("fs")
const { REST, Routes } = require("discord.js")
const config = require("../../config.json")

const commands = []

const commandFolders = fs.readdirSync("./commands", { withFileTypes: true }).filter(folder => folder?.isDirectory() && folder?.name !== "owner")

commandFolders.forEach(folder => {
    
    const commandFiles = fs.readdirSync(`./commands/${folder.name}`).filter(file => file.endsWith(".js"))
    commandFiles.forEach(file => {
        try{
            const command = require(`..//..//commands/${folder.name}/${file}`)
            commands.push(command.data.toJSON())
        }
        catch (e) {
            console.warn(`File ${file} could not be initialised. Continuing...`)
            console.error(e.stack)
        }
    })
})

const rest = new REST({ version: "10" }).setToken(config.discord.token);

(async () => {
	try {
		await rest.put(
			Routes.applicationGuildCommands("803399539557400657", "358708716599508993"),
			{ body: commands },
		)

		console.log("Successfully registered application commands.")
	} catch (error) {
		console.error(error)
	}
})()