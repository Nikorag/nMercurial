class Parsers

    ###
    Parse command output as raw text content.

        repo.branches (err, out) ->
           console.log Parsers.text(out)
    ###
    @text: (out) ->
      (o.body for o in out when o.channel is 'o').join('')

    ###
    Parse command output as json content. This is useful when JSON template
    is passed as an option to the command (i.e. `-Tjson`).

        repo.branches {"--template":"json"}, (err, out) ->
            branches = Parsers.json out
            branches.forEach (b) ->
               console.log "#{b.branch} #{b.active}"
    ###
    @json: (out) ->
      JSON.parse(Parsers.text out)

    ###
    Parse version from `version` command. Returns a string version number.
    ###
    @version: (out) ->
        versionRegEx = new RegExp ".*version (.*)\\)"
        version = versionRegEx.exec out[0].body

        unless version
            throw new Error "Unable to parse version data"

        version[1]

    constructor: (@hgversion) ->

    ###
    Parse `tags` command text response. Returns an object with tag names as
    object keys. Key value is a 2 element array of revision number and revision
    hash.

        tags = {"<tag name>":["<rev number>":"<hash>"]}
    ###
    tags: (out) ->
        rest = out
        tags = {}
        while rest[0].channel != 'r'
            [namerec, verrec, nl, rest...] = rest
            name = namerec.body
            [lver, hver] = verrec.body.split ":"
            tags[name] = [lver.trim(), hver.trim()]

        tags

    ###
    Parse `status` command text response. Returns an object with file names as
    object keys. Key value is the status id.

        status = {"<file name>":"<status>"}
    ###
    status: (out) ->
        rest = out
        states = {}
        while rest[0].channel != 'r'
            [staterec, filerec, rest...] = rest
            state = staterec.body.trim()
            file = filerec.body.trim()
            states[file] = state

        states

module.exports = Parsers
