function reloadExtensions() {
    
	// find all unpacked extensions and reload them
	chrome.management.getAll(function(a) {
		var ext = {};
		for (var i = 0; i < a.length; i++) {
			ext = a[i];
			if ((ext.installType === "development") &&
				(ext.enabled === true) &&
				(ext.name !== "Extensions Reloader")) {
					console.log(ext.name + " reloaded");
					(function (extensionId, extensionType) {
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
					})(ext.id, ext.type);
			}
		}
	});

	// Reload the current tab based on option value
	chrome.storage.sync.get("reloadPage", function(item) {
		if (item.reloadPage) {
            chrome.tabs.getSelected(null, function(tab) {
			    chrome.tabs.reload(tab.id);
            });
		}
	});

	// show an "OK" badge
	chrome.browserAction.setBadgeText({text: "OK"});
	chrome.browserAction.setBadgeBackgroundColor({color: "#4cb749"});
	setTimeout(function() {
		chrome.browserAction.setBadgeText({text: ""});
	}, 1000);

}

chrome.commands.onCommand.addListener(function(command) {
	if (command === "reload") {
		reloadExtensions();
	}
});

// intercept url
chrome.webRequest.onBeforeRequest.addListener(
	function(details) {
		if (details.url.indexOf("http://reload.extensions") >= 0) {
			reloadExtensions();
			// Close the tab if we can find a valid associated tab
			chrome.tabs.get(details.tabId, function(tab) {
				// This is usually a pre-fetch request for which no tab is associated.
				if (typeof(tab) === "undefined") {
					// Check lastError to prevent chrome from whining
					var lastError = chrome.runtime.lastError;
					if (lastError && lastError.message.slice(0, 15) != "No tab with id:") {
						console.log("reload.extensions weirdness:" + chrome.runtime.lastError.message);
					}
					return;
				}
				chrome.tabs.remove(details.tabId);
			});
		}

	return {cancel: false};
	},
	{
		urls: ["http://reload.extensions/"],
		types: ["main_frame"]
	},
	["blocking"]
);

chrome.browserAction.onClicked.addListener(function(/*tab*/) {
	reloadExtensions();
});
