// Update clock every second
function updateClock() {
  const now = new Date();
  const options = {
    timeZone: selectedTimezone,
    timeStyle: 'medium',
  };
  const dateOptions = {
    timeZone: selectedTimezone,
    dateStyle: 'full'
  };
  
  document.getElementById("clock").textContent = new Intl.DateTimeFormat('en-US', options).format(now);
  document.getElementById("date").textContent = new Intl.DateTimeFormat('en-US', dateOptions).format(now);
}

// Alarm functionality
let alarmTimeout;
let alarmSound;
let isAlarmRinging = false;

// Global alarms array for multiple alarms
let alarms = [];

// Modify setAlarm to allow multiple alarms and update alarm list instead of alerting
function setAlarm() {
  // Get alarm time input and validate
  const alarmTimeInput = document.getElementById("alarmTime").value;
  if (!alarmTimeInput) {
    alert("Please set a valid time for the alarm.");
    return;
  }

  const now = new Date();
  let alarmDate = new Date(now.toDateString() + ' ' + alarmTimeInput);
  if (alarmDate < now) {
    // If time passed today, schedule for tomorrow
    alarmDate.setDate(alarmDate.getDate() + 1);
  }
  const timeToAlarm = alarmDate - now;
  // Create a unique id for this alarm
  const alarmId = Date.now();
  const timeout = setTimeout(() => {
    playAlarm();
    // Optionally, remove the alarm from list when triggered:
    removeAlarm(alarmId);
    document.getElementById("stopAlarm").style.display = "inline-block";
  }, timeToAlarm);
  
  // Store alarm details
  alarms.push({ id: alarmId, time: alarmDate, timeout: timeout });
  updateAlarmList();
}

// Update the alarm list box with the alarms that have been set
function updateAlarmList() {
  const list = document.getElementById("alarmList");
  list.innerHTML = ""; // Clear existing list
  alarms.forEach(alarm => {
    list.innerHTML += `<div class="alarm-item" id="alarm-${alarm.id}">
      ${alarm.time.toLocaleTimeString()} 
      <button onclick="removeAlarm(${alarm.id})">Cancel</button>
    </div>`;
  });
}

// Cancel and remove an individual alarm by id
function removeAlarm(alarmId) {
  const index = alarms.findIndex(alarm => alarm.id === alarmId);
  if (index !== -1) {
    clearTimeout(alarms[index].timeout);
    alarms.splice(index, 1);
    updateAlarmList();
  }
}

// Cancel all pending alarms and update the list
function stopAlarmAll() {
  alarms.forEach(alarm => clearTimeout(alarm.timeout));
  alarms = [];
  updateAlarmList();
  stopAlarm(); // Stop ringing alarm if active
}

function playAlarm() {
  alarmSound = document.getElementById("alarmSound");
  alarmSound.muted = false; // ensure audio is unmuted
  
  // Directly attempt to play without calling load()
  const playPromise = alarmSound.play();

  if (playPromise !== undefined) {
    playPromise.then(_ => {
      isAlarmRinging = true;
    }).catch(error => {
      console.error('Playback failed:', error);
      alert('Playback failed. Please ensure autoplay is enabled in your browser and you have interacted with the page.');
    });
  }
}

function testSound() {
  alarmSound = document.getElementById("alarmSound");
  alarmSound.currentTime = 0;
  playAlarm();
  setTimeout(stopAlarm, 2000); // Stop after 2 seconds
}

function stopAlarm() {
  if (isAlarmRinging) {
    alarmSound.pause();
    alarmSound.currentTime = 0;
    isAlarmRinging = false;
  }
  document.getElementById("stopAlarm").style.display = "none";
}

// Stopwatch variables
let stopwatchInterval;
let stopwatchStartTime = 0;
let elapsedTime = 0;

// Timezone variable
let selectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// Initialize timezone selector early with fallback support
function initializeTimezones() {
    const tzSelect = document.getElementById('timezone');
    let timezones = [];
    if (typeof Intl.supportedValuesOf === "function") {
        timezones = Intl.supportedValuesOf('timeZone');
    } else {
        // Fallback list
        timezones = ["UTC", "America/New_York", "Europe/London", "Asia/Tokyo"];
    }
    timezones.forEach(tz => {
        const option = new Option(tz, tz);
        tzSelect.add(option);
    });
    tzSelect.value = selectedTimezone;
    tzSelect.addEventListener('change', function() {
        selectedTimezone = this.value;
    });
}

initializeTimezones();

// Stopwatch functions
function toggleStopwatch() {
    const button = document.getElementById('startStopButton');
    if (!stopwatchInterval) {
        // Start the stopwatch
        stopwatchStartTime = Date.now() - elapsedTime;
        stopwatchInterval = setInterval(updateStopwatch, 1); // Update every millisecond
        button.textContent = 'Stop';
    } else {
        // Stop the stopwatch
        clearInterval(stopwatchInterval);
        stopwatchInterval = null;
        button.textContent = 'Start';
    }
}

function resetStopwatch() {
    const button = document.getElementById('startStopButton');
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
    elapsedTime = 0;
    document.getElementById('stopwatch').textContent = "00:00:00.00";
    button.textContent = 'Start';
}

function updateStopwatch() {
    elapsedTime = Date.now() - stopwatchStartTime;
    let hours = Math.floor(elapsedTime / 3600000);
    let minutes = Math.floor((elapsedTime % 3600000) / 60000);
    let seconds = Math.floor((elapsedTime % 60000) / 1000);
    let milliseconds = Math.floor((elapsedTime % 1000) / 10); // Convert to 00-99 range
    
    document.getElementById('stopwatch').textContent =
        (hours ? (hours < 10 ? '0' + hours : hours) + ':' : '') +
        (minutes < 10 ? '0' + minutes : minutes) + ':' +
        (seconds < 10 ? '0' + seconds : seconds) + '.' +
        (milliseconds < 10 ? '0' + milliseconds : milliseconds);
}

// Section toggling functionality
function showSection(section) {
    // Hide all sections
    document.getElementById('timeSection').style.display = 'none';
    document.getElementById('stopwatchSection').style.display = 'none';
    document.getElementById('alarmSection').style.display = 'none';
    document.getElementById('helpSection').style.display = 'none';
    
    // Show the selected section
    const sectionElement = document.getElementById(section + 'Section');
    if (sectionElement) {
        sectionElement.style.display = 'flex';
        if (section === 'help') {
            loadHelpContent();
        }
    }
}

// Help section functionality
async function loadHelpContent() {
    const markdownContent = `# How to Use vClock: Complete Guide for Time, Stopwatch, and Alarm Features

## How to Use the World Clock Feature in vClock
The digital world clock in vClock allows you to check the current time in different time zones around the world. Here's how to make the most of this feature:

### Getting Started with the World Clock
1. Open the vClock application in your browser
2. By default, the Time section should be displayed. If not, click the "Time" button in the top navigation bar
3. View the current time displayed in a large, easy-to-read digital format
4. The current date is shown below the time display

### How to Change Time Zones
1. Locate the dropdown menu at the top of the clock display
2. Click on the dropdown to view available time zones
3. Select your desired time zone from the list
4. The clock will instantly update to show the correct time in your selected time zone
5. The date display will automatically adjust if the selected time zone is in a different day

### Time Display Features
- The time is displayed in a 24-hour format (00:00:00)
- Seconds are shown to help with precise time tracking
- The interface automatically updates in real-time without requiring page refreshes
- The clean display makes it easy to read the time at a glance, even from a distance

## How to Use the Stopwatch Feature in vClock
The stopwatch function allows you to measure elapsed time with precision. Whether for workouts, cooking, or timing any activity, here's how to use this feature effectively:

### Using Stopwatch Controls
1. Click the "Start" button to begin timing
2. Click the "Stop" button at any time to pause the counting
3. Click the "Reset" button to return to 00:00:00

## How to Set and Use Alarms in vClock
The alarm feature helps you set reminders and wake-up calls with a customizable alert system.

### Setting Up an Alarm
1. Click on the "Alarm" button in the top navigation menu
2. Set your desired alarm time using the time selector
3. Click "Set Alarm" to activate
4. Use "Test Sound" to verify your volume settings
5. Click "Stop Alarm" when the alarm rings
6. Use "Cancel All Alarms" to clear all scheduled alarms`;

    document.getElementById('helpContent').innerHTML = markdownToHtml(markdownContent);
}

// Simple markdown to HTML converter
function markdownToHtml(markdown) {
    return markdown
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/^(\d+\. .*$)/gm, '<li>$1</li>')
        .split(/\n\n/).map(paragraph => 
            paragraph.startsWith('<') ? paragraph : `<p>${paragraph}</p>`
        ).join('\n');
}

// Initialize everything
setInterval(updateClock, 1000);
updateClock();
