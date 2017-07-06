let capture = require("interactive-screenshot").capture
const {app, Menu, Tray, globalShortcut, clipboard} = require("electron")
let os = require("os")
let snekfetch = require("snekfetch")

app.dock.hide()

let tray = null
app.on('ready', function() {
  tray = new Tray('icon.png')
  const contextMenu = Menu.buildFromTemplate([
    {label: "Quit", role: "quit"}
  ])
  tray.setToolTip(`Press ${os.platform == "darwin" ? "Command" : "Ctrl"}-Shift-C to take a screenshot`)
  tray.setContextMenu(contextMenu)
  const screenshotShortcut = globalShortcut.register('CommandOrControl+Shift+C', takeScreenshot)
})

app.on('will-quit', function() {
  globalShortcut.unregisterAll()
})

async function takeScreenshot() {
  console.log("Keypress")
  try {
    let buffer = await capture()
    if(!buffer) return false // The user canceled the screenshot
    console.log("Captured")
    let res = await snekfetch.post("https://theimg.guru/ajaxupload").attach("file", buffer, "oof.png")
    clipboard.writeText(res.body.name)
    console.log(`Uploaded as ${res.body.name}`)
  } catch(e) {
    // Ignore errors about not running two at once
    if(e.includes("screencapture: cannot run two interactive screen captures at a time")) return
    throw e
  }
}
