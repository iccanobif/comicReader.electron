const { remote } = require("electron")
const { ArchiveReader } = require("./ArchiveReader.js")
const $ = require("jquery")
const { ComicLibrary } = require("./ComicLibrary.js")

const comicLibrary = new ComicLibrary("./library.db")
let currentArchive = null
let currentImage = null
let currentZoomLevel = 1
let currentComic = null


function die(error)
{
    alert(error)
}

async function loadComic(comic)
{
    currentComic = comic
    currentZoomLevel = comic.zoom

    const newReader = new ArchiveReader(comic.path)
    await newReader.initialize()
    newReader.moveToPosition(comic.position)
    loadArchive(newReader)
}

async function loadArchive(newArchive)
{
    try
    {
        currentArchive = newArchive
        document.getElementById("LoadingScreen").style.display = "block"
        document.getElementById("cnvs").style.display = "none"
        await currentArchive.initialize()
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
    canvas.height = currentImage.naturalHeight * currentZoomLevel
    canvas.width = currentImage.naturalWidth * currentZoomLevel
    ctx.imageSmoothingQuality = "medium"
    ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height)
    window.scrollTo(0, 0)
}

function showCurrentImage()
{
    currentArchive.getCurrentFile((error, buffer) =>
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
    currentZoomLevel = zoom
    drawCurrentImage()
}

document.addEventListener("keydown", async (event) =>
{
    if (event.key == "l")
    {
        document.getElementById("divLibrary").style.display = "block"
        const comicList = await comicLibrary.getComicList("")

        const libraryComponent = React.createElement(LibraryComponent,
            {
                comicList: comicList,
                comicSelectedHandler: comic =>
                {
                    loadComic(comic)
                    document.getElementById("divLibrary").style.display = "none"
                }
            })

        ReactDOM.render(libraryComponent, document.getElementById("listOfComics"))
        return
    }

    // Handling of actions that make sense only if a comic is loaded
    if (currentComic != null)
    {
        const canvas = document.getElementById("cnvs")
        const middlePointY = Math.round((canvas.height - window.innerHeight) / 2)
        switch (event.key)
        {
            case "PageDown":
            case "d":
                event.preventDefault()
                currentArchive.moveToNextFile()
                showCurrentImage()
                break;
            case "PageUp":
            case "a":
                event.preventDefault()
                currentArchive.moveToPreviousFile()
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
                currentZoomLevel *= 1.1
                setZoom(currentZoomLevel)
                break;
            case "-":
                event.preventDefault()
                currentZoomLevel *= 0.9
                setZoom(currentZoomLevel)
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
        }
        // log(event.shiftKey ? "con shift" : "senza shift")
    }

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

