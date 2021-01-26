# FinSQL Tools

A tool for semi-automating source control for Dynamics NAV FinSQL. The problem for source control in Dynamics NAV is that the repository and database has to syncronise the objects. This extension should help to do this syncronisation by doing a lot of work in PowerShell.

## Main features
* Importing/Exporting objects from a Dynamics NAV database
* Starting FinSQL from the source control
* Providing the user with a terminal which they can use for running PowerShell scripts

## Important settings
The most important settings are as follows:
```json
"finsqltools.rtcpath": "C:\\Program Files\\Microsoft Dynamics NAV\\90\\RoleTailored Client\\"
```
This sets the current path to look for the `finsql.exe` which is the focus for this extension.

```json
"finsqltools.databasename": "NAV-Demo Database"
```
This setting controls the database of which to connect to. Along with `finsqltools.databaseserver`, the user can pick which database server to connect to.

```json
"finsqltools.export.filters": [
  "ID=18",
  "Modified=Yes"
]
```
This setting is useful for exporting objects fast, instead of exporting all objects. One export will be executed for every filter and finally overwrite the files in the repository.
Filter are explained [here](https://docs.microsoft.com/en-us/dynamics-nav/exportobjects).

```json
"finsqltools.import.fromhash": "HEAD~1"
```
This setting is useful for importing objects. Normally when importing objects, the dialog will be pre-filled with this value. Default value is `HEAD~1` (One commit before the current HEAD). The value is passed to git and could simply be a hash of a commit.



## Date/time + Modified flags
The extension also provides utility for setting the Date/Time point during an export of objects. These may be a source of confusion when utilising git to merge changes.
The settings are as follows:
```json
"finsqltools.export.resetdate": true
```
If this is set to `true` when exporting objects, the date is set to copy the date from the original object in the repository. New objects are left untouched.

```json
"finsqltools.export.resetmodified": "copy"
``` 
Using the `copy`-value, this imitates the `resetdate` functionality and copies the modified flag from the object in the repository.
Other values are:
* `"never"`, leaves the modified flag as is. 
* `"remove"`, sets the modified flag to `No`.


## Import flags

```json
"finsqltools.import.delete": true
```
This feature enables the extension to detect deletions of objects in the repository when importing objects. An object may have been deleted from version X to version Y. This change has to be reflected in the database. If a large number of objects have been deleted, this could take a while since a process is started for every object deleted in the repository.

```json
"finsqltools.import.compileafter": true
```
This feature enables compilation after importing objects. Depending on the number of objects importing, this could be fast since it adds the filter `Compiled=0` to compile only uncompiled objects.