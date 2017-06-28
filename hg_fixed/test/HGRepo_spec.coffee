fs = require "fs"
path = require "path"

should = require "should"
uuid = require "uuid"

HGRepo = require "../lib/HGRepo"
Parsers = require "../lib/parsers"

describe "HGRepo", ->

	it "can create a temporary repo", (done) ->
		HGRepo.MakeTempRepo (err, repo) ->
			throw err if err

			should.exist repo

			fs.exists repo.path, (exists) ->
				exists.should.equal true

				done()

	it "can init a new repo", (done) ->
		HGRepo.MakeTempRepo (err, repo) ->
			throw err if err

			newRepoPath = path.resolve path.join(repo.path, "..", uuid.v1())

			repo.init newRepoPath, (err, output) ->
				throw err if err

				should.exist output

				otherRepo = new HGRepo(newRepoPath)

				otherRepo.summary (err, output) ->
					throw err if err

					should.exist output

					done()

	it "can add files to a repo", (done) ->
		HGRepo.MakeTempRepo (err, repo) ->

			fs.writeFile path.join(repo.path, "one.txt"), "Text Content 1", (err) ->
				throw err if err

				fs.writeFile path.join(repo.path, "two.txt"), "Text Content 2", (err) ->
					throw err if err

					repo.add ['.'], (err, output) ->
						throw err if err

						output.length.should.equal 3

						done()

	it "can commit changes to a repo", (done) ->
		HGRepo.MakeTempRepo (err, repo) ->

			fs.writeFile path.join(repo.path, "one.txt"), "Text Content 1", (err) ->
				throw err if err

				fs.writeFile path.join(repo.path, "two.txt"), "Text Content 2", (err) ->
					throw err if err

					repo.add ['.'], (err, output) ->
						throw err if err

						output.length.should.equal 3

						commitOpts =
							"-m": "A Test Commit"

						repo.commit commitOpts, (err, output) ->
							throw err if err

							should.exist output
							output.length.should.equal 1
							output[0].channel.should.equal "r"

							repo.log (err, output) ->
								throw err if err

								output.length.should.be.above 0
								output[0].body.indexOf("A Test Commit").should.be.above -1

								done()

	it "can commit specific files", (done) ->
		HGRepo.MakeTempRepo (err, repo) ->

			fs.writeFile path.join(repo.path, "one.txt"), "Text Content 1", (err) ->
				throw err if err

				repo.add ['.'], (err, output) ->
					throw err if err

					commitOpts = ["-m", "A Test Commit"]

					repo.commit "one.txt", commitOpts, (err, output) ->
						throw err if err

						should.exist output
						output.length.should.equal 1
						output[0].channel.should.equal "r"

						done()

	it "can clone a repo from a local path", (done) ->
		HGRepo.MakeTempRepo (err, repo) ->

			fs.writeFile path.join(repo.path, "one.txt"), "Text Content 1", (err) ->
				throw err if err

				fs.writeFile path.join(repo.path, "two.txt"), "Text Content 2", (err) ->
					throw err if err

					repo.add ['.'], (err, output) ->
						throw err if err

						output.length.should.equal 3

						commitOpts =
							"-m": "A Test Commit"

						repo.commit commitOpts, (err, output) ->
							throw err if err

							should.exist output

							otherPath = path.resolve(path.join(repo.path, "..", uuid.v1()))

							repo.clone repo.path, otherPath, (err, output) ->
								throw err if err

								should.exist output

								otherRepo = new HGRepo(otherPath)

								otherRepo.summary (err, output) ->
									throw err if err

									should.exist output

									done()

	it "can clone a repo from a remote path", (done) ->
		# Set a 5 second timeout for this test (relies on bitbucket connection)
		@timeout 5000

		HGRepo.MakeTempRepo (err, repo) ->

			otherPath = path.resolve(path.join(repo.path, "..", uuid.v1()))

			repo.clone "https://bitbucket.org/jacob4u2/node-hg", otherPath, (err, output) ->
				throw err if err

				should.exist output

				otherRepo = new HGRepo(otherPath)

				otherRepo.summary (err, output) ->
					throw err if err

					should.exist output

					done()

	it "can pull changes from another repo", (done) ->
		HGRepo.MakeTempRepo (err, repo) ->

			otherPath = path.resolve(path.join(repo.path, "..", uuid.v1()))

			repo.clone repo.path, otherPath, (err, output) ->
				throw err if err

				should.exist output

				otherRepo = new HGRepo(otherPath)

				fs.writeFile path.join(repo.path, "one.txt"), "Text Content 1", (err) ->
					throw err if err

					fs.writeFile path.join(repo.path, "two.txt"), "Text Content 2", (err) ->
						throw err if err

						repo.add ['.'], (err, output) ->
							throw err if err

							output.length.should.equal 3

							commitOpts =
								"-m": "A Test Commit"

							repo.commit commitOpts, (err, output) ->
								throw err if err

								should.exist output

								otherRepo.pull repo.path, (err, output) ->
									throw err if err

									should.exist output

									otherRepo.update (err, output) ->
										throw err if err

										should.exist output

										done()

	it "can push changes to another repo", (done) ->
		HGRepo.MakeTempRepo (err, repo) ->

			otherPath = path.resolve(path.join(repo.path, "..", uuid.v1()))

			repo.clone repo.path, otherPath, (err, output) ->
				throw err if err

				should.exist output

				otherRepo = new HGRepo(otherPath)

				fs.writeFile path.join(repo.path, "one.txt"), "Text Content 1", (err) ->
					throw err if err

					fs.writeFile path.join(repo.path, "two.txt"), "Text Content 2", (err) ->
						throw err if err

						repo.add ['.'], (err, output) ->
							throw err if err

							output.length.should.equal 3

							commitOpts =
								"-m": "A Test Commit"

							repo.commit commitOpts, (err, output) ->
								throw err if err

								should.exist output

								repo.push otherRepo.path, (err, output) ->
									throw err if err

									should.exist output

									otherRepo.update (err, output) ->
										throw err if err

										should.exist output

										otherRepo.summary (err, output) ->
											throw err if err

											should.exist output

											done()

	it "can merge changes between two repos", (done) ->
		HGRepo.MakeTempRepo (err, repo) ->

			otherPath = path.resolve(path.join(repo.path, "..", uuid.v1()))

			repo.clone repo.path, otherPath, (err, output) ->
				throw err if err

				should.exist output

				otherRepo = new HGRepo(otherPath)
				fileOne = path.join(repo.path, "one.txt")

				fs.writeFile fileOne, "Text Content 1", (err) ->
					throw err if err

					fs.writeFile path.join(repo.path, "two.txt"), "Text Content 2", (err) ->
						throw err if err

						repo.add ['.'], (err, output) ->
							throw err if err

							output.length.should.equal 3

							commitOpts =
								"-m": "A Test Commit"

							repo.commit commitOpts, (err, output) ->
								throw err if err

								should.exist output

								otherRepo.pull repo.path, (err, output) ->
									throw err if err

									should.exist output

									otherRepo.update (err, output) ->
										throw err if err

										should.exist output

										otherFileOne = path.join(otherRepo.path, "one.txt")

										fs.appendFileSync otherFileOne, "\nSome More Text on Line 2"
										fs.writeFileSync fileOne, "Some Changes on Line 1\n"

										commitOpts =
											"-m": "Repo One Update"

										repo.commit commitOpts, (err, output) ->
											throw err if err

											should.exist output

											commitOpts =
												"-m": "Repo Two Update"

											otherRepo.commit commitOpts, (err, output) ->
												throw err if err

												should.exist output

												otherRepo.pull repo.path, (err, output) ->
													throw err if err

													should.exist output

													otherRepo.merge (err, output) ->
														throw err if err

														should.exist output

														resolveOpts =
															"--list": ""

														otherRepo.resolve resolveOpts, (err, output) ->
															throw err if err

															should.exist output
															output.length.should.be.above 1

															resolveOpts =
																"-m": "one.txt"

															otherRepo.resolve resolveOpts, (err, output) ->
																throw err if err

																should.exist output

																otherRepo.commit {"-m": "Merging from one"}, (err, output) ->
																	throw err if err

																	should.exist output

																	# To get to the house that jack built....
																	done()

	it "can read and write tags", (done) ->
		HGRepo.MakeTempRepo (err, repo) ->

			fs.writeFile path.join(repo.path, "one.txt"), "Text Content 1", (err) ->
				throw err if err

				repo.add ['.'], (err, output) ->
					throw err if err

					commitOpts =
						"-m": "A Test Commit"

					repo.commit commitOpts, (err, output) ->
						throw err if err

						repo.tag 'a-tag', (err, output) ->
							throw err if err

							repo.tags (err, output) ->
								throw err if err

								should.exist output

								output[3].body.should.equal('a-tag')
								done()

	it "can show repo status", (done) ->
		HGRepo.MakeTempRepo (err, repo) ->

			fs.writeFile path.join(repo.path, "one.txt"), "Text Content 1", (err) ->
				throw err if err

				repo.status '-A', (err, output) ->
					throw err if err

					should.exist output
					output.length.should.be.above 2

					done()

	it "can show repo heads", (done) ->
		HGRepo.MakeTempRepo (err, repo) ->

			fs.writeFile path.join(repo.path, "one.txt"), "Text Content 1", (err) ->
				throw err if err

				repo.add ['.'], (err, output) ->
					throw err if err

					repo.commit {"-m": "Testing heads"}, (err, output) ->
						throw err if err

						repo.heads (err, output) ->
							throw err if err

							should.exist output
							output.length.should.be.above 4

							done()

	it "can show repo branches", (done) ->
		HGRepo.MakeTempRepo (err, repo) ->

			fs.writeFile path.join(repo.path, "one.txt"), "Text Content 1", (err) ->
				throw err if err

				repo.add ['.'], (err, output) ->
					throw err if err

					repo.commit {"-m": "Testing branches"}, (err, output) ->
						throw err if err

						repo.branches (err, output) ->
							throw err if err
							should.exist output
							output.length.should.be.above 3

							done()
							
	it "can generate diff", (done) ->
		HGRepo.MakeTempRepo (err, repo) ->

			fileOne = path.join(repo.path, "one.txt")
			fs.writeFile fileOne, "Text Content 1", (err) ->
				throw err if err

				repo.add ['.'], (err, output) ->
					throw err if err

					repo.commit {"-m": "Testing diff"}, (err, output) ->
						throw err if err

						fs.writeFileSync fileOne, "Some Changes on Line 1\n"

						repo.diff (err, output) ->
							throw err if err
							should.exist output
							diff = Parsers.text output
							diff.should.match /diff \-r .* one.txt/mg
							diff.should.match /\-\-\- a\/one\.txt/mg
							diff.should.match /\+\+\+ b\/one\.txt/mg

							done()
