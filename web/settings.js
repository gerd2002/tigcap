var ipcRenderer = require("electron").ipcRenderer
var oldConfig = config = require("../config.json")
var fs = require("fs")
window.addEventListener("load", function() {
  var imgHostSelector = document.getElementById("img-host")
  imgHostSelector.addEventListener("change", function() {
    config.img_host = this.value
    reloadValues()
  })
  var body = document.getElementById("body")
  var srht_url = document.getElementById("srht_url")
  var srht_key = document.getElementById("srht_key")
  var pomf_host_server = document.getElementById("pomf_host_server")
  var pomf_host_vanity = document.getElementById("pomf_host_vanity")
  var owo_token = document.getElementById("owo_token")
  var owo_url = document.getElementById("owo_url")
  srht_url.addEventListener("change", function() {
    config.srht_url = this.value
    save()
  })
  srht_key.addEventListener("change", function() {
    config.srht_key = this.value
    save()
  })
  pomf_host_server.addEventListener("change", function() {
    config.pomf_host[0] = this.value
    save()
  })
  pomf_host_vanity.addEventListener("change", function() {
    config.pomf_host[1] = this.value
    save()
  })
  owo_token.addEventListener("change", function() {
    config.owoToken = this.value
    save()
  })
  owo_url.addEventListener("change", function() {
    config.owoUrl = this.value
    save()
  })
  function reloadValues() {
    srht_url.value = config.srht_url
    srht_key.value = config.srht_key
    pomf_host_server.value = config.pomf_host[0]
    pomf_host_vanity.value = config.pomf_host[1]
    owo_token.value = config.owoToken
    owo_url.value = config.owoUrl
    body.classList = config.img_host
    imgHostSelector.value = config.img_host
    save()
  }
  window.reloadValues = reloadValues
  reloadValues()
})
function save() {
  oldConfig = config
  fs.writeFile(__dirname + "/../config.json", JSON.stringify(config), {flag: "w"}, function(err, oof) {
    console.log(err, oof)
    if(err) throw err
    console.log("Saved!")
    ipcRenderer.send("reload", JSON.stringify(config))
  })
}
