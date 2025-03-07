// Global variables
let selectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
let timezones = [];
let cityMappings = {
    // North America
    'seattle': 'America/Los_Angeles',
    'seattle wa': 'America/Los_Angeles',
    'portland': 'America/Los_Angeles',
    'portland or': 'America/Los_Angeles',
    'san francisco': 'America/Los_Angeles',
    'san francisco ca': 'America/Los_Angeles',
    'sf': 'America/Los_Angeles',
    'los angeles': 'America/Los_Angeles',
    'los angeles ca': 'America/Los_Angeles',
    'la': 'America/Los_Angeles',
    'las vegas': 'America/Los_Angeles',
    'las vegas nv': 'America/Los_Angeles',
    'phoenix': 'America/Phoenix',
    'phoenix az': 'America/Phoenix',
    'denver': 'America/Denver',
    'denver co': 'America/Denver',
    'salt lake city': 'America/Denver',
    'salt lake': 'America/Denver',
    'dallas': 'America/Chicago',
    'dallas tx': 'America/Chicago',
    'houston': 'America/Chicago',
    'houston tx': 'America/Chicago',
    'chicago': 'America/Chicago',
    'chicago il': 'America/Chicago',
    'minneapolis': 'America/Chicago',
    'minneapolis mn': 'America/Chicago',
    'new york': 'America/New_York',
    'new york city': 'America/New_York',
    'nyc': 'America/New_York',
    'boston': 'America/New_York',
    'boston ma': 'America/New_York',
    'philadelphia': 'America/New_York',
    'philadelphia pa': 'America/New_York',
    'miami': 'America/New_York',
    'miami fl': 'America/New_York',
    'atlanta': 'America/New_York',
    'atlanta ga': 'America/New_York',
    
    // South America
    'brasilia': 'America/Sao_Paulo',
    'brazilia': 'America/Sao_Paulo',
    'brasília': 'America/Sao_Paulo',
    'sao paulo': 'America/Sao_Paulo',
    'são paulo': 'America/Sao_Paulo',
    'rio': 'America/Sao_Paulo',
    'rio de janeiro': 'America/Sao_Paulo',
    'buenos aires': 'America/Argentina/Buenos_Aires',
    'santiago': 'America/Santiago',
    'lima': 'America/Lima',
    'bogota': 'America/Bogota',
    'bogotá': 'America/Bogota',
    'caracas': 'America/Caracas',
    
    // Europe
    'london': 'Europe/London',
    'manchester': 'Europe/London',
    'dublin': 'Europe/Dublin',
    'paris': 'Europe/Paris',
    'berlin': 'Europe/Berlin',
    'frankfurt': 'Europe/Berlin',
    'munich': 'Europe/Berlin',
    'münchen': 'Europe/Berlin',
    'rome': 'Europe/Rome',
    'roma': 'Europe/Rome',
    'madrid': 'Europe/Madrid',
    'barcelona': 'Europe/Madrid',
    'lisbon': 'Europe/Lisbon',
    'lisboa': 'Europe/Lisbon',
    'amsterdam': 'Europe/Amsterdam',
    'brussels': 'Europe/Brussels',
    'bruxelles': 'Europe/Brussels',
    'zurich': 'Europe/Zurich',
    'zürich': 'Europe/Zurich',
    'geneva': 'Europe/Zurich',
    'stockholm': 'Europe/Stockholm',
    'oslo': 'Europe/Oslo',
    'copenhagen': 'Europe/Copenhagen',
    'københavn': 'Europe/Copenhagen',
    'helsinki': 'Europe/Helsinki',
    'moscow': 'Europe/Moscow',
    'moskva': 'Europe/Moscow',
    'moscow': 'Europe/Moscow',
    'istanbul': 'Europe/Istanbul',
    
    // Asia & Middle East
    'dubai': 'Asia/Dubai',
    'abu dhabi': 'Asia/Dubai',
    'doha': 'Asia/Qatar',
    'riyadh': 'Asia/Riyadh',
    'delhi': 'Asia/Kolkata',
    'new delhi': 'Asia/Kolkata',
    'mumbai': 'Asia/Kolkata',
    'bombay': 'Asia/Kolkata',
    'bangalore': 'Asia/Kolkata',
    'bengaluru': 'Asia/Kolkata',
    'calcutta': 'Asia/Kolkata',
    'kolkata': 'Asia/Kolkata',
    'karachi': 'Asia/Karachi',
    'dhaka': 'Asia/Dhaka',
    'bangkok': 'Asia/Bangkok',
    'hanoi': 'Asia/Bangkok',
    'jakarta': 'Asia/Jakarta',
    'singapore': 'Asia/Singapore',
    'kuala lumpur': 'Asia/Kuala_Lumpur',
    'manila': 'Asia/Manila',
    'hong kong': 'Asia/Hong_Kong',
    'taipei': 'Asia/Taipei',
    'seoul': 'Asia/Seoul',
    'tokyo': 'Asia/Tokyo',
    'osaka': 'Asia/Tokyo',
    'beijing': 'Asia/Shanghai',
    'shanghai': 'Asia/Shanghai',
    'guangzhou': 'Asia/Shanghai',
    'shenzhen': 'Asia/Shanghai',
    
    // Oceania
    'sydney': 'Australia/Sydney',
    'melbourne': 'Australia/Melbourne',
    'brisbane': 'Australia/Brisbane',
    'perth': 'Australia/Perth',
    'adelaide': 'Australia/Adelaide',
    'auckland': 'Pacific/Auckland',
    'wellington': 'Pacific/Auckland',
    
    // Others
    'honolulu': 'Pacific/Honolulu',
    'hawaii': 'Pacific/Honolulu',
    'anchorage': 'America/Anchorage',
    'alaska': 'America/Anchorage',
    'vancouver': 'America/Vancouver',
    'toronto': 'America/Toronto',
    'montreal': 'America/Montreal',
    'quebec': 'America/Montreal',
    'mexico city': 'America/Mexico_City',
    'ciudad de mexico': 'America/Mexico_City',
    'mexico df': 'America/Mexico_City'
};

// Initialize timezone data
async function initializeTimezones() {
    if (typeof Intl.supportedValuesOf === "function") {
        timezones = Intl.supportedValuesOf('timeZone');
    } else {
        // Fallback list using Object.keys from cityMappings
        timezones = [...new Set(Object.values(cityMappings))];
    }

    // Set up city search functionality
    const searchInput = document.getElementById('citySearch');
    const searchResults = document.getElementById('citySearchResults');

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        if (searchTerm.length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        // First try to match against city mappings
        const cityMatches = Object.entries(cityMappings)
            .filter(([city]) => city.includes(searchTerm))
            .map(([city, tz]) => ({
                displayName: city.charAt(0).toUpperCase() + city.slice(1),
                timezone: tz
            }));

        // Then try to match against timezone names
        const tzMatches = timezones
            .filter(tz => {
                const lowerTz = tz.toLowerCase();
                return !cityMatches.some(match => match.timezone === tz) && // Avoid duplicates
                    (lowerTz.includes(searchTerm) ||
                     lowerTz.replace(/_/g, ' ').includes(searchTerm));
            })
            .map(tz => ({
                displayName: formatCityName(tz),
                timezone: tz
            }));

        // Combine and limit results
        const matches = [...cityMatches, ...tzMatches].slice(0, 10);

        if (matches.length > 0) {
            searchResults.innerHTML = matches.map(match => 
                `<div class="search-result-item" onclick="selectCity('${match.timezone}', '${match.displayName}')">${match.displayName}</div>`
            ).join('');
            searchResults.style.display = 'block';
        } else {
            searchResults.style.display = 'none';
        }
    });

    // Hide results when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            searchResults.style.display = 'none';
        }
    });
}

// Format city name for display
function formatCityName(timezone) {
    return timezone.split('/').pop().replace(/_/g, ' ');
}

// Handle city selection
function selectCity(timezone, displayName) {
    selectedTimezone = timezone;
    document.getElementById('citySearch').value = displayName || formatCityName(timezone);
    document.getElementById('citySearchResults').style.display = 'none';
    updateClock(); // Update the clock immediately
}

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
initializeTimezones();
setInterval(updateClock, 1000);
updateClock();
