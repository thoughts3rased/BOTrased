/**
 * Converts seconds to human readable format (1 hour, 35 minutes, 42 seconds)
 * @param {number} seconds The amount of time to convert
 * @returns {string} The human readable string
 */
const convertSecondsToHoursTimestamp = seconds => {
    var sec_num = parseInt(secs, 10)
    var hours   = Math.floor(sec_num / 3600)
    var minutes = Math.floor(sec_num / 60) % 60
    var seconds = sec_num % 60

    outputString = ""

    if (hours > 0) outputString += `${hours} hour${hours > 1 ? "s" : ""}`
    if (minutes > 0 || hours > 0) outputString += `${outputString.length > 0 ? ", " : ""}${minutes} minute${minutes !== 1 ? "s" : ""}`
    outputString += `${outputString.length > 0 ? ", " : ""}${seconds} second${seconds !== 1 ? "s" : ""}`
    return outputString
}

module.exports = convertSecondsToHoursTimestamp