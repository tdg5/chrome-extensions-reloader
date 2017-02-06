function reloadExtension(extensionId, extensionType) {
  // disable
  chrome.management.setEnabled(extensionId, false, function() {
    // re-enable
    chrome.management.setEnabled(extensionId, true, function() {
      // re-launch packaged app
      if (extensionType === "packaged_app") {
        chrome.management.launchApp(extensionId);
      }
    });
  });
}

function reloadExtensions() {
  // find all zensight extensions and reload them
  chrome.management.getAll(function(a) {
    var ext = {};
    for (var i = 0; i < a.length; i++) {
      ext = a[i];
      if ((ext.enabled === true) && /Zensight/.test(ext.name)) {
          console.log(ext.name + " reloaded");
          reloadExtension(ext.id, ext.type);
      }
    }
  });

  // show an "OK" badge
  chrome.browserAction.setBadgeText({text: "OK!"});
  chrome.browserAction.setBadgeBackgroundColor({color: "#3291e7"});
  setTimeout(function() { chrome.browserAction.setBadgeText({text: ""}); }, 1000);
}

chrome.webRequest.onCompleted.addListener(
  reloadExtensions,
  {urls: ["https://*.zsinternal.com/*/assume-user*",
          "https://app.zensight.co/*/assume-user*"],
  types: ["main_frame", "sub_frame"]});

chrome.browserAction.onClicked.addListener(reloadExtensions);
