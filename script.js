// Global state and initialization
let selectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
let timezones = [];
let cityMappings = {
    'london': 'Europe/London',
    'paris': 'Europe/Paris',
    'new york': 'America/New_York',
    'tokyo': 'Asia/Tokyo',
    'sydney': 'Australia/Sydney',
    'los angeles': 'America/Los_Angeles',
    'chicago': 'America/Chicago',
    'berlin': 'Europe/Berlin',
    'moscow': 'Europe/Moscow',
    'dubai': 'Asia/Dubai',
    'singapore': 'Asia/Singapore',
    'hong kong': 'Asia/Hong_Kong',
    'mumbai': 'Asia/Kolkata',
    'cairo': 'Africa/Cairo',
    'rio de janeiro': 'America/Sao_Paulo',
    'beijing': 'Asia/Shanghai',
    'istanbul': 'Europe/Istanbul',
    'rome': 'Europe/Rome',
    'toronto': 'America/Toronto',
    'madrid': 'Europe/Madrid',
    'amsterdam': 'Europe/Amsterdam',
    'bangkok': 'Asia/Bangkok',
    'vienna': 'Europe/Vienna',
    'seoul': 'Asia/Seoul',
    'kuala lumpur': 'Asia/Kuala_Lumpur',
    'jakarta': 'Asia/Jakarta',
    'auckland': 'Pacific/Auckland',
    'vancouver': 'America/Vancouver',
    'mexico city': 'America/Mexico_City',
    'johannesburg': 'Africa/Johannesburg'
};
let alarms = [];
let stopwatchInterval;
let stopwatchStartTime = 0;
let elapsedTime = 0;
let timerInterval;
let timerEndTime = 0;
let timerPaused = false;
let timerRemainingTime = 0;
let alarmTimeout;
let alarmSound;
let isAlarmRinging = false;

// Initialize functionality based on current page
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Initialize shared components
    initializeSocialSharing();
    setActivePageIndicator();
    initializeAlarms(); // Initialize alarms on every page
    initializeAudio(); // Initialize audio on every page
    checkAlarmState(); // Check if alarm should be showing
    
    // Initialize features based on the current page
    switch(currentPage) {
        case 'index.html':
            initializeClock();
            break;
        case 'stopwatch.html':
            initializeStopwatch();
            break;
        case 'timer.html':
            initializeTimer();
            break;
        case 'alarm.html':
            updateAlarmList(); // Only update the visual list on alarm page
            break;
        case 'help.html':
            loadHelpContent();
            break;
    }
});

// Active page indicator
function setActivePageIndicator() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navButtons = document.querySelectorAll('.nav-buttons button');
    
    navButtons.forEach(button => {
        const href = button.getAttribute('onclick').match(/'([^']+)'/)[1];
        if (href === currentPage) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// Persistence utilities
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('Error saving to storage:', e);
    }
}

function loadFromStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.error('Error loading from storage:', e);
        return null;
    }
}

// Clock functionality (index.html)
function initializeClock() {
    loadSavedTimezone();
    initializeTimezones();
    setInterval(updateClock, 1000);
    updateClock();
    
    const citySearch = document.getElementById('citySearch');
    if (citySearch) {
        citySearch.addEventListener('input', handleCitySearch);
    }

    // Display local timezone
    const localTimezoneElement = document.getElementById('local-timezone');
    if (localTimezoneElement) {
        localTimezoneElement.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
}

// Load and save timezone preference
function loadSavedTimezone() {
    const saved = localStorage.getItem('selectedTimezone');
    if (saved) {
        selectedTimezone = saved;
    }
}

function saveTimezone(timezone) {
    selectedTimezone = timezone;
    localStorage.setItem('selectedTimezone', timezone);
    updateClock();
}

// Initialize timezone search with persistence
async function initializeTimezones() {
    loadSavedTimezone();
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
                displayName: tz.replace(/_/g, ' '),
                timezone: tz
            }));

        const matches = [...cityMatches, ...tzMatches];

        if (matches.length === 0) {
            searchResults.style.display = 'none';
            return;
        }

        searchResults.innerHTML = matches.map(match => 
            `<div class="search-result" data-timezone="${match.timezone}">${match.displayName}</div>`
        ).join('');
        searchResults.style.display = 'block';

        document.querySelectorAll('.search-result').forEach(result => {
            result.addEventListener('click', () => {
                const timezone = result.getAttribute('data-timezone');
                saveTimezone(timezone);
                searchResults.style.display = 'none';
                updateClock();
            });
        });
    });
}

function updateClock() {
    const clockElement = document.getElementById('clock');
    const dateElement = document.getElementById('date');
    
    if (!clockElement || !dateElement) return;
    
    const now = new Date();
    const options = { timeZone: selectedTimezone };
    
    clockElement.textContent = now.toLocaleTimeString('en-US', {
        ...options,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    dateElement.textContent = now.toLocaleDateString('en-US', {
        ...options,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Alarm functionality
function initializeAlarms() {
    // Create audio element if it doesn't exist on the current page
    if (!document.getElementById('alarmSound')) {
        const audioElement = document.createElement('audio');
        audioElement.id = 'alarmSound';
        audioElement.loop = true;
        const sourceElement = document.createElement('source');
        sourceElement.src = 'https://cdn.pixabay.com/audio/2021/08/04/audio_c668156e64.mp3';
        sourceElement.type = 'audio/mpeg';
        audioElement.appendChild(sourceElement);
        document.body.appendChild(audioElement);
    }
    
    loadSavedAlarms();
}

function loadSavedAlarms() {
    const savedAlarms = loadFromStorage('alarms');
    if (!savedAlarms) return;

    alarms = savedAlarms.map(data => {
        const time = new Date(data.time);
        const now = new Date();
        let timeToAlarm = time - now;
        
        // If alarm time has passed, schedule for next occurrence
        if (timeToAlarm <= 0) {
            time.setDate(time.getDate() + 1);
            timeToAlarm = time - now;
        }
        
        const timeout = setTimeout(() => {
            playAlarm();
            removeAlarm(data.id);
            const stopButton = document.getElementById('stopAlarm');
            if (stopButton) {
                stopButton.style.display = 'inline-block';
            }
        }, timeToAlarm);
        
        return {
            id: data.id,
            time: time,
            timeout: timeout
        };
    });
    
    // Only update the visual list if we're on the alarm page
    if (window.location.pathname.endsWith('alarm.html')) {
        updateAlarmList();
    }
}

function saveAlarms() {
    const alarmsData = alarms.map(alarm => ({
        id: alarm.id,
        time: alarm.time.getTime()
    }));
    saveToStorage('alarms', alarmsData);
}

function setAlarm() {
    const hours = parseInt(document.getElementById('alarmHours').value) || 0;
    const minutes = parseInt(document.getElementById('alarmMinutes').value) || 0;
    const seconds = parseInt(document.getElementById('alarmSeconds').value) || 0;

    if (hours === 0 && minutes === 0 && seconds === 0) {
        alert('Please set a time for the alarm.');
        return;
    }

    if (hours > 23 || minutes > 59 || seconds > 59) {
        alert('Please enter valid time values.');
        return;
    }

    const now = new Date();
    let alarmDate = new Date(now);
    alarmDate.setHours(hours);
    alarmDate.setMinutes(minutes);
    alarmDate.setSeconds(seconds);
    alarmDate.setMilliseconds(0);
    
    if (alarmDate < now) {
        alarmDate.setDate(alarmDate.getDate() + 1);
    }

    const timeToAlarm = alarmDate - now;
    const alarmId = Date.now();
    const timeout = setTimeout(() => {
        playAlarm();
        removeAlarm(alarmId);
        const stopButton = document.getElementById('stopAlarm');
        if (stopButton) {
            stopButton.style.display = 'inline-block';
        }
    }, timeToAlarm);
    
    alarms.push({ 
        id: alarmId, 
        time: alarmDate, 
        timeout: timeout 
    });
    
    // Clear input fields
    ['alarmHours', 'alarmMinutes', 'alarmSeconds'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.value = '';
        }
    });
    
    updateAlarmList();
    saveAlarms();
}

function removeAlarm(alarmId) {
    const alarm = alarms.find(a => a.id === alarmId);
    if (alarm) {
        clearTimeout(alarm.timeout);
    }
    alarms = alarms.filter(a => a.id !== alarmId);
    updateAlarmList();
    saveAlarms();
}

function stopAlarmAll() {
    alarms.forEach(alarm => clearTimeout(alarm.timeout));
    alarms = [];
    updateAlarmList();
    stopAlarm();
    saveAlarms();
}

// Enhanced alarm playback function with page check
async function playAlarm() {
    // Only play sound if we're on alarm.html
    const isAlarmPage = window.location.pathname.endsWith('alarm.html');
    
    if (isAlarmPage && !alarmSound) {
        await initializeAudio();
    }

    if (isAlarmPage && alarmSound) {
        try {
            alarmSound.currentTime = 0;
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                const audioContext = new AudioContext();
                await audioContext.resume();
            }
            await alarmSound.play();
            isAlarmRinging = true;
        } catch (error) {
            console.error('Error playing alarm:', error);
        }
    }

    showVisualAlert();
}

// Enhanced visual alert
function showVisualAlert() {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;

    alertContainer.innerHTML = '';
    const visualAlert = document.createElement('div');
    visualAlert.className = 'visual-alert';
    
    visualAlert.innerHTML = `⏰ ALARM!`;

    alertContainer.appendChild(visualAlert);
}

// Improved stop alarm function
function stopAlarm() {
    if (alarmSound) {
        alarmSound.pause();
        alarmSound.currentTime = 0;
    }
    
    isAlarmRinging = false;
    const alertContainer = document.getElementById('alertContainer');
    if (alertContainer) {
        alertContainer.innerHTML = '';
    }
}

function testSound() {
    if (!alarmSound) {
        alarmSound = document.getElementById('alarmSound');
        if (!alarmSound) {
            initializeAudio();
        }
    }

    if (alarmSound) {
        alarmSound.pause();
        alarmSound.currentTime = 0;
        
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            const audioContext = new AudioContext();
            audioContext.resume().then(() => {
                alarmSound.play().then(() => {
                    setTimeout(() => {
                        if (!isAlarmRinging) {
                            alarmSound.pause();
                            alarmSound.currentTime = 0;
                        }
                    }, 2000);
                }).catch(console.error);
            });
        } else {
            alarmSound.play().then(() => {
                setTimeout(() => {
                    if (!isAlarmRinging) {
                        alarmSound.pause();
                        alarmSound.currentTime = 0;
                    }
                }, 2000);
            }).catch(console.error);
        }
    }
}

function updateAlarmList() {
    const list = document.getElementById('alarmList');
    if (!list) return;

    list.innerHTML = '';
    alarms.sort((a, b) => a.time - b.time).forEach(alarm => {
        const timeString = alarm.time.toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        list.innerHTML += `<div class="alarm-item" id="alarm-${alarm.id}">
            ${timeString} 
            <button onclick="removeAlarm(${alarm.id})" aria-label="Cancel alarm set for ${timeString}">Cancel</button>
        </div>`;
    });
}

// Stopwatch persistence
function saveStopwatchState() {
    const state = {
        isRunning: !!stopwatchInterval,
        elapsed: elapsedTime
    };
    if (!state.isRunning) {
        // Clear state when stopwatch is stopped
        localStorage.removeItem('stopwatchState');
    } else {
        localStorage.setItem('stopwatchState', JSON.stringify(state));
    }
}

function loadStopwatchState() {
    const saved = localStorage.getItem('stopwatchState');
    if (!saved) return;

    const state = JSON.parse(saved);
    if (state.isRunning) {
        stopwatchStartTime = Date.now() - state.elapsed;
        stopwatchInterval = setInterval(updateStopwatch, 10);
        const button = document.getElementById('startStopButton');
        if (button) {
            button.textContent = 'Stop';
        }
    } else {
        elapsedTime = state.elapsed || 0;
        updateStopwatch();
    }
}

// Stopwatch functions
function initializeStopwatch() {
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
    elapsedTime = 0;
    stopwatchStartTime = 0;
    const startStopBtn = document.getElementById('startStopButton');
    if (startStopBtn) {
        startStopBtn.textContent = 'Start';
    }
    const stopwatchDisplay = document.getElementById('stopwatch');
    if (stopwatchDisplay) {
        stopwatchDisplay.textContent = '00:00:00.00';
    }
    // Only load saved state if there was an active stopwatch
    const savedState = loadFromStorage('stopwatchState');
    if (savedState && savedState.isRunning) {
        loadStopwatchState();
    }
}

function toggleStopwatch() {
    const button = document.getElementById('startStopButton');
    if (!button) return;

    if (button.textContent === 'Start') {
        button.textContent = 'Stop';
        stopwatchStartTime = Date.now() - elapsedTime;
        stopwatchInterval = setInterval(updateStopwatch, 10);
    } else {
        button.textContent = 'Start';
        clearInterval(stopwatchInterval);
    }
    saveStopwatchState();
}

function resetStopwatch() {
    const button = document.getElementById('startStopButton');
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
    elapsedTime = 0;
    document.getElementById('stopwatch').textContent = "00:00:00.00";
    button.textContent = 'Start';
    saveStopwatchState();
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
        
    saveStopwatchState();
}

// Timer state persistence
function saveTimerState() {
    const state = {
        endTime: timerEndTime,
        isPaused: timerPaused,
        remainingTime: timerRemainingTime,
        isRunning: !!timerInterval
    };
    saveToStorage('timerState', state);
}

function loadTimerState() {
    const state = loadFromStorage('timerState');
    if (!state) return;

    if (state.isRunning && !state.isPaused) {
        const now = Date.now();
        if (state.endTime > now) {
            timerEndTime = state.endTime;
            timerInterval = setInterval(updateTimer, 10);
            document.getElementById('startTimerBtn').style.display = 'none';
            document.getElementById('pauseTimerBtn').style.display = 'inline-block';
        }
    } else if (state.isPaused && state.remainingTime > 0) {
        timerPaused = true;
        timerRemainingTime = state.remainingTime;
        const timeInMs = state.remainingTime;
        const hours = Math.floor(timeInMs / 3600000);
        const minutes = Math.floor((timeInMs % 3600000) / 60000);
        const seconds = Math.floor((timeInMs % 60000) / 1000);
        
        document.getElementById('timerHours').value = hours;
        document.getElementById('timerMinutes').value = minutes;
        document.getElementById('timerSeconds').value = seconds;
        document.getElementById('timer').textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Update timer functions to persist state
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
    saveTimerState();
}

function updateTimer() {
    const remaining = timerEndTime - Date.now();
    
    if (remaining <= 0) {
        clearInterval(timerInterval);
        document.getElementById('timer').textContent = '00:00:00';
        document.getElementById('startTimerBtn').style.display = 'inline-block';
        document.getElementById('pauseTimerBtn').style.display = 'none';
        playAlarm();
        saveTimerState();
        return;
    }
    
    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    document.getElementById('timer').textContent = 
        (hours ? (hours < 10 ? '0' + hours : hours) + ':' : '00:') +
        (minutes < 10 ? '0' + minutes : minutes) + ':' +
        (seconds < 10 ? '0' + seconds : seconds);
    
    saveTimerState();
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerPaused = true;
    timerRemainingTime = timerEndTime - Date.now();
    document.getElementById('startTimerBtn').style.display = 'inline-block';
    document.getElementById('pauseTimerBtn').style.display = 'none';
    saveTimerState();
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
    saveTimerState();
}

function restartTimer() {
    // Stop any playing alarm sound first
    stopAlarm();

    // Store current input values
    const hours = parseInt(document.getElementById('timerHours').value) || 0;
    const minutes = parseInt(document.getElementById('timerMinutes').value) || 0;
    const seconds = parseInt(document.getElementById('timerSeconds').value) || 0;

    if (hours === 0 && minutes === 0 && seconds === 0) {
        alert('Please set a time for the timer');
        return;
    }

    // Reset and start with the current values
    clearInterval(timerInterval);
    timerPaused = false;
    const totalMilliseconds = (hours * 3600 + minutes * 60 + seconds) * 1000;
    timerEndTime = Date.now() + totalMilliseconds;
    
    document.getElementById('startTimerBtn').style.display = 'none';
    document.getElementById('pauseTimerBtn').style.display = 'inline-block';
    
    timerInterval = setInterval(updateTimer, 10);
    saveTimerState();
}

// Timer functionality (timer.html)
function initializeTimer() {
    // Clear any previous timer state
    clearInterval(timerInterval);
    timerPaused = false;
    timerRemainingTime = 0;
    
    // Reset display
    const timerDisplay = document.getElementById('timer');
    if (timerDisplay) {
        timerDisplay.textContent = '00:00:00';
    }
    
    // Reset input fields
    ['timerHours', 'timerMinutes', 'timerSeconds'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.value = '';
        }
    });
    
    // Reset button states
    const startBtn = document.getElementById('startTimerBtn');
    const pauseBtn = document.getElementById('pauseTimerBtn');
    if (startBtn) startBtn.style.display = 'inline-block';
    if (pauseBtn) pauseBtn.style.display = 'none';

    loadTimerState();
    initializeAudio();
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

// Initialize social sharing functionality
function initializeSocialSharing() {
    // Add event listeners for social sharing buttons if needed
}

// Social sharing functions
function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent('Check out bbclock - an awesome virtual clock!');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}`, '_blank');
}

function shareOnTwitter() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('Check out bbclock - featuring world clock, timezone search, stopwatch, timer, and alarm features!');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
}

function shareOnPinterest() {
    const url = encodeURIComponent(window.location.href);
    const description = encodeURIComponent('bbclock - Online Clock with Stopwatch and Alarm');
    const media = encodeURIComponent(window.location.origin + '/favicon-svg.svg');
    window.open(`https://pinterest.com/pin/create/button/?url=${url}&media=${media}&description=${description}`, '_blank');
}

function shareOnReddit() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent('bbclock - Online Clock with Stopwatch and Alarm');
    window.open(`https://reddit.com/submit?url=${url}&title=${title}`, '_blank');
}

function shareOnLinkedIn() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent('bbclock - Online Clock with Stopwatch and Alarm');
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
}

// Add visibility change and error handling
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        checkAlarmState();
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        switch(currentPage) {
            case 'index.html':
                updateClock();
                break;
            case 'stopwatch.html':
                initializeStopwatch(); // Use initialize instead of load
                break;
            case 'timer.html':
                loadTimerState();
                break;
            case 'alarm.html':
                loadSavedAlarms();
                break;
        }
    }
});

// Error handling for async operations
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    switch(currentPage) {
        case 'stopwatch.html':
            resetStopwatch();
            break;
        case 'timer.html':
            resetTimer();
            break;
        case 'alarm.html':
            stopAlarmAll();
            break;
    }
});

// Save states before page unload
window.addEventListener('beforeunload', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    switch(currentPage) {
        case 'stopwatch.html':
            saveStopwatchState();
            break;
        case 'timer.html':
            saveTimerState();
            break;
        case 'alarm.html':
            saveAlarms();
            break;
    }
});

function handleCitySearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    const searchResults = document.getElementById('citySearchResults');

    if (searchTerm.length < 2) {
        searchResults.style.display = 'none';
        return;
    }

    // Search in city mappings first
    const cityMatches = Object.entries(cityMappings)
        .filter(([city]) => city.includes(searchTerm))
        .map(([city, tz]) => ({
            displayName: city.charAt(0).toUpperCase() + city.slice(1),
            timezone: tz
        }));

    // Then search in timezone names
    const tzMatches = timezones
        .filter(tz => {
            const lowerTz = tz.toLowerCase();
            return !cityMatches.some(match => match.timezone === tz) && // Avoid duplicates
                (lowerTz.includes(searchTerm) ||
                 lowerTz.replace(/_/g, ' ').includes(searchTerm));
        })
        .map(tz => ({
            displayName: tz.replace(/_/g, ' '),
            timezone: tz
        }));

    const allMatches = [...cityMatches, ...tzMatches].slice(0, 10); // Limit to 10 results

    if (allMatches.length === 0) {
        searchResults.style.display = 'none';
        return;
    }

    searchResults.innerHTML = allMatches
        .map(match => `<div class="search-result-item" data-timezone="${match.timezone}">
            ${match.displayName}
        </div>`)
        .join('');
    
    searchResults.style.display = 'block';

    // Add click handlers to search results
    document.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            const timezone = item.getAttribute('data-timezone');
            saveTimezone(timezone);
            searchResults.style.display = 'none';
            event.target.value = item.textContent.trim();
        });
    });
}

// Improve audio initialization with better error handling and state management
async function initializeAudio() {
    try {
        alarmSound = document.getElementById('alarmSound');
        if (!alarmSound) {
            alarmSound = new Audio('https://cdn.pixabay.com/audio/2021/08/04/audio_c668156e64.mp3');
            alarmSound.id = 'alarmSound';
            alarmSound.loop = true;
            document.body.appendChild(alarmSound);
        }

        // Force load the audio
        await new Promise((resolve, reject) => {
            alarmSound.addEventListener('loadeddata', resolve);
            alarmSound.addEventListener('error', reject);
            alarmSound.load();
        });

        // Initialize audio context and try to get permission
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            const audioContext = new AudioContext();
            await audioContext.resume();
        }

        // Pre-load and unlock audio on iOS
        const unlockAudio = () => {
            alarmSound.play().then(() => {
                alarmSound.pause();
                alarmSound.currentTime = 0;
                document.removeEventListener('click', unlockAudio);
                document.removeEventListener('touchstart', unlockAudio);
            }).catch(console.warn);
        };
        document.addEventListener('click', unlockAudio, { once: true });
        document.addEventListener('touchstart', unlockAudio, { once: true });

        return true;
    } catch (error) {
        console.warn('Audio initialization error:', error);
        return false;
    }
}

// Enhanced alarm playback function
async function playAlarm() {
    if (!alarmSound) {
        await initializeAudio();
    }

    if (alarmSound) {
        try {
            // Ensure we start from the beginning
            alarmSound.currentTime = 0;
            
            // Try to play using AudioContext if available
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                const audioContext = new AudioContext();
                await audioContext.resume();
            }
            
            // Play the sound
            await alarmSound.play();
            isAlarmRinging = true;
            
            // Show the alert with the stop button
            showVisualAlert();
        } catch (error) {
            console.error('Error playing alarm:', error);
            // Still show visual alert even if audio fails
            showVisualAlert();
        }
    } else {
        showVisualAlert();
    }
}

// Improved stop alarm function
function stopAlarm() {
    if (alarmSound) {
        alarmSound.pause();
        alarmSound.currentTime = 0;
    }
    
    isAlarmRinging = false;

    // Hide visual alert
    const alertContainer = document.getElementById('alertContainer');
    if (alertContainer) {
        alertContainer.innerHTML = '';
    }
}

// Enhanced visual alert
function showVisualAlert() {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;

    // Clear any existing alerts
    alertContainer.innerHTML = '';

    const visualAlert = document.createElement('div');
    visualAlert.className = 'visual-alert';
    visualAlert.innerHTML = `
        ⏰ ALARM!
    `;

    alertContainer.appendChild(visualAlert);
}

// Check alarm state when page visibility changes
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        if (isAlarmRinging && alarmSound) {
            // Restart alarm sound if it was playing
            playAlarm();
        }
    }
});

// Test sound function with better error handling
async function testSound() {
    if (!alarmSound) {
        await initializeAudio();
    }

    if (alarmSound) {
        try {
            alarmSound.currentTime = 0;
            await alarmSound.play();
            
            // Stop after 2 seconds if not already stopped
            setTimeout(() => {
                if (!isAlarmRinging) {
                    alarmSound.pause();
                    alarmSound.currentTime = 0;
                }
            }, 2000);
        } catch (error) {
            console.error('Error testing sound:', error);
            alert('Could not play sound. Please check your browser settings.');
        }
    }
}

// Initialize alarms on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeAudio().then(() => {
        loadSavedAlarms();
        checkAlarmState();
    });
});

// Check if alarm should be playing (on page load or navigation)
function checkAlarmState() {
    if (isAlarmRinging) {
        showVisualAlert();
        if (alarmSound && alarmSound.paused) {
            playAlarm();
        }
    }
}
