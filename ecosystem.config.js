module.exports = {
	apps : [{
		name   : "BOTrased",
		script : "./main.js",
		watch: true,
		exec_mode: "cluster"
	}],

	deploy: {
		production : {
			"user" : "Thoughts3rased",
			"host" : "localhost",
			"ref" : "origin/main",
			"repo" : "git@github.com/thoughts3rased/BOTrased.git",
			"post-setup" : "npm ci",
			"path" : "."
		}
	}
}
