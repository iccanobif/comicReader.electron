// class Rectangle
// {
//     constructor(height, width)
//     {
//         this.height = height;
//         this.width = width;
//     }
//     // Getter
//     get area()
//     {
//         return this.calcArea();
//     }
//     // Method
//     calcArea()
//     {
//         return this.height * this.width;
//     }
// }

const jszip = require("jszip")

class ArchiveReader
{
    constructor(rootPath)
    {
        this.rootPath = rootPath
    }

    get fileList()
    {
        throw Error("not implemented")
    }

    get currentFileName() 
    {
        throw error("not implemented")
    }

    get currentFile()
    {
        throw error("not implemented")
    }

    moveToNextFile()
    {

    }

    moveToPreviousFile()
    {

    }

    moveToNextCollection()
    {

    }

    moveToPreviousCollection()
    {

    }
}