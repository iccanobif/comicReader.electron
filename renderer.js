const fs = require("fs")
const { remote } = require('electron')
const { ArchiveReader } = require("./ArchiveReader.js")

let archive = new ArchiveReader("d:/manga/raws/(一般コミック) [本宮ひろ志] 俺の空 刑事編 全７巻 (800x1200).zip")
let zoomLevel = 1

function showImage(buffer)
{
    let encoded = buffer.toString("base64")
    document.getElementById("Image").src = "data:image/*;base64," + encoded
    window.scrollTo(0, 0)
}

function showCurrentImage()
{
    archive.getCurrentFile((buffer) => showImage(buffer))
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
            remote.getCurrentWindow().webContents.setZoomFactor(zoomLevel)
            break;
        case "-":
            event.preventDefault()
            zoomLevel *= 0.9
            remote.getCurrentWindow().webContents.setZoomFactor(zoomLevel)
            break;
        case "Delete":
            remote.BrowserWindow.getFocusedWindow().minimize();
            break;
    }

    // log(event.shiftKey ? "con shift" : "senza shift")
})

archive.executeWhenLoaded(() =>
{
    document.getElementById("LoadingScreen").style.display = "none"
    showCurrentImage()
})