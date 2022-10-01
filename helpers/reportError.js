/**
 * Writes an error report to the database
 * @param {string} errorId The error's ID
 * @param {string} errorStack The stack trace for the error
 * @param {string} command The command in which the error occurred
 * @param {string} commandAuthor The user who invoked the command
 * @param {string} commandServer The server where the command was invoked
 */
async function reportError(errorId, errorStack, command = null, commandAuthor = null, commandServer = null){
    await global.errorTable.create({
        errorId: errorId,
        stackTrace: errorStack,
        command: command,
        commandAuthorId: commandAuthor,
        commandServerId: commandServer,
        time: Date.now() / 1000
    })

    return errorStack
}

module.exports = {
    reportError
}