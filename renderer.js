const { remote } = require('electron')
const { ArchiveReader } = require("./ArchiveReader.js")

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

document.addEventListener("keydown", (event) =>
{
    switch (event.key)
    {
        case "PageDown":
            event.preventDefault()
            archive.moveToNextFile()
            showCurrentImage()
            break;
        case "PageUp":
            event.preventDefault()
            archive.moveToPreviousFile()
            showCurrentImage()
            break;
        case "Home":
            event.preventDefault()
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
            remote.BrowserWindow.getFocusedWindow().minimize();
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