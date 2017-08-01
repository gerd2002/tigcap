let capture = require("interactive-screenshot").capture
const {app, Menu, Tray, globalShortcut, clipboard, BrowserWindow, Notification, ipcMain} = require("electron")
let os = require("os")
let snekfetch = require("snekfetch")

let config = require("./config.json")

if(app.dock) app.dock.hide()

ipcMain.on("reload", function(event, cfg) {
  console.log("Reloading...")
  config = JSON.parse(cfg)
})

let win = null
async function showSettingsWindow() {
  // if(win) win.close()
  win = new BrowserWindow({ width: 500, height: 500 })
  win.show()
  win.focus()
  win.loadURL("file://" + __dirname + "/web/settings.html")
}

async function showAccountWindow() {
  // if(win) win.close()
  win = new BrowserWindow({ width: 800, height: 600 })
  win.show()
  win.focus()
  win.loadURL("file://" + __dirname + "/web/account.html")
}

let tray = null
app.on('ready', function() {
  tray = new Tray('icon.png')
  const contextMenu = Menu.buildFromTemplate([
    {label: "Take screenshot", click: takeScreenshot},
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
    let url = null
    switch(config.img_host) {
      case "pomf": {
        url = await pomfUpload(buffer)
        break
      }
      case "tig": {
        url = await tigUpload(buffer)
        break
      }
      case "srht": {
        url = await srhtUpload(buffer)
        break
      }
      case "owo": {
        url = await owoUpload(buffer)
        break
      }
    }
    clipboard.writeText(url)
    console.log(`Uploaded as ${url}`)
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

async function srhtUpload(buffer) {
  let res = await snekfetch.get(`${config.srht_url}/api/upload`).attach("file", buffer, "oof.png").send({key: config.srht_key})
  return res.body.url
}

async function pomfUpload(buffer) {
  let picked = config.pomf_host
  // let picked
  if(!picked) {
    let res1 = await snekfetch.get("https://rawgit.com/lc-guy/limf/master/host_list.json")
    let list = res1.body
    picked = list[Math.floor(Math.random() * list.length)]
  }
  let res
  try {
    res = await snekfetch.post(`${picked[0]}upload.php`).attach("files[]", buffer, "oof.png")
  } catch (e) {
    console.log(e)
  }
  let body = res.body
  if(res.body instanceof Buffer) {
    body = JSON.parse(res.body.toString("utf8"))
  }
  if(!body.success) throw "Unknown error"
  if(!body.files[0].url.match(new RegExp(picked[1], "gi"))) return picked[1] + body.files[0].url
  else return body.files[0].url
}

async function owoUpload(buffer) {
  let res = await snekfetch.post(`https://api.awau.moe/upload/pomf`).attach("files[]", buffer, "oof.png").set({authorization: config.owoToken})
  let url = `${config.owoUrl || "https://owo.whats-th.is/"}${res.body.files[0].url}`
  return url
}

async function tigUpload(buffer) {
  let res = await snekfetch.post("https://theimg.guru/ajaxupload").attach("file", buffer, "oof.png")
  return res.body.name
}

app.on("window-all-closed", function() {
  // Ignore it
})
