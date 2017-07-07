let capture = require("interactive-screenshot").capture
const {app, Menu, Tray, globalShortcut, clipboard, BrowserWindow, Notification} = require("electron")
let os = require("os")
let snekfetch = require("snekfetch")

app.dock.hide()

let win = null
async function showSettingsWindow() {
  // if(win) win.close()
  win = new BrowserWindow({ width: 200, height: 200 })
  win.show()
  win.focus()
  win.loadURL("web/settings.html")
}

async function showAccountWindow() {
  // if(win) win.close()
  win = new BrowserWindow({ width: 800, height: 600 })
  win.show()
  win.focus()
  win.loadURL("web/account.html")
}

let tray = null
app.on('ready', function() {
  tray = new Tray('icon.png')
  const contextMenu = Menu.buildFromTemplate([
    {label: "My account", click: showAccountWindow},
    {label: "Settings", click: showSettingsWindow},
    {type: "separator"},
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
    new Notification({
      title: "TIGCap",
      body: "Link to screenshot copied to clipboard!",
      silent: true
    }).show()
  } catch(e) {
    // Ignore errors about not running two at once
    if(e.includes && e.includes("screencapture: cannot run two interactive screen captures at a time")) return
    throw e
  }
}

app.on("window-all-closed", function() {
  // Ignore it
})
