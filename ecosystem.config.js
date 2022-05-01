module.exports = {
	apps : [{
		name   : "BOTrased",
		script : "./main.js",
		watch: true
	}],

	deploy: {
		production : {
			"user" : "Thoughts3rased",
			"host" : "localhost",
			"ref" : "origin/main",
			"repo" : "git@github.com/thoughts3rased/BOTrased.git",
			"post-setup" : "yarn install",
			"path" : "."
		}
	}
}
