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

// Modify setAlarm function to handle HH:MM:SS format
function setAlarm() {
  const hours = parseInt(document.getElementById("alarmHours").value) || 0;
  const minutes = parseInt(document.getElementById("alarmMinutes").value) || 0;
  const seconds = parseInt(document.getElementById("alarmSeconds").value) || 0;

  if (hours === 0 && minutes === 0 && seconds === 0) {
    alert("Please set a time for the alarm.");
    return;
  }

  if (hours > 23 || minutes > 59 || seconds > 59) {
    alert("Please enter valid time values.");
    return;
  }

  const now = new Date();
  let alarmDate = new Date(now);
  alarmDate.setHours(hours);
  alarmDate.setMinutes(minutes);
  alarmDate.setSeconds(seconds);
  
  // If the time has already passed today, set it for tomorrow
  if (alarmDate < now) {
    alarmDate.setDate(alarmDate.getDate() + 1);
  }

  const timeToAlarm = alarmDate - now;
  const alarmId = Date.now();
  const timeout = setTimeout(() => {
    playAlarm();
    removeAlarm(alarmId);
    document.getElementById("stopAlarm").style.display = "inline-block";
  }, timeToAlarm);
  
  // Store alarm details with formatted time
  alarms.push({ 
    id: alarmId, 
    time: alarmDate, 
    timeout: timeout 
  });
  
  // Reset input fields
  document.getElementById("alarmHours").value = "";
  document.getElementById("alarmMinutes").value = "";
  document.getElementById("alarmSeconds").value = "";
  
  updateAlarmList();
}

// Update the updateAlarmList function to show time in 24-hour format
function updateAlarmList() {
  const list = document.getElementById("alarmList");
  list.innerHTML = ""; // Clear existing list
  alarms.forEach(alarm => {
    const timeString = alarm.time.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    list.innerHTML += `<div class="alarm-item" id="alarm-${alarm.id}">
      ${timeString} 
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

// Timer variables
let timerInterval;
let timerEndTime = 0;
let timerPaused = false;
let timerRemainingTime = 0;

function startTimer() {
    const hours = parseInt(document.getElementById('timerHours').value) || 0;
    const minutes = parseInt(document.getElementById('timerMinutes').value) || 0;
    const seconds = parseInt(document.getElementById('timerSeconds').value) || 0;
    
    if (hours === 0 && minutes === 0 && seconds === 0) {
        alert('Please set a time for the timer');
        return;
    }

    if (!timerPaused) {
        const totalMilliseconds = (hours * 3600 + minutes * 60 + seconds) * 1000;
        timerEndTime = Date.now() + totalMilliseconds;
    } else {
        timerEndTime = Date.now() + timerRemainingTime;
    }

    document.getElementById('startTimerBtn').style.display = 'none';
    document.getElementById('pauseTimerBtn').style.display = 'inline-block';
    
    timerInterval = setInterval(updateTimer, 10);
    timerPaused = false;
}

function updateTimer() {
    const remaining = timerEndTime - Date.now();
    
    if (remaining <= 0) {
        clearInterval(timerInterval);
        document.getElementById('timer').textContent = '00:00:00';
        document.getElementById('startTimerBtn').style.display = 'inline-block';
        document.getElementById('pauseTimerBtn').style.display = 'none';
        playAlarm();
        return;
    }
    
    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    document.getElementById('timer').textContent = 
        (hours ? (hours < 10 ? '0' + hours : hours) + ':' : '00:') +
        (minutes < 10 ? '0' + minutes : minutes) + ':' +
        (seconds < 10 ? '0' + seconds : seconds);
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerPaused = true;
    timerRemainingTime = timerEndTime - Date.now();
    document.getElementById('startTimerBtn').style.display = 'inline-block';
    document.getElementById('pauseTimerBtn').style.display = 'none';
}

function resetTimer() {
    clearInterval(timerInterval);
    timerPaused = false;
    timerRemainingTime = 0;
    document.getElementById('timer').textContent = '00:00:00';
    document.getElementById('timerHours').value = '';
    document.getElementById('timerMinutes').value = '';
    document.getElementById('timerSeconds').value = '';
    document.getElementById('startTimerBtn').style.display = 'inline-block';
    document.getElementById('pauseTimerBtn').style.display = 'none';
    stopAlarm();
}

// Section toggling functionality
function showSection(section) {
    // Hide all sections
    document.getElementById('timeSection').style.display = 'none';
    document.getElementById('stopwatchSection').style.display = 'none';
    document.getElementById('timerSection').style.display = 'none';
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
    const markdownContent = `# How to Use bbclock: Complete Guide

## How to Use the World Clock Feature
The digital world clock in bbclock allows you to check the current time in different time zones around the world.

### Getting Started
1. Open the bbclock application in your browser
2. By default, the Time section should be displayed
3. Use the search box to find your desired city
4. View the current time displayed in a large, easy-to-read digital format
5. The current date is shown below the time display

### Time Display Features
- The time is displayed in a 24-hour format
- The interface automatically updates in real-time
- Search for any major city to see its local time
- The clean display makes it easy to read the time at a glance

## How to Use the Timer Feature in bbclock
The timer function allows you to set a countdown for a specific duration. Perfect for cooking, workouts, or any timed activity that needs a countdown.

### Using the Timer
1. Click on the "Timer" tab in the navigation bar
2. Enter your desired duration:
   - Set hours (0-99)
   - Set minutes (0-59)
   - Set seconds (0-59)
3. Click "Start" to begin the countdown
4. Use "Pause" to temporarily stop the timer if needed
5. Click "Reset" to clear the timer and start over
6. When the timer reaches zero, an alarm will sound
7. Click "Stop Alarm" to silence the alarm

### Timer Features
- Easy-to-read digital display
- Precise countdown to the second
- Pause and resume functionality
- Alarm notification when time is up
- Reset option to clear the timer

## How to Use the Stopwatch Feature
The stopwatch function allows you to measure elapsed time with precision. Whether for workouts, cooking, or timing any activity, here's how to use this feature:

### Using Stopwatch Controls
1. Navigate to the "Stopwatch" tab
2. Click "Start" to begin timing
3. Click "Stop" to pause the counting
4. Use "Reset" to clear the timer and start from zero

### Stopwatch Features
- Precise timing with millisecond accuracy
- Start, stop, and reset functionality
- Clear, easy-to-read display
- Continues running even if you switch tabs

## How to Set and Use Alarms
The alarm feature helps you set reminders and wake-up calls with a customizable alert system.

### Setting Up an Alarm
1. Go to the "Alarm" tab
2. Select your desired alarm time
3. Click "Set Alarm" to create a new alarm
4. Your new alarm will appear in the list below
5. Use "Cancel All Alarms" to remove all active alarms
6. "Test Sound" lets you preview the alarm tone

### Alarm Features
- Set multiple alarms at once
- Each alarm shows in an easy-to-read list
- Cancel individual or all alarms
- Test sound feature to verify volume
- Alarm continues until manually stopped

## Troubleshooting
- Ensure your browser supports JavaScript
- Check your internet connection
- Make sure your browser allows audio for alarms
- Refresh the page if any issues occur

## Compatibility
- Works on all modern web browsers
- Responsive design for mobile and desktop
- No installation required
- Works offline once loaded

## Privacy
- All time tracking happens client-side
- No personal data is stored or collected
- Preferences are saved locally in your browser

## Contact
For support or questions, please contact us.

*Last Updated: March 2025*`;

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

// Social sharing functions
function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent('Check out this awesome virtual clock!');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}`, '_blank');
}

function shareOnTwitter() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('Check out this awesome virtual clock with timezone search, stopwatch, timer, and alarm features!');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
}

function shareOnPinterest() {
    const url = encodeURIComponent(window.location.href);
    const description = encodeURIComponent('Virtual Clock - Online Clock with Stopwatch and Alarm');
    const media = encodeURIComponent(window.location.origin + '/favicon-svg.svg');
    window.open(`https://pinterest.com/pin/create/button/?url=${url}&media=${media}&description=${description}`, '_blank');
}

function shareOnReddit() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent('Virtual Clock - Online Clock with Stopwatch and Alarm');
    window.open(`https://reddit.com/submit?url=${url}&title=${title}`, '_blank');
}

function shareOnLinkedIn() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent('Virtual Clock - Online Clock with Stopwatch and Alarm');
    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`, '_blank');
}

// Initialize everything
initializeTimezones();
setInterval(updateClock, 1000);
updateClock();
