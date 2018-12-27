const { remote } = require("electron")
const { ArchiveReader } = require("./ArchiveReader.js")
const $ = require("jquery")
const { ComicLibrary } = require("./ComicLibrary.js")

const comicLibrary = new ComicLibrary("./library.db")
const divLibrary = document.getElementById("divLibrary")
const navigationKeysGrabber = document.getElementById("navigationKeysGrabber")

let currentArchive = null
let currentImage = null
let currentZoomLevel = 1
let currentComic = null

let keysLocked = false

function die(error)
{
    alert(error)
    hideLoader()
}

function setWindowTitle(str)
{
    document.title =
        str == ""
            ? "Comic Reader"
            : "Comic Reader - " + str
}

function showLoader()
{
    document.getElementById("LoadingScreen").style.display = "block"
    document.getElementById("cnvs").style.display = "none"
}

function hideLoader()
{
    document.getElementById("LoadingScreen").style.display = "none"
    document.getElementById("cnvs").style.display = "block"
}

async function loadComic(comic)
{
    try
    {
        showLoader()
        currentComic = comic
        currentZoomLevel = comic.zoom

        const newReader = new ArchiveReader(comic.path)
        await newReader.initialize()
        newReader.moveToPosition(comic.position)
        loadArchive(newReader)
    }
    catch (error)
    {
        die(error)
    }
}

async function loadArchive(newArchive)
{
    try
    {
        currentArchive = newArchive
        showLoader()
        await currentArchive.initialize()
        loadCurrentImage(() => { hideLoader() })
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
    keysLocked = false
}

function loadCurrentImage(done)
{
    keysLocked = true
    currentArchive.getCurrentFile((error, buffer) =>
    {
        if (error) die(error)
        else
        {
            if (currentComic == null)
                setWindowTitle(currentArchive.getCurrentFileName())
            else
                setWindowTitle("[" + currentComic.title + "] " + currentArchive.getCurrentFileName())

            let encoded = buffer.toString("base64")
            currentImage = new Image()
            currentImage.src = "data:image/*;base64," + encoded
            currentImage.onload = drawCurrentImage
            if (done != undefined)
                done()
        }
    })
}

function setZoom(zoom)
{
    currentZoomLevel = zoom
    drawCurrentImage()
}

function hideLibrary()
{
    divLibrary.style.display = "none"
    ReactDOM.unmountComponentAtNode(document.getElementById("listOfComics"))
    navigationKeysGrabber.focus()
}

async function showLibrary()
{
    try
    {
        divLibrary.style.display = "block"
        const comicList = await comicLibrary.getComicList("")

        const filterableComicList = React.createElement(FilterableComicList,
            {
                comicList: comicList,
                onComicSelected: comic =>
                {
                    loadComic(comic)
                    hideLibrary()
                },
                onWantToClosePopup: hideLibrary
            })

        ReactDOM.render(filterableComicList, document.getElementById("listOfComics"))
    }
    catch (error)
    {
        die(error)
    }
}

navigationKeysGrabber.addEventListener("keydown", async (event) =>
{
    // This is to prevent users from changing the focus (only the focused div receives keydown events)
    if (event.key == "Tab")
    {
        event.preventDefault()
        return
    }

    if (event.key == "l")
    {
        showLibrary()
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
                if (keysLocked)
                    return
                currentArchive.moveToNextFile()
                loadCurrentImage()
                break;
            case "PageUp":
            case "a":
                event.preventDefault()
                if (keysLocked)
                    return
                currentArchive.moveToPreviousFile()
                loadCurrentImage()
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
            case " ":
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

document.onsubmit = (ev) =>
{
    console.log("Preventing submit...")
    ev.preventDefault()
}

showLibrary()
