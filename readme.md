# Changed Git Files

This module returns an array of changed files and their status according to git.

## Credit

This repository is almost complete copy of @mcwhittemore staged-git-files repo.
https://github.com/mcwhittemore/staged-git-files

The only difference is, that this command also returns files, that was modified, but not added to commit.

## Usage

**Download**

`npm install changed-git-files`

**In Code**

```
var cgf = require("changed-git-files");
cgf(function(err, results){
	//WHAT EVER YOU SO PLEASE
});
```

**Example Results**

```
[
	{
		"filename": "package.json",
		"status": "Added"
	},
	{
		"filename": "readme.md",
		"status": "Modified"
	},
	{
		"filename": "index.js",
		"status": "Renamed"
	}
]
```

## API

### cgf(filter, callback)

Get a list of changed git files

* filter: string of git status codes. No spaces
* callback:
	* err: the error
	* results: file object array.

### cgf.getHead(callback)

Get head that will be used in the diff to ID which files are waiting to be staged.

* callback
	* err: the error
	* head: the git commit id which is aliased to head.

### cgf.readFile(filename, [options], callback)

This is a proxy for [fs.readFile](http://nodejs.org/api/fs.html#fs_fs_readfile_filename_options_callback) with one change. The filename will be relative to the `cgf.cwd`

### cgf.debug

Boolean that flips logging on and off. By default this is false. If true, all git commands will be console logged.

### cgf.includeContent

If true, include content will add a `content` or `err` param to the file object.

* Default Value: false
* Content Param: the content of the file changed
* Err Param: the error message received while trying to read the file.

### cgf.cwd

The current working directory. AKA: where the .git folder you care about is.

# Default Value: is equal to process.cwd() of your app.g

## Statuses

**CGF-Status (git status code)**

* Added (A)
* Copied (C)
* Deleted (D)
* Modified (M)
* Renamed (R)
* Type-Change (T) [i.e. regular file, symlink, submodule, etc.]
* Unmerged (U)
* Unknown (X)

## Change Log

### 0.0.2

* cgf.includeContent added. Now it is possible to also get the file content

### 0.0.1

* The mvp