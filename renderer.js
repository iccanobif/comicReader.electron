const { remote } = require('electron')
const { ArchiveReader } = require("./ArchiveReader.js")

let archive = null
let zoomLevel = 1

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
        document.getElementById("Image").style.display = "none"
        await archive.initialize()
        document.getElementById("LoadingScreen").style.display = "none"
        document.getElementById("Image").style.display = "block"
        showCurrentImage()
    }
    catch (error)
    {
        die(error)
    }
}

function showImage(buffer)
{
    let encoded = buffer.toString("base64")
    document.getElementById("Image").src = "data:image/*;base64," + encoded
    window.scrollTo(0, 0)
}

function showCurrentImage()
{
    archive.getCurrentFile((error, buffer) =>
    {
        if (error) die(error)
        else showImage(buffer)
    })
}

function setZoom(zoom)
{
    zoomLevel = zoom
    remote.getCurrentWindow().webContents.setZoomFactor(zoomLevel)
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
