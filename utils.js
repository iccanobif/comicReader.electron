const fs = require("fs")
const path = require("path")

module.exports.findNextArchive = (archivePath, goForward) =>
{
    return new Promise((resolve, reject) =>
    {
        try
        {
            const dirname = path.dirname(archivePath)
            const filename = path.basename(archivePath)

            fs.readdir(dirname, (err, files) =>
            {
                if (err)
                    reject(err)

                for (i = 0; i < files.length; i++)
                    if (files[i] == filename)
                        if (goForward)
                            resolve(path.join(dirname, files[(i + 1) % files.length]))
                        else
                        {
                            resolve(path.join(dirname, files[i == 0 ? files.length - 1 : i - 1]))
                        }

                resolve(path.join(dirname, files[0])) // This should never happen
            })
            return archivePath
        }
        catch (exc)
        {
            reject(exc)
        }
    })
}