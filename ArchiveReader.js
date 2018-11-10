const fs = require("fs")
const jszip = require("jszip")
const childprocess = require("child_process")
const naturalComparer = require("./naturalComparer.js")
const iconv = require("iconv-lite")

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
                            .filter(x =>
                            {
                                return !zip.files[x].dir
                            })
                            .sort(naturalComparer.compare)
                        this.isInitialized = true
                        this.callbacks.forEach(callback => callback())
                    })
            })
        }
        if (this.rootPath.toUpperCase().endsWith(".RAR"))
        {
            childprocess.exec("unrar la " + this.rootPath, { encoding: "buffer" }, (error, stdout, stderr) =>
            {
                if (error) throw error
                if (stderr.length > 0) throw new Error(stderr)

                let foundActualLines = false
                let lines = iconv.decode(stdout, "Shift_JIS").split("\n")
                this.fileList = []

                for (let i = 0; i < lines.length; i++)
                {
                    if (lines[i].startsWith("---"))
                    {
                        if (foundActualLines == false)
                        {
                            foundActualLines = true
                            continue
                        }
                        else
                        {
                            // Already parsed all relevant lines
                            this.fileList = this.fileList.sort(naturalComparer.compare)
                            this.isInitialized = true
                            this.callbacks.forEach(callback => callback())
                            return
                        }
                    }

                    if (foundActualLines)
                    {
                        let splits = lines[i].split(" ").filter(x => x != "")
                        if (splits[0][3] != "D")
                            this.fileList.push(splits[splits.length - 1].trimRight().replace(/\\/g, "/"))
                    }
                }
            })
        }
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
                .exec("unrar -inul p " + this.rootPath + " \"" + this.getCurrentFileName().replace(/\//g, "\\") + "\"",
                    (error, stdout, stderr) =>
                    {
                        if (error) throw error
                        if (stderr) throw new Error(stderr)

                        callback(stdout)
                    })
        else
            this.deserializedArchive
                .file(this.getCurrentFileName())
                .async("nodebuffer")
                .then((buffer) =>
                {
                    callback(buffer)
                })
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
