const fs = require("fs")
const jszip = require("jszip")
const unrar = require("node-unrar-js")
const naturalComparer = require("./naturalComparer.js")

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
                    .loadAsync(data)
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
            //TODO usa unrar-promise per avere l'API asincrona!

            this.deserializedArchive = unrar.createExtractorFromFile(this.rootPath)
            let list = this.deserializedArchive.getFileList()
            if (list[0].state != "SUCCESS")
                throw new Error(list[0].reason + list[0].msg)
            this.fileList = list[1]
                .fileHeaders
                .filter(x => !x.flags.directory)
                .map(x => x.name)
                .sort(naturalComparer.compare)
            this.isInitialized = true
            this.callbacks.forEach(callback => callback())
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
        {
            this.deserializedArchive.extractAll()
            let content = this.deserializedArchive
                .extractFiles([this.fileList[this.currentPosition]])
                // .extractAll()
                // [1]
                // .files
                // [0]
                // .extract
                // [1]

            console.log(content)
            callback(content)
        }
        else
            this.deserializedArchive
                .file(this.fileList[this.currentPosition])
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