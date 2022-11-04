/**
 * Converts seconds to human readable format (2 weeks, 4 days, 1 hour, 35 minutes, 42 seconds)
 * @param {number} secs The amount of time to convert
 * @returns {string} The human readable string
 */
const convertSecondsToHoursTimestamp = secs => {
    var sec_num = parseInt(secs, 10)
    var weeks = Math.floor(sec_num / 604800)
    var days = Math.floor(sec_num / 86400) % 7
    var hours   = Math.floor(sec_num / 3600) % 24
    var minutes = Math.floor(sec_num / 60) % 60
    var seconds = sec_num % 60

    outputString = ""

    if (weeks > 0) outputString += `${weeks} week${weeks > 1 ? "s" : ""}`
    if (days > 0) outputString += `${outputString.length > 0 && ','} ${days} day${days > 1 ? "s" : ""}`
    if (hours > 0) outputString += `${outputString.length > 0 && ','} ${hours} hour${hours > 1 ? "s" : ""}`
    if (minutes > 0 || hours > 0) outputString += `${outputString.length > 0 ? ", " : ""}${minutes} minute${minutes !== 1 ? "s" : ""}`
    outputString += `${outputString.length > 0 ? ", " : ""}${seconds} second${seconds !== 1 ? "s" : ""}`
    return outputString
}

module.exports = convertSecondsToHoursTimestamp