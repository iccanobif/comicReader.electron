const { remote } = require("electron")
const { ArchiveReader } = require("./ArchiveReader.js")
const $ = require("jquery")
const { ComicLibrary } = require("./ComicLibrary.js")

const comicLibrary = new ComicLibrary("./library.db")
let archive = null
let zoomLevel = 1
let currentImage = null

function die(error)
{
    alert(error)
}

async function loadArchive(newArchive)
{
    try
    {
        archive = newArchive
        document.getElementById("LoadingScreen").style.display = "block"
        document.getElementById("cnvs").style.display = "none"
        await archive.initialize()
        document.getElementById("LoadingScreen").style.display = "none"
        document.getElementById("cnvs").style.display = "block"
        showCurrentImage()
    }
    catch (error)
    {
        die(error)
    }
}

function drawCurrentImage()
{
    const canvas = document.getElementById("cnvs")
    const ctx = canvas.getContext("2d")
    canvas.height = currentImage.naturalHeight * zoomLevel
    canvas.width = currentImage.naturalWidth * zoomLevel
    ctx.imageSmoothingQuality = "medium"
    ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height)
    window.scrollTo(0, 0)
}

function showCurrentImage()
{
    archive.getCurrentFile((error, buffer) =>
    {
        if (error) die(error)
        else
        {
            let encoded = buffer.toString("base64")
            currentImage = new Image()
            currentImage.src = "data:image/*;base64," + encoded
            currentImage.onload = drawCurrentImage
        }
    })
}

function setZoom(zoom)
{
    zoomLevel = zoom
    drawCurrentImage()
}

document.addEventListener("keydown", async (event) =>
{
    const canvas = document.getElementById("cnvs")
    const middlePointY = Math.round((canvas.height - window.innerHeight) / 2)
    switch (event.key)
    {
        case "PageDown":
        case "d":
            event.preventDefault()
            archive.moveToNextFile()
            showCurrentImage()
            break;
        case "PageUp":
        case "a":
            event.preventDefault()
            archive.moveToPreviousFile()
            showCurrentImage()
            break;
        case "Home":
        case "w":
            event.preventDefault()
            if (window.scrollY <= middlePointY)
                window.scrollTo(0, 0)
            else
                window.scrollTo(0, middlePointY)
            break;
        case "End":
        case "s":
            event.preventDefault()
            if (window.scrollY < middlePointY)
                window.scrollTo(0, middlePointY)
            else
                // Yeah, it's a bit exaggerated, but at least I can be 100%w sure the page will scroll to the bottom
                window.scrollTo(0, middlePointY * 3)
            break;
        case "4": case "5": case "6":
            window.scrollTo(0, middlePointY * 3)
            break;
        case "7": case "8": case "9":
            window.scrollTo(0, 0)
            break;
        case "+":
            event.preventDefault()
            zoomLevel *= 1.1
            setZoom(zoomLevel)
            break;
        case "-":
            event.preventDefault()
            zoomLevel *= 0.9
            setZoom(zoomLevel)
            break;
        case "r":
            event.preventDefault()
            if (resizeQuality == "high")
                resizeQuality = "low"
            else
                resizeQuality = "high"
            drawCurrentImage()
            break;
        case "Delete":
            remote.BrowserWindow.getFocusedWindow().minimize()
            break;
        case "l":
            document.getElementById("divLibrary").style.display = "block"
            const comicList = await comicLibrary.getComicList("")

            const libraryComponent = React.createElement(LibraryComponent,
                {
                    comicList: comicList
                })
            
            ReactDOM.render(libraryComponent, document.getElementById("listOfComics"));
            break;
    }
    // log(event.shiftKey ? "con shift" : "senza shift")
})

document.ondragover = (ev) =>
{
    ev.preventDefault()
    // TODO add some visual effect
}

document.ondrop = (ev) =>
{
    try
    {
        ev.preventDefault()
        loadArchive(new ArchiveReader(ev.dataTransfer.items[0].getAsFile().path))
    }
    catch (error)
    {
        die(error)
    }
}

loadArchive(new ArchiveReader("d:/manga/raws/chonettaiyaorgy.zip"))
