const Sequelize = require("sequelize")

async function reportError(errorId, errorStack, command = null, commandAuthor = null, commandServer = null){
    await global.errorTable.create({
        errorId: errorId,
        stackTrace: errorStack,
        command: command,
        commandAuthorId: commandAuthor,
        commandServerId: commandServer,
        time: Date.now() / 1000
    })
}

module.exports = {
    reportError
}