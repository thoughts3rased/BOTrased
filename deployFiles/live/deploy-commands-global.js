require("../../.pnp.cjs").setup()

const fs = require("fs")
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")
const config = require("../../config.json")

const commands = []

const commandFolders = fs.readdirSync("./commands", { withFileTypes: true }).filter(folder => folder?.isDirectory() && folder?.name !== "owner")

commandFolders.forEach(folder => {
    
    const commandFiles = fs.readdirSync(`./commands/${folder.name}`).filter(file => file.endsWith(".js"))
    commandFiles.forEach(file => {
        try{
            const command = require(`../../commands/${folder.name}/${file}`)
            commands.push(command.data.toJSON())
        }
        catch {
            console.warn(`File ${file} could not be initialised. Continuing...`)
        }
    })
})

const rest = new REST({ version: "9" }).setToken(config.discord.token);

(async () => {
	try {
		await rest.put(
			Routes.applicationCommands("541373621873016866"),
			{ body: commands },
		)

		console.log("Successfully registered application commands.")
	} catch (error) {
		console.error(error)
	}
})()