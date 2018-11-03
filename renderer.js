const fs = require("fs")
const { remote } = require('electron')


function log(msg)
{
    console.log(msg)
    document.getElementById("console").innerHTML += msg + "<br />"
}

let imagePaths = ["img.png", "img.jpg", "altra.png"]
let i = 0

function showImage(url)
{
    fs.readFile(url, (err, data) =>
    {
        let encoded = data.toString("base64")
        document.getElementById("immagine").src = "data:image/*;base64," + encoded
    })
    window.scrollTo(0, 0)
}

function showCurrentImage()
{
    showImage(imagePaths[i])
}

document.addEventListener("keydown", (event) =>
{
    switch (event.key)
    {
        case "PageDown":
            event.preventDefault()
            i = (i + 1) % imagePaths.length
            showCurrentImage()

            break;
        case "PageUp":
            event.preventDefault()
            if (i == 0)
                i = imagePaths.length - 1
            else
                i -= 1
            showCurrentImage()
            break;
        case "Delete":
            remote.BrowserWindow.getFocusedWindow().minimize();
            break;
    }

    // log(event.shiftKey ? "con shift" : "senza shift")
})


showCurrentImage()