fs = require "fs"
os = require "os"
fspath = require "path"
{spawn} = require "child_process"

uuid = require "uuid"
_ = require "lodash"

HGCommandServer = require "./HGCommandServer"

class HGRepo
	###
	Create a new repo in a random temp directory.  Useful for no-repo commands like init and clone
	that require a repo
	###
	@MakeTempRepo: (done) ->
		tmpDir = fspath.join(os.tmpDir(), uuid.v1())

		fs.mkdir tmpDir, (err) ->
			done err if err

			initProcess = spawn "hg", ["init"],
				cwd: tmpDir

			initProcess.on "exit", (code) ->
				unless code == 0
					err = new Error "Non zero status code returned when creating temporary repo: " + code
					return done err

				done null, new HGRepo(tmpDir)

	###
	Create a new HGRepo with a rootpath defined by the passed in `@path` (defaults to `process.cwd()`)
	###
	constructor: (@path = process.cwd()) ->

	###
	Initialize a new repository at the provided path.  Due to limitations of the cmdserver,
	this must be run from an existing repo.
	###
	init: (initPath, done) ->
		serverCmd = (server) ->
			server.runcommand "init", initPath

		@_runCommandGetOutput @path, serverCmd, done

	###
	Add files to a repository.
	###
	add: (paths, done) ->
		@runCommand "add", paths, done

	###
	Commit changes to a repository
	###
	commit: (paths, opts, done) ->
		if _.isFunction paths
			done = paths
			paths = []
		else if _.isFunction opts
			done = opts
			if _.isObject paths
				opts = paths
				paths = []
		@runCommand ["commit"].concat(paths), opts, done

	###
	Clone a repository.  Due to limitations of the cmdserver, this must be run from an
	existing location.
	###
	clone: (from, to, opts, done) ->
		@runCommand ["clone", from, to], opts, done

	###
	Get a summary of the current repository path.
	###
	summary: (opts, done) ->
		@runCommand "summary", opts, done

	###
	Get a log of commits for this repository.

	`opts` is optional and can be either an object or array of arguments.
	###
	log: (opts, done) ->
		@runCommand "log", opts, done

	###
	Pull changes from another repository.
	###
	pull: (from, opts, done) ->
		@runCommand ["pull", from], opts, done

	###
	Update to the latest changes in a repository.
	###
	update: (opts, done) ->
		@runCommand "update", opts, done

	###
	Push changes to another repository
	###
	push: (to, opts, done) ->
		@runCommand ["push", to], opts, done

	###
	Merge changes from another repository
	###
	merge: (opts, done) ->
		@runCommand "merge", opts, done

	###
	Resolve conflicts in a repository.
	###
	resolve: (opts, done) ->
		@runCommand "resolve", opts, done

	###
	Create tags in repo.
	###
	tag: (tagname, opts, done) ->
		@runCommand ["tag", tagname], opts, done

	###
	Retrieve repo tags.
	###
	tags: (opts, done) ->
		@runCommand "tags", opts, done

	###
	Repo status.
	###
	status: (opts, done) ->
		@runCommand "status", opts, done

	###
	Repo branches.
	###
	branches: (opts, done) ->
		@runCommand "branches", opts, done

	###
	Repo heads list
	###
	heads: (opts, done) ->
		@runCommand "heads", opts, done

	###
	Diff
	###
	diff: (opts, done) ->
		@runCommand "diff", opts, done

	###
	Version of hg process
	###
	version: (done) ->
		@runCommand "version", done

	###
	Remove files from a repository.
	###
	remove: (paths, done) ->
		@runCommand "remove", paths, done

	###
	Execute server command

	@param arg [String, Array] command to execute.
	@param opts [Object, Array, String, Function] optional arguments to append
	       to command args. If opts is a function it is treated as the callback function.
	@param done [Function] callback when command completes
	###
	runCommand: (args, opts, done) ->
		if _.isFunction opts
			done = opts
			opts = []

		if _.isString args
			args = [args]

		args = args.concat(@_parseOptions(opts))

		serverCmd = (server) ->
			server.runcommand.apply server, args

		@_runCommandGetOutput @path, serverCmd, done

	###
	Parse an object into an array of command line arguments
	###
	_parseOptions: (opts) ->
		# Convert an object to an array of opts
		if _.isArray opts
			return opts
		if _.isString opts
			return [opts]

		newOpts = []
		currKey = ""
		pushVal = (v) ->
			newOpts.push currKey
			newOpts.push v if v

		for own key, val of opts
			currKey = key
			if _.isArray val
				# Push an array of values
				_.each val, pushVal
			else
				# Push a single value
				pushVal val

		newOpts

	###
	Start a command server and return it for use
	###
	_startServer: (path, done) ->
		server = new HGCommandServer()
		server.start path, (err) ->
			return done err if err

			done null, server

	###
	Convenience wrapper for starting a command server and executing a command
	###
	_runCommandGetOutput: (path, serverAction, done) ->
		@_startServer path, (err, server) ->
			return done err if err

			cleanUp = ->
				server.removeAllListeners "output"
				server.removeAllListeners "error"

			allOutput = []

			server.on "output", (body, lines) ->
				allOutput = allOutput.concat lines

			server.on "error", (err, line) ->
				# Skip warnings, store as output
				# TODO: Allow this to be configured
				if line?.body?.slice(0, 7) == "warning"
					return allOutput.push line

				cleanUp()
				done err

			server.once "result", (body, lines) ->
				allOutput = allOutput.concat lines if lines.length > 0

				server.stop()

			server.once "exit", (code) ->
				cleanUp()

				done null, allOutput, server

			serverAction server

module.exports = HGRepo
