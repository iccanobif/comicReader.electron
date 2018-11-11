const fs = require("fs")
const jszip = require("jszip")
const childprocess = require("child_process")
const naturalComparer = require("./naturalComparer.js")
const iconv = require("iconv-lite")
const combineErrors = require("combine-errors")

const allowedImageExtensions = /\.(jpg|jpeg|png|gif|bmp)$/i

class ArchiveReader
{
    constructor(rootPath)
    {
        this.rootPath = rootPath
        this.deserializedArchive = null
        this.currentPosition = 0
        this.isInitialized = false
        this.callbacks = []

        if (this.rootPath.toUpperCase().endsWith(".ZIP")
            || this.rootPath.toUpperCase().endsWith(".CBR")
            || this.rootPath.toUpperCase().endsWith(".CBZ"))
        {
            fs.readFile(this.rootPath, (err, data) =>
            {
                if (err) throw err
                jszip
                    .loadAsync(data, {
                        decodeFileName: (nameUint8Array) =>
                        {
                            let newName = iconv.decode(Buffer.from(nameUint8Array), "Shift_JIS")
                            return newName
                        }
                    })
                    .then((zip) =>
                    {
                        this.deserializedArchive = zip
                        this.fileList = Object
                            .keys(zip.files)
                            .filter(fileName =>
                            {
                                return !zip.files[fileName].dir && fileName.match(allowedImageExtensions)
                            })
                            .sort(naturalComparer.compare)
                        this.isInitialized = true
                        this.callAllCallbacks(null)
                    })
            })
        }
        else if (this.rootPath.toUpperCase().endsWith(".RAR"))
        {
            childprocess.exec("unrar la " + this.rootPath,
                {
                    encoding: "buffer",
                    maxBuffer: 1024 * 1024 * 1024 // 1 gigabyte
                },
                (error, stdout, stderr) =>
                {
                    if (error) throw error
                    if (stderr.length > 0) throw new Error(stderr)

                    let foundActualLines = false
                    let lines = iconv.decode(stdout, "Shift_JIS").split("\n")
                    this.fileList = []

                    for (let i = 0, line = lines[0]; i < lines.length; i++ , line = lines[i])
                    {
                        if (line.startsWith("---"))
                        {
                            if (foundActualLines == false)
                            {
                                foundActualLines = true
                                continue
                            }
                            else
                            {
                                // Already parsed all relevant lines
                                this.fileList = this.fileList
                                    .filter(fileName => fileName.match(allowedImageExtensions))
                                    .sort(naturalComparer.compare)
                                this.isInitialized = true
                                this.callAllCallbacks(null)
                                return
                            }
                        }

                        if (foundActualLines)
                        {
                            line = line.trim()
                            if (line[3] != "D")
                            {
                                // remove the first 4 colums (attributes, size, date and time), which are basically 4 instances 
                                // of one block of non-whitespace and one block of whitespace
                                let fileName = line.replace(/([^\s]*[\s]*){4}/, "")
                                this.fileList.push(fileName.replace(/\\/g, "/"))
                            }
                        }
                    }
                })
        }
        else if (fs.statSync(this.rootPath).isDirectory())
        {
            throw new Error("to be implemented")
        }
        else
        {
            throw new Error("can't open path " + this.rootPath + " as an archive.")
        }
    }

    callAllCallbacks(error)
    {
        this.callbacks.forEach(callback => callback(error))
    }

    executeWhenLoaded(callback)
    {
        if (this.isInitialized)
            callback()
        else
            this.callbacks.push(callback)
    }

    getFileList()
    {
        if (!this.isInitialized) throw new Error("ArchiveReader still not initialized!")
        return this.fileList
    }

    getCurrentFileName()
    {
        if (!this.isInitialized) throw new Error("ArchiveReader still not initialized!")
        return this.fileList[this.currentPosition]
    }

    getCurrentFile(callback)
    {
        if (!this.isInitialized) throw new Error("ArchiveReader still not initialized!")

        if (this.rootPath.toUpperCase().endsWith(".RAR"))
            childprocess
                .exec("unrar -inul p \"" + this.rootPath + "\" \"" + this.getCurrentFileName().replace(/\//g, "\\") + "\"",
                    {
                        encoding: "buffer",
                        maxBuffer: 1024 * 1024 * 1024 // 1 gigabyte
                    },
                    (error, stdout, stderr) =>
                    {
                        if (error) callback(combineErrors([error, new Error(stderr)]))
                        else if (stderr && stderr.length > 0) callback(new Error(stderr))
                        else callback(null, stdout)
                    })
        else
            this.deserializedArchive
                .file(this.getCurrentFileName())
                .async("nodebuffer")
                .then(
                    (buffer) =>
                    {
                        callback(null, buffer)
                    },
                    (error) =>
                    {
                        callback(error)
                    }
                )
    }

    moveToNextFile()
    {
        if (!this.isInitialized) throw new Error("ArchiveReader still not initialized!")
        this.currentPosition += 1
        if (this.currentPosition == this.fileList.length)
            this.currentPosition = 0
    }

    moveToPreviousFile()
    {
        if (!this.isInitialized) throw new Error("ArchiveReader still not initialized!")
        this.currentPosition -= 1
        if (this.currentPosition < 0)
            this.currentPosition = this.fileList.length - 1
    }

    moveToPosition(position)
    {
        if (!this.isInitialized) throw new Error("ArchiveReader still not initialized!")
        this.currentPosition = position
    }

    moveToNextCollection()
    {
        if (!this.isInitialized) throw new Error("ArchiveReader still not initialized!")
        throw new Error("not implemented")
    }

    moveToPreviousCollection()
    {
        if (!this.isInitialized) throw new Error("ArchiveReader still not initialized!")
        throw new Error("not implemented")
    }
}

module.exports.ArchiveReader = ArchiveReader
