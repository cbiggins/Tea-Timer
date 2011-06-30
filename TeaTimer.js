
timeout = false;

function appLoad(){
	loadPrefs();
}

function loadPrefs() {
	stream = new air.FileStream();

	var prefsFile = getPrefsFile();
	if (prefsFile.exists) {
    	stream.open(prefsFile, air.FileMode.READ);
		prefsXML = stream.readUTFBytes(stream.bytesAvailable);

		stream.close();
		var domParser = new DOMParser();
		prefsXML = domParser.parseFromString(prefsXML, "text/xml");

		var prefTime = prefsXML.getElementsByTagName('time');
		setTime(prefTime[0].firstChild.nodeValue);

		var prefBounce = prefsXML.getElementsByTagName('bounce');
		setBounce(prefBounce[0].firstChild.nodeValue);

		var prefSound = prefsXML.getElementsByTagName('sound');
		setSound(prefSound[0].firstChild.nodeValue);
		
		var infrontBounce = prefsXML.getElementsByTagName('infront');
		setInFront(infrontBounce[0].firstChild.nodeValue);
	}
}

function playSound(){
    var soundPath = new air.URLRequest("app:/sound.mp3");
    var s = new air.Sound();
    s.load(soundPath);
    s.play();
}

function niceTime(seconds){

    minlabel = Math.floor(seconds / 60); // The minutes
    seclabel = seconds % 60; // The balance of seconds
    if (seconds < 10 || seclabel == 0) {
        seclabel = "0" + seclabel;
    }
    
    return minlabel + ":" + seclabel;
}

function getCountdownVal(){
    return time--;
}

function setCountdownVal(time){
    seconds = getCountdownVal();
	countdown = document.getElementById('countdown');
    countdown.innerHTML = niceTime(seconds);
    
    if (seconds == 0) {
        if (getSound()) {
            playSound();
        }
        
        if (getBounce()) {
            if (air.NativeApplication.supportsDockIcon) {
                var dockIcon = air.NativeApplication.nativeApplication.icon;
                dockIcon.bounce(air.NotificationType.CRITICAL);
            }
            else 
                if (air.NativeWindow.supportsNotification) {
                    window.nativeWindow.notifyUser(air.NotificationType.INFORMATIONAL);
                }
        }
    }
    else {
        timeout = setTimeout(setCountdownVal, 1000);
    }
}

function getTimeSelection() {
	timeAmount = document.getElementsByName('time');
    for (var i = 0; i < timeAmount.length; i++) {
        if (timeAmount[i].checked) {
            time = timeAmount[i].value;
            break;
        }
    }
	return time;
}

function setTime(prefsTime) {
	timeAmount = document.getElementsByName('time');
    for (var i = 0; i < timeAmount.length; i++) {
		if (timeAmount[i].value == prefsTime) {
			timeAmount[i].checked = true;
			break;
		}
    }
}

function setBounce(val) {
	if (val == 'false') {
		document.getElementById('bounce').checked = false;
	} else {
		document.getElementById('bounce').checked = true;		
	}
}

function getBounce() {
	return document.getElementById('bounce').checked;
}

function setInFront(val) {
	if (val == 'false') {
		document.getElementById('infront').checked = false;
		window.nativeWindow.alwaysInFront = false;
	} else {
		document.getElementById('infront').checked = true;
		window.nativeWindow.alwaysInFront = true;
	}
}

function inFrontToggle(){
	if (document.getElementById('infront').checked) {
		window.nativeWindow.alwaysInFront = true;
	}
	else {
		window.nativeWindow.alwaysInFront = false;
	}
}

function getInFront() {
	return document.getElementById('infront').checked;
}

function setSound(val) {
	if (val) {
		document.getElementById('alert').checked = true;	
	} else {
		document.getElementById('alert').checked = false;
	}
}

function getSound() {
	return document.getElementById('alert').checked;
}

function startCounter(){
    if (timeout) {
        clearTimeout(timeout);
    }

	time = getTimeSelection();

    if (typeof time == "string") {
        setCountdownVal(time);
    }
}

function runClick() {
	writePrefs();
	startCounter();
}

function getPrefsFile() {
	var prefsFile = air.File.applicationStorageDirectory.resolvePath("prefs.xml");
	// Does the storage file exist?
	if (!prefsFile.exists) {
		// Not there, so we'll copy the blank XML file from the app dir
		original = air.File.applicationDirectory.resolvePath("prefs.xml");
		original.copyTo(prefsFile, true);
	}
	return prefsFile;
}

function writePrefs(){
	prefsFile = getPrefsFile();

	if (prefsFile.exists) {
		var cr = air.File.lineEnding;
		prefsXML = "<?xml version='1.0' encoding='utf-8'?>" + cr +
		"<preferences>" +
		cr +
		"	<time>" + getTimeSelection() + "</time>" +
		cr +
		"	<bounce>" + getBounce() + "</bounce>" +
		cr +
		"	<sound>" + getSound() + "</sound>" +
		cr +
		"	<infront>" + getInFront() + "</infront>" +
		cr +
		"	<saveDate>" +
		new Date().toString() +
		"</saveDate>" +
		cr +
		"</preferences>";
		
		stream = new air.FileStream();
		stream.open(prefsFile, air.FileMode.WRITE);
		stream.writeUTFBytes(prefsXML);
		stream.close();
	}
}