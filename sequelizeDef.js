const Sequelize = require("sequelize")

function defineTables(){
    global.userRecords = global.sequelize.define("users", {
        userID: {
            type: Sequelize.CHAR(18),
            primaryKey: true,
            allowNull: false
        },
        exp: {
            type: Sequelize.BIGINT.UNSIGNED,
            defaultValue: 0
        },
        level: {
            type: Sequelize.BIGINT.UNSIGNED,
            defaultValue: 0
        },
        money: {
            type: Sequelize.BIGINT.UNSIGNED,
            defaultValue: 0
        },
        message: {
            type: Sequelize.STRING(144),
            defaultValue: null
        },
        levelUpMessage: {
            type: Sequelize.TINYINT(1),
            defaultValue: 1
        },
        lastdaily: {
            type: Sequelize.BIGINT.UNSIGNED,
            defaultValue: null
        },
        embedColour: {
            type: Sequelize.CHAR(6),
            defaultValue: null
        }
    }, {
        timestamps: false
    })
    
    global.serverRecords = global.sequelize.define("servers", {
        serverID: {
            type: Sequelize.CHAR(19),
            primaryKey: true,
            allowNull: false
        },
        levelUpMessage: {
            type: Sequelize.TINYINT(1),
            defaultValue: 1
        }
    }, {
        timestamps:false
    })
    
    global.adminlogRecords = global.sequelize.define("adminlogs", {
        logID: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        serverID: {
            type: Sequelize.CHAR(19)
        },
        recipientID: {
            type: Sequelize.CHAR(18)
        },
        adminID: {
            type: Sequelize.CHAR(18)
        },
        type: {
            type: Sequelize.STRING(15),
            isIn: [["warn", "ban", "kick", "clear", "name"]],
            allowNull: false
        },
        reason: {
            type: Sequelize.STRING(240),
            defaultValue: null
        },
        time: {
            type: Sequelize.BIGINT
        },
        botUsed: {
            type: Sequelize.TINYINT(1)
        }
    
    }, {
        timestamps: false
    })
    
    global.inventoryRecords = global.sequelize.define("inventory", {
        userID: {
            type: Sequelize.CHAR(18),
            allowNull: false,
            primaryKey: true
        },
        itemID: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        showOnProfile: {
            type: Sequelize.TINYINT(1),
            allowNull: false,
            defaultValue: 0
        }
    }, {
        timestamps: false,
        freezeTableName: true
    })
    
    global.itemRecords = global.sequelize.define("items", {
        itemID: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        type: {
            type: Sequelize.STRING(45)
        },
        name: {
            type: Sequelize.STRING(45)
        },
        emojiString: {
            type: Sequelize.STRING(80)
        },
        price: {
            type: Sequelize.INTEGER
        },
        description: {
            type: Sequelize.STRING(240)
        },
        purchasable: {
            type: Sequelize.TINYINT(1),
            defaultValue: 1
        }
    }, {
        timestamps: false
    })
    
    global.commandRecords = global.sequelize.define("commandusages", {
        command: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true
        },
        count: {
            type: Sequelize.BIGINT.UNSIGNED,
            defaultValue: 0
        }
    }, {
        timestamps: false
    })

    global.errorTable = global.sequelize.define("errors", {
        errorId: {
            type: Sequelize.STRING(36),
            allowNull: false,
            primaryKey: true
        },
        stackTrace: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        command: {
            type: Sequelize.STRING(45),
            allowNull: true
        },
        commandAuthorId: {
            type: Sequelize.STRING(18),
            allowNull: true
        },
        commandServerId: {
            type: Sequelize.STRING(19),
            allowNull: true
        },
        time: {
            type: Sequelize.BIGINT,
            allowNull: false
        }
    }, {
        timestamps: false,
        freezeTableName: true
    })
    
    //Setting up DB table relations
    global.userRecords.hasMany(global.inventoryRecords, {foreignKey: "userID"})
    global.inventoryRecords.belongsTo(global.userRecords, {foreignKey: "userID"})
    global.inventoryRecords.belongsTo(global.itemRecords, {foreignKey: "itemID"})
    global.itemRecords.hasOne(global.inventoryRecords, {foreignKey: "itemID"})
}

function syncTables(){
    // Sync and initialise all table models
	global.userRecords.sync()
	global.serverRecords.sync()
	global.adminlogRecords.sync()
	global.inventoryRecords.sync()
	global.itemRecords.sync()
	global.commandRecords.sync()
    global.errorTable.sync()
}

module.exports = {
    defineTables,
    syncTables
}