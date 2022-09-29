async function reportCommandUsage(command){
    	//command usage counting logic 
	if (await global.commandRecords.findOne({where: {command: command.data.name}}) == null){
		//if a record for this command can't be found, create it
		await global.commandRecords.create({command: command.data.name, count: 1})
	} else {
		//otherwise, just increment the existing record
		await global.commandRecords.increment("count", {where: {command: command.data.name}})
	}
}

module.exports = {
    reportCommandUsage
}