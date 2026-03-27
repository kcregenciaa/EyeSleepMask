document.addEventListener('DOMContentLoaded', function () {
<<<<<<< Updated upstream
=======
    const sleepDial = document.querySelector('.sleep-dial');

    const toMinutes = function (value) {
        if (!value || !value.includes(':')) {
            return null;
        }

        const parts = value.split(':');
        const hours = Number(parts[0]);
        const minutes = Number(parts[1]);

        if (Number.isNaN(hours) || Number.isNaN(minutes)) {
            return null;
        }

        return (hours * 60) + minutes;
    };

    const formatTime = function (value) {
        const mins = toMinutes(value);
        if (mins === null) {
            return '--:--';
        }

        const hour24 = Math.floor(mins / 60) % 24;
        const minute = mins % 60;
        const period = hour24 >= 12 ? 'PM' : 'AM';
        const hour12 = (hour24 % 12) || 12;
        return String(hour12).padStart(2, '0') + ':' + String(minute).padStart(2, '0') + ' ' + period;
    };

    const updateSleepDial = function () {
        if (!sleepDial) {
            return;
        }

        const bedtime = toMinutes(sleepDial.dataset.bedtime);
        const alarmEnd = toMinutes(sleepDial.dataset.alarmEnd);

        if (bedtime === null || alarmEnd === null) {
            return;
        }

        const startDeg = (bedtime / 1440) * 360;
        let endDeg = (alarmEnd / 1440) * 360;

        if (endDeg <= startDeg) {
            endDeg += 360;
        }

        sleepDial.style.setProperty('--sleep-start', startDeg + 'deg');
        sleepDial.style.setProperty('--sleep-end', endDeg + 'deg');

        const startMarker = sleepDial.querySelector('.sleep-marker-start');
        const endMarker = sleepDial.querySelector('.sleep-marker-end');

        if (startMarker) {
            startMarker.style.setProperty('--angle', startDeg + 'deg');
        }

        if (endMarker) {
            endMarker.style.setProperty('--angle', endDeg + 'deg');
        }
    };

    const closeAllPanels = function () {
        document.querySelectorAll('.sleep-edit-panel').forEach(function (panel) {
            panel.hidden = true;
        });
    };

    if (sleepDial) {
        updateSleepDial();

        const bedtimeDisplay = document.querySelector('[data-display="bedtime"]');
        const alarmDisplay = document.querySelector('[data-display="alarm"]');
        const bedtimeInput = document.getElementById('bedtimeInput');
        const alarmStartInput = document.getElementById('alarmStartInput');
        const alarmEndInput = document.getElementById('alarmEndInput');
        const sleepWindowStorageKey = 'sleepTrackerWindow';

        const persistSleepWindow = function () {
            const payload = {
                bedtime: sleepDial.dataset.bedtime || '',
                alarmStart: sleepDial.dataset.alarmStart || '',
                alarmEnd: sleepDial.dataset.alarmEnd || ''
            };

            try {
                localStorage.setItem(sleepWindowStorageKey, JSON.stringify(payload));
            } catch (error) {
                // Ignore storage failures so tracker still functions.
            }
        };

        try {
            const storedWindow = localStorage.getItem(sleepWindowStorageKey);
            if (storedWindow) {
                const parsedWindow = JSON.parse(storedWindow);
                if (parsedWindow && typeof parsedWindow === 'object') {
                    if (typeof parsedWindow.bedtime === 'string' && parsedWindow.bedtime.includes(':')) {
                        sleepDial.dataset.bedtime = parsedWindow.bedtime;
                        if (bedtimeInput) {
                            bedtimeInput.value = parsedWindow.bedtime;
                        }
                    }

                    if (typeof parsedWindow.alarmStart === 'string' && parsedWindow.alarmStart.includes(':')) {
                        sleepDial.dataset.alarmStart = parsedWindow.alarmStart;
                        if (alarmStartInput) {
                            alarmStartInput.value = parsedWindow.alarmStart;
                        }
                    }

                    if (typeof parsedWindow.alarmEnd === 'string' && parsedWindow.alarmEnd.includes(':')) {
                        sleepDial.dataset.alarmEnd = parsedWindow.alarmEnd;
                        if (alarmEndInput) {
                            alarmEndInput.value = parsedWindow.alarmEnd;
                        }
                    }
                }
            }
        } catch (error) {
            // Ignore malformed storage values.
        }

        updateSleepDial();

        if (bedtimeDisplay && sleepDial.dataset.bedtime) {
            bedtimeDisplay.textContent = formatTime(sleepDial.dataset.bedtime);
        }

        if (alarmDisplay && sleepDial.dataset.alarmStart && sleepDial.dataset.alarmEnd) {
            alarmDisplay.textContent = formatTime(sleepDial.dataset.alarmStart) + '-' + formatTime(sleepDial.dataset.alarmEnd);
        }

        document.querySelectorAll('.sleep-edit-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const key = btn.dataset.edit;
                const panel = document.querySelector('[data-panel="' + key + '"]');

                if (!panel) {
                    return;
                }

                const willOpen = panel.hidden;
                closeAllPanels();
                panel.hidden = !willOpen;
            });
        });

        document.querySelectorAll('.sleep-edit-cancel').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const key = btn.dataset.cancel;
                const panel = document.querySelector('[data-panel="' + key + '"]');
                if (panel) {
                    panel.hidden = true;
                }
            });
        });

        const bedtimePanel = document.querySelector('[data-panel="bedtime"]');
        if (bedtimePanel) {
            bedtimePanel.addEventListener('submit', function (event) {
                event.preventDefault();
                if (!bedtimeInput || !bedtimeInput.value) {
                    return;
                }

                sleepDial.dataset.bedtime = bedtimeInput.value;

                if (bedtimeDisplay) {
                    bedtimeDisplay.textContent = formatTime(bedtimeInput.value);
                }

                updateSleepDial();
                persistSleepWindow();
                bedtimePanel.hidden = true;
            });
        }

        const alarmPanel = document.querySelector('[data-panel="alarm"]');
        if (alarmPanel) {
            alarmPanel.addEventListener('submit', function (event) {
                event.preventDefault();
                if (!alarmStartInput || !alarmEndInput || !alarmStartInput.value || !alarmEndInput.value) {
                    return;
                }

                sleepDial.dataset.alarmStart = alarmStartInput.value;
                sleepDial.dataset.alarmEnd = alarmEndInput.value;

                if (alarmDisplay) {
                    alarmDisplay.textContent = formatTime(alarmStartInput.value) + '-' + formatTime(alarmEndInput.value);
                }

                updateSleepDial();
                persistSleepWindow();
                alarmPanel.hidden = true;
            });
        }

        persistSleepWindow();

        window.addEventListener('resize', updateSleepDial);
    }

    const discoverTabs = document.querySelectorAll('.discover-tab');
    const discoverPanels = document.querySelectorAll('.discover-panel');

    if (discoverTabs.length && discoverPanels.length) {
        discoverTabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                const selected = tab.dataset.discoverTab;

                discoverTabs.forEach(function (item) {
                    const isActive = item.dataset.discoverTab === selected;
                    item.classList.toggle('active', isActive);
                    item.setAttribute('aria-selected', String(isActive));
                });

                discoverPanels.forEach(function (panel) {
                    panel.hidden = panel.dataset.discoverPanel !== selected;
                });

                const discoverCard = document.querySelector('.discover-card');
                if (discoverCard) {
                    setTimeout(function () {
                        discoverCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 50);
                }
            });
        });
    }

    const mixSummary = document.getElementById('mixSummary');
    const mixSliders = document.querySelectorAll('.mix-slider');

    if (mixSummary && mixSliders.length) {
        const labelMap = {
            rain: 'Rain',
            waves: 'Waves',
            wind: 'Wind',
            chimes: 'Chimes'
        };

        const refreshMixSummary = function () {
            const activeLayers = [];

            mixSliders.forEach(function (slider) {
                const key = slider.dataset.key || '';
                const value = Number(slider.value || 0);
                const valueNode = document.querySelector('[data-mix-value="' + key + '"]');

                if (valueNode) {
                    valueNode.textContent = value + '%';
                }

                if (value > 0) {
                    activeLayers.push((labelMap[key] || key) + ' ' + value + '%');
                }
            });

            mixSummary.textContent = activeLayers.length ? activeLayers.join(' + ') : 'No active layers yet';
        };

        mixSliders.forEach(function (slider) {
            slider.addEventListener('input', refreshMixSummary);
        });

        refreshMixSummary();
    }

    const dailyCalendarDays = document.getElementById('dailyCalendarDays');
    if (dailyCalendarDays) {
        const dailySelectedDate = document.getElementById('dailySelectedDate');
        const dailyCalendarRange = document.getElementById('dailyCalendarRange');
        const dailyPrevWeek = document.getElementById('dailyPrevWeek');
        const dailyNextWeek = document.getElementById('dailyNextWeek');

        const dailyBedtime = document.getElementById('dailyBedtime');
        const dailyAlarm = document.getElementById('dailyAlarm');
        const dailyGoalValue = document.getElementById('dailyGoalValue');
        const dailyWentBed = document.getElementById('dailyWentBed');
        const dailyWokeUp = document.getElementById('dailyWokeUp');
        const dailyInBed = document.getElementById('dailyInBed');
        const dailyAsleep = document.getElementById('dailyAsleep');
        const dailyAwake = document.getElementById('dailyAwake');
        const dailyNoise = document.getElementById('dailyNoise');
        const dailyPerformanceSummary = document.getElementById('dailyPerformanceSummary');
        const dailyNoteInput = document.getElementById('dailyNoteInput');
        const dailyTrackNowBtn = document.getElementById('dailyTrackNowBtn');
        const dailySleepNowBtn = document.getElementById('dailySleepNowBtn');

        const sleepFlowLayer = document.getElementById('sleepFlowLayer');
        const sleepPopupCharge = document.getElementById('sleepPopupCharge');
        const sleepPopupAudio = document.getElementById('sleepPopupAudio');
        const sleepIntroScreen = document.getElementById('sleepIntroScreen');
        const sleepSessionScreen = document.getElementById('sleepSessionScreen');

        const sleepPopupDoneBtn = document.getElementById('sleepPopupDoneBtn');
        const sleepPopupSkipChargeBtn = document.getElementById('sleepPopupSkipChargeBtn');
        const sleepPopupGotItBtn = document.getElementById('sleepPopupGotItBtn');
        const sleepPopupSkipAudioBtn = document.getElementById('sleepPopupSkipAudioBtn');
        const sleepWakeBtn = document.getElementById('sleepWakeBtn');
        const sleepEndNowBtn = document.getElementById('sleepEndNowBtn');

        const sleepSessionTime = document.getElementById('sleepSessionTime');
        const sleepSessionPeriod = document.getElementById('sleepSessionPeriod');
        const sleepSessionAlarm = document.getElementById('sleepSessionAlarm');
        const sleepSessionCountdown = document.getElementById('sleepSessionCountdown');
        const sleepSessionNoise = document.getElementById('sleepSessionNoise');

        const noteStorageKey = 'dailyTrackerNotes';
        let notesByDate = {};

        try {
            const storedNotes = localStorage.getItem(noteStorageKey);
            if (storedNotes) {
                const parsedNotes = JSON.parse(storedNotes);
                if (parsedNotes && typeof parsedNotes === 'object') {
                    notesByDate = parsedNotes;
                }
            }
        } catch (error) {
            notesByDate = {};
        }

        const pad = function (value) {
            return String(value).padStart(2, '0');
        };

        const cloneDate = function (date) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate());
        };

        const addDays = function (date, days) {
            const next = cloneDate(date);
            next.setDate(next.getDate() + days);
            return next;
        };

        const dateKey = function (date) {
            return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
        };

        const to12Hour = function (hour24, minute) {
            const period = hour24 >= 12 ? 'PM' : 'AM';
            const hour12 = (hour24 % 12) || 12;
            return pad(hour12) + ':' + pad(minute) + ' ' + period;
        };

        const formatDuration = function (minutesTotal) {
            const hrs = Math.floor(minutesTotal / 60);
            const mins = minutesTotal % 60;
            return hrs + ' h ' + mins + ' m';
        };

        const monthLabel = function (date) {
            return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
        };

        const fullDateLabel = function (date) {
            return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
        };

        const weekStartMonday = function (date) {
            const d = cloneDate(date);
            const jsDay = d.getDay();
            const offset = jsDay === 0 ? -6 : 1 - jsDay;
            d.setDate(d.getDate() + offset);
            return d;
        };

        const buildPerformance = function (date) {
            const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
            const bedtimeHour = 22 + (seed % 3);
            const bedtimeMinute = [5, 12, 20, 28, 35, 42, 50][seed % 7];

            const wakeHour = 5 + ((seed >> 1) % 4);
            const wakeMinute = [0, 10, 18, 25, 32, 40, 50][(seed >> 2) % 7];

            const bedtimeInMinutes = (bedtimeHour * 60) + bedtimeMinute;
            const wakeInMinutes = (wakeHour * 60) + wakeMinute;
            const inBedMinutes = (24 * 60 - bedtimeInMinutes) + wakeInMinutes;

            const awakeMinutes = 8 + (seed % 22);
            const asleepMinutes = Math.max(inBedMinutes - awakeMinutes, 270);

            const goalHours = 5 + (seed % 4);
            const alarmStartHour = wakeHour;
            const alarmStartMinute = wakeMinute;
            const alarmEndMinuteTotal = wakeInMinutes + 30;
            const alarmEndHour = Math.floor(alarmEndMinuteTotal / 60) % 24;
            const alarmEndMinute = alarmEndMinuteTotal % 60;

            const sleepQuality = asleepMinutes >= 420 ? 'strong' : (asleepMinutes >= 360 ? 'steady' : 'light');
            const noiseDb = 20 + (seed % 11);

            return {
                bedtime: to12Hour(bedtimeHour % 24, bedtimeMinute),
                alarm: to12Hour(alarmStartHour % 24, alarmStartMinute) + '-' + to12Hour(alarmEndHour, alarmEndMinute),
                goal: goalHours + ' h',
                wentToBed: to12Hour(bedtimeHour % 24, bedtimeMinute),
                wokeUp: to12Hour(wakeHour % 24, wakeMinute),
                inBed: formatDuration(inBedMinutes),
                asleep: formatDuration(asleepMinutes),
                awake: awakeMinutes + ' min',
                noise: noiseDb + ' dB',
                summary: sleepQuality === 'strong'
                    ? 'Excellent recovery night with deep, steady sleep.'
                    : (sleepQuality === 'steady'
                        ? 'Balanced night with stable sleep performance.'
                        : 'Lighter sleep detected. Try a calmer wind-down tonight.')
            };
        };

        const today = cloneDate(new Date());
        let selected = cloneDate(today);
        let weekOffset = 0;

        const saveNotes = function () {
            try {
                localStorage.setItem(noteStorageKey, JSON.stringify(notesByDate));
            } catch (error) {
                // Ignore storage failures so UI keeps working.
            }
        };

        const sleepWindowStorageKey = 'sleepTrackerWindow';
        const sleepReminderPrefsKey = 'sleepReminderPrefs';
        const sleepSessionStateKey = 'sleepSessionState';
        const introDelayMs = 2600;
        let sleepTickTimer = null;
        let sleepNoiseTimer = null;
        let sleepIntroTimer = null;
        let activeSleepSession = null;

        let sleepReminderPrefs = {
            chargeReminder: true,
            audioReminder: true
        };

        try {
            const storedPrefs = localStorage.getItem(sleepReminderPrefsKey);
            if (storedPrefs) {
                const parsedPrefs = JSON.parse(storedPrefs);
                if (parsedPrefs && typeof parsedPrefs === 'object') {
                    if (typeof parsedPrefs.chargeReminder === 'boolean') {
                        sleepReminderPrefs.chargeReminder = parsedPrefs.chargeReminder;
                    }
                    if (typeof parsedPrefs.audioReminder === 'boolean') {
                        sleepReminderPrefs.audioReminder = parsedPrefs.audioReminder;
                    }
                }
            }
        } catch (error) {
            sleepReminderPrefs = { chargeReminder: true, audioReminder: true };
        }

        const saveReminderPrefs = function () {
            try {
                localStorage.setItem(sleepReminderPrefsKey, JSON.stringify(sleepReminderPrefs));
            } catch (error) {
                // Ignore storage failures so flow still works.
            }
        };

        const getSleepInterval = function () {
            const fallback = {
                bedtime: '00:20',
                alarmStart: '04:50',
                alarmEnd: '05:20'
            };

            try {
                const storedWindow = localStorage.getItem(sleepWindowStorageKey);
                if (!storedWindow) {
                    return fallback;
                }

                const parsedWindow = JSON.parse(storedWindow);
                if (!parsedWindow || typeof parsedWindow !== 'object') {
                    return fallback;
                }

                return {
                    bedtime: (typeof parsedWindow.bedtime === 'string' && parsedWindow.bedtime.includes(':')) ? parsedWindow.bedtime : fallback.bedtime,
                    alarmStart: (typeof parsedWindow.alarmStart === 'string' && parsedWindow.alarmStart.includes(':')) ? parsedWindow.alarmStart : fallback.alarmStart,
                    alarmEnd: (typeof parsedWindow.alarmEnd === 'string' && parsedWindow.alarmEnd.includes(':')) ? parsedWindow.alarmEnd : fallback.alarmEnd
                };
            } catch (error) {
                return fallback;
            }
        };

        const sessionDurationFromInterval = function (interval) {
            const startMinutes = toMinutes(interval.bedtime);
            const endMinutes = toMinutes(interval.alarmEnd);

            if (startMinutes === null || endMinutes === null) {
                return 5 * 60;
            }

            let duration = endMinutes - startMinutes;
            if (duration <= 0) {
                duration += 24 * 60;
            }

            return duration;
        };

        const hideSleepScreens = function () {
            if (sleepPopupCharge) {
                sleepPopupCharge.hidden = true;
            }
            if (sleepPopupAudio) {
                sleepPopupAudio.hidden = true;
            }
            if (sleepIntroScreen) {
                sleepIntroScreen.hidden = true;
            }
            if (sleepSessionScreen) {
                sleepSessionScreen.hidden = true;
            }
        };

        const openSleepLayer = function () {
            if (!sleepFlowLayer) {
                return;
            }

            sleepFlowLayer.hidden = false;
            document.body.classList.add('sleep-flow-active');
        };

        const closeSleepLayer = function () {
            if (sleepFlowLayer) {
                sleepFlowLayer.hidden = true;
            }
            hideSleepScreens();
            document.body.classList.remove('sleep-flow-active');
        };

        const clearSleepTimers = function () {
            if (sleepTickTimer) {
                clearInterval(sleepTickTimer);
                sleepTickTimer = null;
            }

            if (sleepNoiseTimer) {
                clearInterval(sleepNoiseTimer);
                sleepNoiseTimer = null;
            }

            if (sleepIntroTimer) {
                clearTimeout(sleepIntroTimer);
                sleepIntroTimer = null;
            }
        };

        const endSleepSession = function () {
            try {
                localStorage.removeItem(sleepSessionStateKey);
            } catch (error) {
                // Ignore storage failures.
            }

            activeSleepSession = null;
            clearSleepTimers();
            closeSleepLayer();
        };

        const renderSessionClock = function () {
            if (!activeSleepSession) {
                return;
            }

            const now = Date.now();
            const nowDate = new Date(now);
            const timeText = nowDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
            const parts = timeText.split(' ');

            if (sleepSessionTime) {
                sleepSessionTime.textContent = parts[0] || '--:--';
            }

            if (sleepSessionPeriod) {
                sleepSessionPeriod.textContent = parts[1] || '';
            }

            const remainingMs = Math.max(activeSleepSession.endAt - now, 0);
            const remainingMinutes = Math.ceil(remainingMs / 60000);
            const remainingHours = Math.floor(remainingMinutes / 60);
            const remainingMins = remainingMinutes % 60;

            if (sleepSessionCountdown) {
                sleepSessionCountdown.textContent = 'Session ends in ' + remainingHours + ' h ' + remainingMins + ' m';
            }

            if (remainingMs <= 0) {
                try {
                    localStorage.removeItem(sleepSessionStateKey);
                } catch (error) {
                    // Ignore storage failures.
                }
                activeSleepSession = null;
                clearSleepTimers();
                closeSleepLayer();
            }
        };

        const startNoiseTicker = function () {
            if (!sleepSessionNoise) {
                return;
            }

            const setNoise = function () {
                const noiseVal = 58 + Math.floor(Math.random() * 16);
                sleepSessionNoise.textContent = noiseVal + ' dB';
            };

            setNoise();
            sleepNoiseTimer = setInterval(setNoise, 60000);
        };

        const showFinalSession = function () {
            if (!sleepSessionScreen) {
                return;
            }

            hideSleepScreens();
            sleepSessionScreen.hidden = false;
            openSleepLayer();

            if (sleepSessionAlarm && activeSleepSession) {
                sleepSessionAlarm.textContent = activeSleepSession.alarmRange;
            }

            clearSleepTimers();
            renderSessionClock();
            sleepTickTimer = setInterval(renderSessionClock, 60000);
            startNoiseTicker();
        };

        const saveSessionState = function () {
            if (!activeSleepSession) {
                return;
            }

            try {
                localStorage.setItem(sleepSessionStateKey, JSON.stringify(activeSleepSession));
            } catch (error) {
                // Ignore storage failures.
            }
        };

        const beginSession = function () {
            const interval = getSleepInterval();
            const durationMinutes = sessionDurationFromInterval(interval);
            const startAt = Date.now();
            const endAt = startAt + (durationMinutes * 60000);

            activeSleepSession = {
                startAt: startAt,
                endAt: endAt,
                durationMinutes: durationMinutes,
                alarmRange: formatTime(interval.alarmStart) + '-' + formatTime(interval.alarmEnd)
            };

            saveSessionState();
            showFinalSession();
        };

        const showIntroThenFinal = function () {
            if (!sleepIntroScreen) {
                beginSession();
                return;
            }

            hideSleepScreens();
            sleepIntroScreen.hidden = false;
            openSleepLayer();

            clearSleepTimers();
            sleepIntroTimer = setTimeout(function () {
                beginSession();
            }, introDelayMs);
        };

        const goToNextPopup = function () {
            if (sleepReminderPrefs.audioReminder && sleepPopupAudio) {
                hideSleepScreens();
                sleepPopupAudio.hidden = false;
                openSleepLayer();
            } else {
                showIntroThenFinal();
            }
        };

        const openSleepNowFlow = function () {
            if (sleepReminderPrefs.chargeReminder && sleepPopupCharge) {
                hideSleepScreens();
                sleepPopupCharge.hidden = false;
                openSleepLayer();
            } else {
                goToNextPopup();
            }
        };

        const closeActivePopupOnly = function (target) {
            if (target === 'charge') {
                if (sleepPopupCharge) {
                    sleepPopupCharge.hidden = true;
                }
                closeSleepLayer();
                return;
            }

            if (target === 'audio') {
                if (sleepPopupAudio) {
                    sleepPopupAudio.hidden = true;
                }
                closeSleepLayer();
            }
        };

        document.querySelectorAll('[data-sleep-close]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                closeActivePopupOnly(btn.dataset.sleepClose || '');
            });
        });

        const syncNoteField = function (date) {
            if (!dailyNoteInput) {
                return;
            }

            const key = dateKey(date);
            dailyNoteInput.value = notesByDate[key] || '';
            dailyNoteInput.placeholder = 'Write what happened during your sleep on ' + fullDateLabel(date) + '...';
        };

        const applyPerformance = function (date) {
            const perf = buildPerformance(date);

            if (dailySelectedDate) {
                dailySelectedDate.textContent = fullDateLabel(date);
            }

            if (dailyBedtime) {
                dailyBedtime.textContent = perf.bedtime;
            }

            if (dailyAlarm) {
                dailyAlarm.textContent = perf.alarm;
            }

            if (dailyGoalValue) {
                dailyGoalValue.textContent = perf.goal;
            }

            if (dailyWentBed) {
                dailyWentBed.textContent = perf.wentToBed;
            }

            if (dailyWokeUp) {
                dailyWokeUp.textContent = perf.wokeUp;
            }

            if (dailyInBed) {
                dailyInBed.textContent = perf.inBed;
            }

            if (dailyAsleep) {
                dailyAsleep.textContent = perf.asleep;
            }

            if (dailyAwake) {
                dailyAwake.textContent = perf.awake;
            }

            if (dailyNoise) {
                dailyNoise.textContent = perf.noise;
            }

            if (dailyPerformanceSummary) {
                dailyPerformanceSummary.textContent = perf.summary;
            }

            syncNoteField(date);
        };

        const renderWeek = function () {
            const weekStart = addDays(weekStartMonday(today), weekOffset * -7);
            const weekEnd = addDays(weekStart, 6);

            if (dailyCalendarRange) {
                dailyCalendarRange.textContent = monthLabel(weekStart) + ' - ' + monthLabel(weekEnd);
            }

            if (dailyNextWeek) {
                dailyNextWeek.disabled = weekOffset === 0;
            }

            dailyCalendarDays.innerHTML = '';

            for (let i = 0; i < 7; i += 1) {
                const day = addDays(weekStart, i);
                const btn = document.createElement('button');
                const isFuture = day > today;
                const isSelected = dateKey(day) === dateKey(selected);
                const isToday = dateKey(day) === dateKey(today);

                btn.type = 'button';
                btn.className = 'daily-day-btn';
                if (isSelected) {
                    btn.classList.add('active');
                }
                if (isToday) {
                    btn.classList.add('is-today');
                }
                if (isFuture) {
                    btn.classList.add('is-future');
                }

                btn.disabled = isFuture;
                btn.dataset.key = dateKey(day);
                btn.innerHTML = '<span class="day-num">' + day.getDate() + '</span>';

                btn.addEventListener('click', function () {
                    if (isFuture) {
                        return;
                    }

                    selected = cloneDate(day);
                    applyPerformance(selected);
                    renderWeek();
                });

                dailyCalendarDays.appendChild(btn);
            }
        };

        if (dailyPrevWeek) {
            dailyPrevWeek.addEventListener('click', function () {
                weekOffset += 1;
                renderWeek();
            });
        }

        if (dailyNextWeek) {
            dailyNextWeek.addEventListener('click', function () {
                if (weekOffset > 0) {
                    weekOffset -= 1;
                    renderWeek();
                }
            });
        }

        if (dailyNoteInput) {
            dailyNoteInput.addEventListener('input', function () {
                const key = dateKey(selected);
                const noteValue = dailyNoteInput.value.trim();

                if (noteValue) {
                    notesByDate[key] = noteValue;
                } else {
                    delete notesByDate[key];
                }

                saveNotes();
            });
        }

        if (dailyTrackNowBtn) {
            dailyTrackNowBtn.addEventListener('click', function () {
                openSleepNowFlow();
            });
        }

        if (dailySleepNowBtn) {
            dailySleepNowBtn.addEventListener('click', function () {
                openSleepNowFlow();
            });
        }

        if (sleepPopupDoneBtn) {
            sleepPopupDoneBtn.addEventListener('click', function () {
                goToNextPopup();
            });
        }

        if (sleepPopupSkipChargeBtn) {
            sleepPopupSkipChargeBtn.addEventListener('click', function () {
                sleepReminderPrefs.chargeReminder = false;
                saveReminderPrefs();
                goToNextPopup();
            });
        }

        if (sleepPopupGotItBtn) {
            sleepPopupGotItBtn.addEventListener('click', function () {
                showIntroThenFinal();
            });
        }

        if (sleepPopupSkipAudioBtn) {
            sleepPopupSkipAudioBtn.addEventListener('click', function () {
                sleepReminderPrefs.audioReminder = false;
                saveReminderPrefs();
                showIntroThenFinal();
            });
        }

        if (sleepWakeBtn) {
            let pressTimer = null;

            const clearPress = function () {
                if (pressTimer) {
                    clearTimeout(pressTimer);
                    pressTimer = null;
                }
            };

            const startPress = function () {
                clearPress();
                pressTimer = setTimeout(function () {
                    endSleepSession();
                    clearPress();
                }, 1200);
            };

            sleepWakeBtn.addEventListener('mousedown', startPress);
            sleepWakeBtn.addEventListener('touchstart', startPress, { passive: true });
            sleepWakeBtn.addEventListener('mouseup', clearPress);
            sleepWakeBtn.addEventListener('mouseleave', clearPress);
            sleepWakeBtn.addEventListener('touchend', clearPress);
            sleepWakeBtn.addEventListener('touchcancel', clearPress);
        }

        if (sleepEndNowBtn) {
            sleepEndNowBtn.addEventListener('click', function () {
                endSleepSession();
            });
        }

        try {
            const savedSession = localStorage.getItem(sleepSessionStateKey);
            if (savedSession) {
                const parsedSession = JSON.parse(savedSession);
                if (parsedSession && typeof parsedSession === 'object' && Number(parsedSession.endAt) > Date.now()) {
                    activeSleepSession = parsedSession;
                    showFinalSession();
                } else {
                    localStorage.removeItem(sleepSessionStateKey);
                }
            }
        } catch (error) {
            // Ignore malformed session state.
        }

        applyPerformance(selected);
        renderWeek();
    }

    const movementTrackerRoot = document.getElementById('movementTrackerRoot');
    if (movementTrackerRoot) {
        const movementDateInput = document.getElementById('movementDateInput');
        const movementSleeperType = document.getElementById('movementSleeperType');
        const movementScore = document.getElementById('movementScore');
        const movementTurns = document.getElementById('movementTurns');
        const movementStillPeriod = document.getElementById('movementStillPeriod');
        const movementInsight = document.getElementById('movementInsight');
        const movementHeatStrip = document.getElementById('movementHeatStrip');

        const movementPatternChart = document.getElementById('movementPatternChart');
        const movementStyleChart = document.getElementById('movementStyleChart');

        const now = new Date();
        const dateForInput = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');

        if (movementDateInput) {
            movementDateInput.max = dateForInput;
            movementDateInput.value = dateForInput;
        }

        let patternChartInstance = null;
        let styleChartInstance = null;

        const seeded = function (seed) {
            const x = Math.sin(seed) * 10000;
            return x - Math.floor(x);
        };

        const buildMovementData = function (dateValue) {
            const seedBase = Number(String(dateValue || '').replace(/-/g, '')) || 20260327;
            const points = [];
            const labels = [];

            for (let i = 0; i < 32; i += 1) {
                const raw = seeded(seedBase + (i * 17));
                const wave = (Math.sin((i / 32) * Math.PI * 4) + 1) / 2;
                const value = Math.round((raw * 68) + (wave * 20));
                points.push(Math.max(4, Math.min(98, value)));

                const totalMins = 15 * i;
                const h = Math.floor(totalMins / 60);
                const m = totalMins % 60;
                labels.push(String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'));
            }

            return {
                labels: labels,
                points: points
            };
        };

        const classifySleeper = function (points) {
            const avg = points.reduce(function (sum, p) { return sum + p; }, 0) / points.length;
            const turns = points.filter(function (p) { return p >= 66; }).length;
            const stillWindows = points.filter(function (p) { return p <= 30; }).length;
            const longestStill = stillWindows * 15;

            let type = 'Balanced sleeper';
            let insight = 'Your movement pattern is moderate and fairly stable through the night.';

            if (avg <= 34 && turns <= 4) {
                type = 'Still sleeper';
                insight = 'You remained mostly calm and still, which often aligns with deeper uninterrupted sleep.';
            } else if (avg >= 57 || turns >= 10) {
                type = 'Mischievous sleeper';
                insight = 'Frequent movements were detected. Consider adjusting pillow support and room comfort.';
            }

            return {
                type: type,
                avg: Math.round(avg),
                turns: turns,
                longestStill: longestStill,
                stillPercent: Math.round((points.filter(function (p) { return p <= 40; }).length / points.length) * 100),
                activePercent: Math.round((points.filter(function (p) { return p > 40; }).length / points.length) * 100),
                insight: insight
            };
        };

        const renderHeatStrip = function (points) {
            if (!movementHeatStrip) {
                return;
            }

            movementHeatStrip.innerHTML = '';

            points.forEach(function (value) {
                const cell = document.createElement('span');
                cell.className = 'movement-heat-cell';
                cell.style.height = (18 + Math.round((value / 100) * 72)) + 'px';
                cell.style.opacity = String(0.42 + (value / 170));
                movementHeatStrip.appendChild(cell);
            });
        };

        const renderMovement = function (dateValue) {
            const movement = buildMovementData(dateValue);
            const profile = classifySleeper(movement.points);

            if (movementSleeperType) {
                movementSleeperType.textContent = profile.type;
            }

            if (movementScore) {
                movementScore.textContent = String(profile.avg);
            }

            if (movementTurns) {
                movementTurns.textContent = String(profile.turns);
            }

            if (movementStillPeriod) {
                movementStillPeriod.textContent = profile.longestStill + ' min';
            }

            if (movementInsight) {
                movementInsight.textContent = profile.insight;
            }

            renderHeatStrip(movement.points);

            if (typeof Chart !== 'undefined' && movementPatternChart) {
                if (patternChartInstance) {
                    patternChartInstance.destroy();
                }

                patternChartInstance = new Chart(movementPatternChart, {
                    type: 'line',
                    data: {
                        labels: movement.labels,
                        datasets: [{
                            label: 'Movement intensity',
                            data: movement.points,
                            borderColor: '#53d0ff',
                            backgroundColor: 'rgba(83, 208, 255, 0.18)',
                            fill: true,
                            tension: 0.32,
                            pointRadius: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: {
                                min: 0,
                                max: 100,
                                grid: { color: 'rgba(121, 167, 217, 0.18)' },
                                ticks: { color: '#99afc8' }
                            },
                            x: {
                                grid: { display: false },
                                ticks: {
                                    color: '#99afc8',
                                    maxTicksLimit: 8
                                }
                            }
                        }
                    }
                });
            }

            if (typeof Chart !== 'undefined' && movementStyleChart) {
                if (styleChartInstance) {
                    styleChartInstance.destroy();
                }

                styleChartInstance = new Chart(movementStyleChart, {
                    type: 'doughnut',
                    data: {
                        labels: ['Still', 'Active'],
                        datasets: [{
                            data: [profile.stillPercent, profile.activePercent],
                            backgroundColor: ['#5ad4ff', '#8d65ff'],
                            borderWidth: 0,
                            hoverOffset: 3
                        }]
                    },
                    options: {
                        cutout: '70%',
                        plugins: {
                            legend: {
                                labels: {
                                    color: '#d4e3f6'
                                }
                            }
                        }
                    }
                });
            }
        };

        if (movementDateInput) {
            movementDateInput.addEventListener('change', function () {
                renderMovement(movementDateInput.value || dateForInput);
            });
        }

        renderMovement(dateForInput);
    }

>>>>>>> Stashed changes
    const chartDefaults = {
        color: '#99afc8',
        borderColor: 'rgba(121, 167, 217, 0.18)',
        tickColor: 'rgba(110, 148, 192, 0.16)'
    };

    const revenueCanvas = document.getElementById('revenueChart');
    if (revenueCanvas) {
        new Chart(revenueCanvas, {
            type: 'line',
            data: {
                labels: ['W1', 'W2', 'W3', 'W4'],
                datasets: [{
                    data: [120, 380, 300, 650],
                    borderColor: '#8bd8ff',
                    backgroundColor: 'rgba(90, 201, 255, 0.16)',
                    fill: true,
                    tension: 0.36,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        grid: { color: chartDefaults.borderColor },
                        ticks: { color: chartDefaults.color }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: chartDefaults.color }
                    }
                }
            }
        });
    }

    const barCanvas = document.getElementById('barChart');
    if (barCanvas) {
        new Chart(barCanvas, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                datasets: [{
                    data: [90, 180, 95, 160, 70],
                    borderRadius: 8,
                    backgroundColor: ['#6a88ab', '#8ea5c6', '#6a88ab', '#8ea5c6', '#6a88ab']
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        grid: { color: chartDefaults.borderColor },
                        ticks: { color: chartDefaults.color }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: chartDefaults.color }
                    }
                }
            }
        });
    }

    const engagementCanvas = document.getElementById('engagementChart');
    if (engagementCanvas) {
        new Chart(engagementCanvas, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    data: [180, 220, 300, 380, 420, 500, 550, 610, 680, 720, 800, 890],
                    borderColor: '#afc8e4',
                    backgroundColor: 'rgba(162, 188, 218, 0.12)',
                    fill: true,
                    tension: 0.35,
                    pointBackgroundColor: '#e3f1ff',
                    pointBorderWidth: 0,
                    pointRadius: 2
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        grid: { color: chartDefaults.borderColor },
                        ticks: { color: chartDefaults.color }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: chartDefaults.color }
                    }
                }
            }
        });
    }

    const accelCanvas = document.getElementById('accelChart');
    if (accelCanvas) {
        new Chart(accelCanvas, {
            type: 'bar',
            data: {
                labels: ['X', 'Y', 'Z'],
                datasets: [{
                    data: [0.2, 0.1, 9.8],
                    borderRadius: 6,
                    backgroundColor: ['#57d0ff', '#57d0ff', '#8bd8ff']
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        grid: { color: chartDefaults.borderColor },
                        ticks: { color: chartDefaults.color },
                        max: 10
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: chartDefaults.color }
                    }
                }
            }
        });
    }
});
