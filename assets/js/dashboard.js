document.addEventListener('DOMContentLoaded', function () {
    const sleepDial = document.querySelector('.sleep-dial');
    const alarmToggle = document.getElementById('alarmToggle');
    const smartAlarmToggle = document.getElementById('smartAlarmToggle');

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

    const isAlarmEnabled = function () {
        return !alarmToggle || alarmToggle.checked;
    };

    const updateSleepDial = function () {
        if (!sleepDial) {
            return;
        }

        sleepDial.classList.toggle('alarm-off', !isAlarmEnabled());

        const bedtime = toMinutes(sleepDial.dataset.bedtime);
        const alarmEnd = toMinutes(sleepDial.dataset.alarmEnd);

        if (bedtime === null || alarmEnd === null) {
            return;
        }

        const startDeg = (bedtime / 1440) * 360;
        const endDeg = (alarmEnd / 1440) * 360;
        const spanMinutesRaw = (alarmEnd - bedtime + 1440) % 1440;
        const spanMinutes = spanMinutesRaw === 0 ? 1440 : spanMinutesRaw;
        const spanDeg = (spanMinutes / 1440) * 360;

        sleepDial.style.setProperty('--sleep-start', startDeg + 'deg');
        sleepDial.style.setProperty('--sleep-span', spanDeg + 'deg');

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
        document.querySelectorAll('.sleep-time-row').forEach(function (row) {
            row.classList.remove('sleep-time-row-hidden');
        });
    };

    if (sleepDial) {
        updateSleepDial();

        const bedtimeDisplay = document.querySelector('[data-display="bedtime"]');
        const alarmDisplay = document.querySelector('[data-display="alarm"]');
        const totalSleepDisplay = document.querySelector('[data-display="total-sleep"]');
        const sleepHoursNumberDisplay = document.querySelector('[data-display="sleep-hours-number"]');
        const sleepMinutesNumberDisplay = document.querySelector('[data-display="sleep-minutes-number"]');
        const bedtimeInput = document.getElementById('bedtimeInput');
        const alarmEndInput = document.getElementById('alarmEndInput');
        const sleepArc = sleepDial.querySelector('.sleep-dial-arc');
        const markerButtons = sleepDial.querySelectorAll('[data-marker]');
        const sleepWindowStorageKey = 'sleepTrackerWindow';
        const alarmDayToggles = document.querySelectorAll('[data-alarm-day]');
        const alarmDayGroup = document.querySelector('[data-repeat-list]');
        const repeatOpenButton = document.querySelector('[data-repeat-open]');
        const repeatModal = document.getElementById('repeatModal');
        const repeatCloseButtons = repeatModal ? repeatModal.querySelectorAll('[data-repeat-close]') : [];
        const snoozeOpenButton = document.querySelector('[data-snooze-open]');
        const snoozeModal = document.getElementById('snoozeModal');
        const snoozeCloseButtons = snoozeModal ? snoozeModal.querySelectorAll('[data-snooze-close]') : [];
        const snoozeWheel = document.querySelector('[data-snooze-wheel]');
        const snoozeItems = snoozeWheel ? Array.from(snoozeWheel.querySelectorAll('[data-snooze-minute]')) : [];
        const snoozeDisplay = document.querySelector('[data-display="snooze-minutes"]');
        const sleepReminderToggle = document.getElementById('sleepReminderToggle');
        const sleepReminderHint = document.querySelector('[data-sleep-reminder-hint]');
        const wakeupOpenButton = document.querySelector('[data-wakeup-open]');
        const wakeupModal = document.getElementById('wakeupModal');
        const wakeupCloseButtons = wakeupModal ? wakeupModal.querySelectorAll('[data-wakeup-close]') : [];
        const wakeupWheel = document.querySelector('[data-wakeup-wheel]');
        const wakeupItems = wakeupWheel ? Array.from(wakeupWheel.querySelectorAll('[data-wakeup-minute]')) : [];
        const wakeupDisplay = document.querySelector('[data-display="wakeup-period"]');
        const wakeupRow = document.querySelector('[data-smart-alarm-row]');
        const alarmRepeatDisplay = document.querySelector('[data-display="alarm-repeat"]');
        const dialStepMinutes = 5;
        const minSleepWindowMinutes = 1 * 60;
        const maxSleepWindowMinutes = 20 * 60;
        let suppressMarkerClick = false;
        let modalScrollY = 0;
        let sleepReminderTimer = null;
        let lastReminderBedtime = '';
        const sleepReminderEnabledKey = 'sleepReminderEnabled';

        const openSleepModal = function (modal) {
            if (!modal) {
                return;
            }

            modalScrollY = window.scrollY || 0;
            document.body.style.top = '-' + modalScrollY + 'px';
            modal.hidden = false;
            document.body.classList.add('sleep-repeat-open');
        };

        const closeSleepModal = function (modal) {
            if (!modal) {
                return;
            }

            modal.hidden = true;
            document.body.classList.remove('sleep-repeat-open');
            document.body.style.top = '';
            window.scrollTo(0, modalScrollY);
        };

        const sleepWindowMinutes = function (startMinutes, endMinutes) {
            if (startMinutes === null || endMinutes === null) {
                return null;
            }

            let duration = endMinutes - startMinutes;
            if (duration <= 0) {
                duration += 1440;
            }

            return duration;
        };

        const isAllowedWindow = function (startMinutes, endMinutes) {
            const duration = sleepWindowMinutes(startMinutes, endMinutes);
            if (duration === null) {
                return false;
            }

            return duration >= minSleepWindowMinutes && duration <= maxSleepWindowMinutes;
        };

        const minutesToTimeValue = function (minutesValue) {
            const normalized = ((minutesValue % 1440) + 1440) % 1440;
            const hours = Math.floor(normalized / 60);
            const minutes = normalized % 60;
            return String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
        };

        const formatSleepDuration = function (totalMinutes) {
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;

            if (minutes === 0) {
                return hours + ' h';
            }

            return hours + ' h ' + String(minutes).padStart(2, '0') + ' m';
        };

        const formatSleepHoursNumber = function (totalMinutes) {
            const hours = Math.floor(totalMinutes / 60);
            return String(hours).padStart(2, '0');
        };

        const formatSleepMinutesNumber = function (totalMinutes) {
            const minutes = totalMinutes % 60;
            return String(minutes).padStart(2, '0') + ' min';
        };

        const clearSleepReminderTimer = function () {
            if (sleepReminderTimer) {
                clearTimeout(sleepReminderTimer);
                sleepReminderTimer = null;
            }
        };

        const requestSleepNotificationPermission = function () {
            if (!('Notification' in window)) {
                return Promise.resolve('unsupported');
            }

            if (Notification.permission === 'granted') {
                return Promise.resolve('granted');
            }

            return Notification.requestPermission();
        };

        const getNextBedtimeDate = function (bedtimeValue) {
            const minutes = toMinutes(bedtimeValue);
            if (minutes === null) {
                return null;
            }

            const now = new Date();
            const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            target.setMinutes(minutes);

            if (target.getTime() <= now.getTime()) {
                target.setDate(target.getDate() + 1);
            }

            return target;
        };

        const scheduleSleepReminder = function (forceReschedule) {
            if (!sleepReminderToggle || !sleepReminderToggle.checked) {
                clearSleepReminderTimer();
                return;
            }

            if (!('Notification' in window) || Notification.permission !== 'granted') {
                clearSleepReminderTimer();
                if (sleepReminderHint) {
                    sleepReminderHint.hidden = false;
                }
                return;
            }

            if (sleepReminderHint) {
                sleepReminderHint.hidden = true;
            }

            const bedtimeValue = sleepDial.dataset.bedtime || (bedtimeInput ? bedtimeInput.value : '');
            if (!bedtimeValue) {
                return;
            }

            if (!forceReschedule && lastReminderBedtime === bedtimeValue && sleepReminderTimer) {
                return;
            }

            lastReminderBedtime = bedtimeValue;
            clearSleepReminderTimer();

            const nextBedtime = getNextBedtimeDate(bedtimeValue);
            if (!nextBedtime) {
                return;
            }

            const delayMs = Math.max(nextBedtime.getTime() - Date.now(), 0);
            sleepReminderTimer = setTimeout(function () {
                if (Notification.permission === 'granted') {
                    new Notification('Time to sleep', {
                        body: 'Bedtime is now. Ready to wind down?'
                    });
                }
                scheduleSleepReminder(true);
            }, delayMs);
        };

        const syncSleepFields = function () {
            updateSleepDial();

            if (bedtimeInput && sleepDial.dataset.bedtime) {
                bedtimeInput.value = sleepDial.dataset.bedtime;
            }

            if (alarmEndInput && sleepDial.dataset.alarmEnd) {
                alarmEndInput.value = sleepDial.dataset.alarmEnd;
            }

            if (bedtimeDisplay && sleepDial.dataset.bedtime) {
                bedtimeDisplay.textContent = formatTime(sleepDial.dataset.bedtime);
            }

            if (alarmDisplay) {
                if (!isAlarmEnabled()) {
                    alarmDisplay.textContent = 'Off';
                } else if (sleepDial.dataset.alarmEnd) {
                    alarmDisplay.textContent = formatTime(sleepDial.dataset.alarmEnd);
                }
            }

            const totalSleepMinutes = sleepWindowMinutes(toMinutes(sleepDial.dataset.bedtime), toMinutes(sleepDial.dataset.alarmEnd));
            if (totalSleepDisplay && totalSleepMinutes !== null) {
                totalSleepDisplay.textContent = formatSleepDuration(totalSleepMinutes);
            }

            if (sleepHoursNumberDisplay && totalSleepMinutes !== null) {
                sleepHoursNumberDisplay.textContent = formatSleepHoursNumber(totalSleepMinutes);
            }

            if (sleepMinutesNumberDisplay && totalSleepMinutes !== null) {
                sleepMinutesNumberDisplay.textContent = formatSleepMinutesNumber(totalSleepMinutes);
            }

            scheduleSleepReminder(false);
        };

        const setBedtimeFromMinutes = function (minutesValue, shouldPersist) {
            const normalizedBedtime = ((minutesValue % 1440) + 1440) % 1440;
            const currentAlarmEnd = toMinutes(sleepDial.dataset.alarmEnd);

            if (!isAllowedWindow(normalizedBedtime, currentAlarmEnd)) {
                return false;
            }

            sleepDial.dataset.bedtime = minutesToTimeValue(normalizedBedtime);
            syncSleepFields();

            if (shouldPersist) {
                persistSleepWindow();
            }

            return true;
        };

        const setAlarmEndFromMinutes = function (minutesValue, shouldPersist) {
            const currentStart = toMinutes(sleepDial.dataset.alarmStart);
            const currentEnd = toMinutes(sleepDial.dataset.alarmEnd);
            let alarmWindowMinutes = 30;

            if (currentStart !== null && currentEnd !== null) {
                alarmWindowMinutes = currentEnd - currentStart;
                if (alarmWindowMinutes <= 0) {
                    alarmWindowMinutes += 1440;
                }
            }

            if (alarmWindowMinutes < dialStepMinutes) {
                alarmWindowMinutes = dialStepMinutes;
            }

            const normalizedEnd = ((minutesValue % 1440) + 1440) % 1440;
            const currentBedtime = toMinutes(sleepDial.dataset.bedtime);

            if (!isAllowedWindow(currentBedtime, normalizedEnd)) {
                return false;
            }

            const normalizedStart = (normalizedEnd - alarmWindowMinutes + 1440) % 1440;

            sleepDial.dataset.alarmStart = minutesToTimeValue(normalizedStart);
            sleepDial.dataset.alarmEnd = minutesToTimeValue(normalizedEnd);
            syncSleepFields();

            if (shouldPersist) {
                persistSleepWindow();
            }

            return true;
        };

        const adjustMarkerByStep = function (key, stepMinutes) {
            if (!key || !Number.isFinite(stepMinutes) || stepMinutes === 0) {
                return;
            }

            if (key === 'bedtime') {
                const current = toMinutes(sleepDial.dataset.bedtime);
                if (current === null) {
                    return;
                }

                const moved = setBedtimeFromMinutes(current + stepMinutes, false);
                if (!moved) {
                    shiftSleepWindowByMinutes(stepMinutes, true);
                    return;
                }

                persistSleepWindow();
            }

            if (key === 'alarm') {
                const current = toMinutes(sleepDial.dataset.alarmEnd);
                if (current === null) {
                    return;
                }

                const moved = setAlarmEndFromMinutes(current + stepMinutes, false);
                if (!moved) {
                    shiftSleepWindowByMinutes(stepMinutes, true);
                    return;
                }

                persistSleepWindow();
            }
        };

        const shiftSleepWindowByMinutes = function (deltaMinutes, shouldPersist) {
            if (!Number.isFinite(deltaMinutes) || deltaMinutes === 0) {
                return false;
            }

            const currentBedtime = toMinutes(sleepDial.dataset.bedtime);
            const currentAlarmEnd = toMinutes(sleepDial.dataset.alarmEnd);

            if (currentBedtime === null || currentAlarmEnd === null) {
                return false;
            }

            const duration = sleepWindowMinutes(currentBedtime, currentAlarmEnd);
            if (duration === null) {
                return false;
            }

            const normalizedBedtime = ((currentBedtime + deltaMinutes) % 1440 + 1440) % 1440;
            const normalizedAlarmEnd = ((currentAlarmEnd + deltaMinutes) % 1440 + 1440) % 1440;

            if (!isAllowedWindow(normalizedBedtime, normalizedAlarmEnd)) {
                return false;
            }

            sleepDial.dataset.bedtime = minutesToTimeValue(normalizedBedtime);
            sleepDial.dataset.alarmEnd = minutesToTimeValue(normalizedAlarmEnd);

            // Update hidden inputs directly before dispatching events
            if (bedtimeInput) {
                bedtimeInput.value = minutesToTimeValue(normalizedBedtime);
            }
            if (alarmEndInput) {
                alarmEndInput.value = minutesToTimeValue(normalizedAlarmEnd);
            }

            syncSleepFields();

            // Trigger input events on edit inputs to update wheel picker displays
            if (bedtimeInput) {
                bedtimeInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (alarmEndInput) {
                alarmEndInput.dispatchEvent(new Event('input', { bubbles: true }));
            }

            if (shouldPersist) {
                persistSleepWindow();
            }

            return true;
        };

        const minutesFromPointer = function (clientX, clientY) {
            const rect = sleepDial.getBoundingClientRect();
            const centerX = rect.left + (rect.width / 2);
            const centerY = rect.top + (rect.height / 2);
            const dx = clientX - centerX;
            const dy = clientY - centerY;

            if (dx === 0 && dy === 0) {
                return null;
            }

            const angle = (Math.atan2(dy, dx) * (180 / Math.PI) + 90 + 360) % 360;
            const rawMinutes = (angle / 360) * 1440;
            const snapped = Math.round(rawMinutes / dialStepMinutes) * dialStepMinutes;
            return snapped % 1440;
        };

        const nearestWrappedMinutes = function (targetMinutes, referenceMinutes) {
            if (targetMinutes === null || referenceMinutes === null) {
                return targetMinutes;
            }

            const options = [
                targetMinutes,
                targetMinutes + 1440,
                targetMinutes - 1440
            ];

            let best = options[0];
            let bestDistance = Math.abs(options[0] - referenceMinutes);

            options.forEach(function (value) {
                const distance = Math.abs(value - referenceMinutes);
                if (distance < bestDistance) {
                    best = value;
                    bestDistance = distance;
                }
            });

            return best;
        };

        const persistSleepWindow = function () {
            const payload = {
                bedtime: sleepDial.dataset.bedtime || '',
                alarmEnd: sleepDial.dataset.alarmEnd || '',
                snoozeMinutes: Number(sleepDial.dataset.snoozeMinutes || 15),
                wakeupMinutes: Number(sleepDial.dataset.wakeupMinutes || 30),
                alarmDays: Array.from(alarmDayToggles).filter(function (toggle) {
                    return toggle.checked;
                }).map(function (toggle) {
                    return toggle.dataset.alarmDay || '';
                }).filter(function (value) {
                    return value !== '';
                })
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

                    if (typeof parsedWindow.alarmEnd === 'string' && parsedWindow.alarmEnd.includes(':')) {
                        sleepDial.dataset.alarmEnd = parsedWindow.alarmEnd;
                        if (alarmEndInput) {
                            alarmEndInput.value = parsedWindow.alarmEnd;
                        }
                    }

                    if (Array.isArray(parsedWindow.alarmDays) && alarmDayToggles.length) {
                        alarmDayToggles.forEach(function (toggle) {
                            const key = toggle.dataset.alarmDay || '';
                            toggle.checked = parsedWindow.alarmDays.includes(key);
                        });
                    }

                    if (Number.isFinite(parsedWindow.snoozeMinutes)) {
                        const snoozeValue = Math.min(15, Math.max(1, parsedWindow.snoozeMinutes));
                        sleepDial.dataset.snoozeMinutes = String(snoozeValue);
                    }

                    if (Number.isFinite(parsedWindow.wakeupMinutes)) {
                        const wakeupValue = Math.min(60, Math.max(5, parsedWindow.wakeupMinutes));
                        sleepDial.dataset.wakeupMinutes = String(wakeupValue);
                    }
                }
            }
        } catch (error) {
            // Ignore malformed storage values.
        }

        if (!sleepDial.dataset.snoozeMinutes) {
            sleepDial.dataset.snoozeMinutes = '15';
        }

        if (!sleepDial.dataset.wakeupMinutes) {
            sleepDial.dataset.wakeupMinutes = '30';
        }

        const getSelectedAlarmDays = function () {
            return Array.from(alarmDayToggles).filter(function (toggle) {
                return toggle.checked;
            }).map(function (toggle) {
                return toggle.dataset.alarmDay || '';
            }).filter(function (value) {
                return value !== '';
            });
        };

        const updateAlarmRepeatDisplay = function () {
            if (!alarmRepeatDisplay) {
                return;
            }

            if (alarmToggle && !alarmToggle.checked) {
                alarmRepeatDisplay.textContent = 'Off';
                return;
            }

            const dayOrder = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
            const dayLabels = {
                sun: 'Sunday',
                mon: 'Monday',
                tue: 'Tuesday',
                wed: 'Wednesday',
                thu: 'Thursday',
                fri: 'Friday',
                sat: 'Saturday'
            };

            const selectedDays = getSelectedAlarmDays();
            if (!selectedDays.length) {
                alarmRepeatDisplay.textContent = 'Never';
                return;
            }

            if (selectedDays.length === dayOrder.length) {
                alarmRepeatDisplay.textContent = 'Every day';
                return;
            }

            const orderedLabels = dayOrder.filter(function (key) {
                return selectedDays.includes(key);
            }).map(function (key) {
                return dayLabels[key];
            });

            alarmRepeatDisplay.textContent = orderedLabels.map(function (day) {
                return 'Every ' + day;
            }).join(', ');
        };

        updateAlarmRepeatDisplay();

        const updateSnoozeDisplay = function () {
            if (!snoozeDisplay) {
                return;
            }

            const snoozeValue = Number(sleepDial.dataset.snoozeMinutes || 15);
            snoozeDisplay.textContent = snoozeValue + ' min';
        };

        updateSnoozeDisplay();

        const updateWakeupDisplay = function () {
            if (!wakeupDisplay) {
                return;
            }

            const wakeupValue = Number(sleepDial.dataset.wakeupMinutes || 30);
            wakeupDisplay.textContent = wakeupValue + ' min';
        };

        updateWakeupDisplay();

        const syncSnoozeWheelPadding = function () {
            if (!snoozeWheel) {
                return;
            }

            const itemHeight = parseFloat(getComputedStyle(snoozeWheel).getPropertyValue('--snooze-item-height')) || 48;
            const pad = Math.max(0, (snoozeWheel.clientHeight / 2) - (itemHeight / 2));
            snoozeWheel.style.setProperty('--snooze-wheel-pad', pad + 'px');
        };

        const syncWakeupWheelPadding = function () {
            if (!wakeupWheel) {
                return;
            }

            const itemHeight = parseFloat(getComputedStyle(wakeupWheel).getPropertyValue('--snooze-item-height')) || 48;
            const pad = Math.max(0, (wakeupWheel.clientHeight / 2) - (itemHeight / 2));
            wakeupWheel.style.setProperty('--snooze-wheel-pad', pad + 'px');
        };

        const setSnoozeActive = function (value, shouldScroll) {
            if (!snoozeItems.length || !snoozeWheel) {
                return;
            }

            const clamped = Math.min(15, Math.max(1, value));
            sleepDial.dataset.snoozeMinutes = String(clamped);
            updateSnoozeDisplay();

            snoozeItems.forEach(function (item) {
                const itemValue = Number(item.dataset.snoozeMinute);
                item.classList.toggle('is-active', itemValue === clamped);
            });

            if (shouldScroll) {
                scrollSnoozeToValue(clamped, true);
            }
        };

        const scrollSnoozeToValue = function (value, smooth) {
            if (!snoozeWheel || !snoozeItems.length) {
                return;
            }

            const activeItem = snoozeItems.find(function (item) {
                return Number(item.dataset.snoozeMinute) === value;
            });

            if (!activeItem) {
                return;
            }

            const padValue = parseFloat(getComputedStyle(snoozeWheel).getPropertyValue('--snooze-wheel-pad')) || 0;
            const targetTop = activeItem.offsetTop - padValue;

            snoozeWheel.scrollTo({
                top: targetTop,
                behavior: smooth ? 'smooth' : 'auto'
            });

            snoozeProgrammaticUntil = Date.now() + 200;
        };

        let wakeupProgrammaticUntil = 0;

        const setWakeupActive = function (value, shouldScroll) {
            if (!wakeupItems.length || !wakeupWheel) {
                return;
            }

            const clamped = Math.min(60, Math.max(5, value));
            sleepDial.dataset.wakeupMinutes = String(clamped);
            updateWakeupDisplay();

            wakeupItems.forEach(function (item) {
                const itemValue = Number(item.dataset.wakeupMinute);
                item.classList.toggle('is-active', itemValue === clamped);
            });

            if (shouldScroll) {
                scrollWakeupToValue(clamped, true);
            }
        };

        const scrollWakeupToValue = function (value, smooth) {
            if (!wakeupWheel || !wakeupItems.length) {
                return;
            }

            const activeItem = wakeupItems.find(function (item) {
                return Number(item.dataset.wakeupMinute) === value;
            });

            if (!activeItem) {
                return;
            }

            const padValue = parseFloat(getComputedStyle(wakeupWheel).getPropertyValue('--snooze-wheel-pad')) || 0;
            const targetTop = activeItem.offsetTop - padValue;

            wakeupWheel.scrollTo({
                top: targetTop,
                behavior: smooth ? 'smooth' : 'auto'
            });

            wakeupProgrammaticUntil = Date.now() + 200;
        };

        const updateWakeupFromScroll = function () {
            if (!wakeupItems.length || !wakeupWheel) {
                return;
            }

            const wheelRect = wakeupWheel.getBoundingClientRect();
            const wheelCenter = wheelRect.top + (wheelRect.height / 2);
            let closest = null;
            let smallest = Number.POSITIVE_INFINITY;

            wakeupItems.forEach(function (item) {
                const rect = item.getBoundingClientRect();
                const itemCenter = rect.top + (rect.height / 2);
                const distance = Math.abs(itemCenter - wheelCenter);
                if (distance < smallest) {
                    smallest = distance;
                    closest = item;
                }
            });

            if (closest) {
                const value = Number(closest.dataset.wakeupMinute);
                if (String(value) !== sleepDial.dataset.wakeupMinutes) {
                    setWakeupActive(value, false);
                }
            }
        };

        let wakeupSnapTimer = null;
        const scheduleWakeupSnap = function () {
            if (wakeupSnapTimer) {
                clearTimeout(wakeupSnapTimer);
            }
            wakeupSnapTimer = setTimeout(function () {
                const currentValue = Number(sleepDial.dataset.wakeupMinutes || 30);
                setWakeupActive(currentValue, true);
                persistSleepWindow();
            }, 120);
        };

        const updateSnoozeFromScroll = function () {
            if (!snoozeItems.length || !snoozeWheel) {
                return;
            }

            const wheelRect = snoozeWheel.getBoundingClientRect();
            const wheelCenter = wheelRect.top + (wheelRect.height / 2);
            let closest = null;
            let smallest = Number.POSITIVE_INFINITY;

            snoozeItems.forEach(function (item) {
                const rect = item.getBoundingClientRect();
                const itemCenter = rect.top + (rect.height / 2);
                const distance = Math.abs(itemCenter - wheelCenter);
                if (distance < smallest) {
                    smallest = distance;
                    closest = item;
                }
            });

            if (closest) {
                const value = Number(closest.dataset.snoozeMinute);
                if (String(value) !== sleepDial.dataset.snoozeMinutes) {
                    setSnoozeActive(value, false);
                }
            }
        };

        let snoozeSnapTimer = null;
        let snoozeProgrammaticUntil = 0;
        const scheduleSnoozeSnap = function () {
            if (snoozeSnapTimer) {
                clearTimeout(snoozeSnapTimer);
            }
            snoozeSnapTimer = setTimeout(function () {
                const currentValue = Number(sleepDial.dataset.snoozeMinutes || 15);
                setSnoozeActive(currentValue, true);
                persistSleepWindow();
            }, 120);
        };



        syncSleepFields();

        const syncEditRowVisibility = function () {
            document.querySelectorAll('.sleep-edit-panel').forEach(function (panel) {
                const row = panel.previousElementSibling;
                if (!row || !row.classList.contains('sleep-time-row')) {
                    return;
                }

                row.classList.toggle('sleep-time-row-hidden', !panel.hidden);
            });
        };

        const syncDialFromEditInputs = function () {
            let bedtimeValue = null;
            let alarmEndValue = null;
            
            if (bedtimeInput && bedtimeInput.value) {
                bedtimeValue = bedtimeInput.value;
            }

            if (alarmEndInput && alarmEndInput.value) {
                alarmEndValue = alarmEndInput.value;
            }

            // Validate 1-hour minimum sleep duration constraint
            if (bedtimeValue && alarmEndValue) {
                if (!isAllowedWindow(toMinutes(bedtimeValue), toMinutes(alarmEndValue))) {
                    // Validation failed, don't sync
                    return;
                }
            }

            sleepDial.dataset.bedtime = bedtimeValue || sleepDial.dataset.bedtime;
            if (alarmEndValue) {
                sleepDial.dataset.alarmEnd = alarmEndValue;
            }

            syncSleepFields();
        };

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
                syncEditRowVisibility();
            });
        });

        const openSleepPanel = function (key) {
            const panel = document.querySelector('[data-panel="' + key + '"]');

            if (!panel) {
                return;
            }

            closeAllPanels();
            panel.hidden = false;
            syncEditRowVisibility();

            if (key === 'bedtime' && bedtimeInput) {
                bedtimeInput.focus();
            }

            if (key === 'alarm' && alarmEndInput) {
                if (!isAlarmEnabled()) {
                    return;
                }
                alarmEndInput.focus();
            }

            panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        };

        markerButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                if (suppressMarkerClick) {
                    suppressMarkerClick = false;
                    return;
                }

                const key = button.dataset.marker;
                if (!key) {
                    return;
                }

                if (key === 'alarm' && !isAlarmEnabled()) {
                    return;
                }

                openSleepPanel(key);
            });

            button.addEventListener('wheel', function (event) {
                const key = button.dataset.marker;
                if (!key) {
                    return;
                }

                if (key === 'alarm' && !isAlarmEnabled()) {
                    return;
                }

                event.preventDefault();
                const step = event.deltaY < 0 ? dialStepMinutes : -dialStepMinutes;
                adjustMarkerByStep(key, step);
            }, { passive: false });

            button.addEventListener('keydown', function (event) {
                const key = button.dataset.marker;
                if (!key) {
                    return;
                }

                if (key === 'alarm' && !isAlarmEnabled()) {
                    return;
                }

                const stepSize = event.shiftKey ? (dialStepMinutes * 3) : dialStepMinutes;
                let delta = 0;

                if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
                    delta = stepSize;
                }

                if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
                    delta = -stepSize;
                }

                if (delta === 0) {
                    return;
                }

                event.preventDefault();
                adjustMarkerByStep(key, delta);
            });

            button.addEventListener('pointerdown', function (event) {
                if (event.pointerType === 'mouse' && event.button !== 0) {
                    return;
                }

                const key = button.dataset.marker;
                if (!key) {
                    return;
                }

                if (key === 'alarm' && !isAlarmEnabled()) {
                    return;
                }

                let dragging = false;
                const startX = event.clientX;
                const startY = event.clientY;
                sleepDial.classList.add('sleep-dial-dragging');
                button.setPointerCapture(event.pointerId);

                const updateFromPointer = function (pointerEvent, shouldPersist) {
                    const draggedMinutes = minutesFromPointer(pointerEvent.clientX, pointerEvent.clientY);
                    if (draggedMinutes === null) {
                        return;
                    }

                    if (key === 'bedtime') {
                        const currentBedtime = toMinutes(sleepDial.dataset.bedtime);
                        const smoothBedtime = nearestWrappedMinutes(draggedMinutes, currentBedtime);
                        const delta = smoothBedtime - currentBedtime;
                        const moved = setBedtimeFromMinutes(smoothBedtime, false);
                        if (!moved && delta !== 0) {
                            shiftSleepWindowByMinutes(delta, false);
                        }
                    }

                    if (key === 'alarm') {
                        const currentAlarmEnd = toMinutes(sleepDial.dataset.alarmEnd);
                        const smoothAlarmEnd = nearestWrappedMinutes(draggedMinutes, currentAlarmEnd);
                        const delta = smoothAlarmEnd - currentAlarmEnd;
                        const moved = setAlarmEndFromMinutes(smoothAlarmEnd, false);
                        if (!moved && delta !== 0) {
                            shiftSleepWindowByMinutes(delta, false);
                        }
                    }
                };

                const handlePointerMove = function (moveEvent) {
                    const movedX = Math.abs(moveEvent.clientX - startX);
                    const movedY = Math.abs(moveEvent.clientY - startY);
                    if (!dragging && (movedX > 3 || movedY > 3)) {
                        dragging = true;
                    }

                    if (!dragging) {
                        return;
                    }

                    moveEvent.preventDefault();
                    updateFromPointer(moveEvent, false);
                };

                const cleanupPointerEvents = function () {
                    button.removeEventListener('pointermove', handlePointerMove);
                    button.removeEventListener('pointerup', handlePointerUp);
                    button.removeEventListener('pointercancel', handlePointerCancel);
                    sleepDial.classList.remove('sleep-dial-dragging');
                };

                const handlePointerUp = function () {
                    if (button.hasPointerCapture(event.pointerId)) {
                        button.releasePointerCapture(event.pointerId);
                    }

                    if (dragging) {
                        suppressMarkerClick = true;
                        persistSleepWindow();
                    }

                    cleanupPointerEvents();
                };

                const handlePointerCancel = function () {
                    if (button.hasPointerCapture(event.pointerId)) {
                        button.releasePointerCapture(event.pointerId);
                    }

                    cleanupPointerEvents();
                };

                button.addEventListener('pointermove', handlePointerMove);
                button.addEventListener('pointerup', handlePointerUp);
                button.addEventListener('pointercancel', handlePointerCancel);
            });
        });

        if (sleepArc) {
            sleepArc.addEventListener('pointerdown', function (event) {
                if (event.pointerType === 'mouse' && event.button !== 0) {
                    return;
                }

                if (!isAlarmEnabled()) {
                    return;
                }

                const currentBedtime = toMinutes(sleepDial.dataset.bedtime);
                const currentAlarmEnd = toMinutes(sleepDial.dataset.alarmEnd);
                if (!isAllowedWindow(currentBedtime, currentAlarmEnd)) {
                    return;
                }

                let dragging = false;
                const startX = event.clientX;
                const startY = event.clientY;
                let previousPointerMinutes = minutesFromPointer(event.clientX, event.clientY);
                sleepDial.classList.add('sleep-dial-dragging');
                sleepArc.setPointerCapture(event.pointerId);

                const handlePointerMove = function (moveEvent) {
                    const movedX = Math.abs(moveEvent.clientX - startX);
                    const movedY = Math.abs(moveEvent.clientY - startY);
                    if (!dragging && (movedX > 3 || movedY > 3)) {
                        dragging = true;
                    }

                    if (!dragging) {
                        return;
                    }

                    const pointerMinutes = minutesFromPointer(moveEvent.clientX, moveEvent.clientY);
                    if (pointerMinutes === null) {
                        return;
                    }

                    if (previousPointerMinutes === null) {
                        previousPointerMinutes = pointerMinutes;
                        return;
                    }

                    const smoothPointerMinutes = nearestWrappedMinutes(pointerMinutes, previousPointerMinutes);
                    const deltaMinutes = smoothPointerMinutes - previousPointerMinutes;
                    if (deltaMinutes === 0) {
                        return;
                    }

                    moveEvent.preventDefault();
                    shiftSleepWindowByMinutes(deltaMinutes, false);
                    previousPointerMinutes = smoothPointerMinutes;
                };

                const cleanupPointerEvents = function () {
                    sleepArc.removeEventListener('pointermove', handlePointerMove);
                    sleepArc.removeEventListener('pointerup', handlePointerUp);
                    sleepArc.removeEventListener('pointercancel', handlePointerCancel);
                    sleepDial.classList.remove('sleep-dial-dragging');
                };

                const handlePointerUp = function () {
                    if (sleepArc.hasPointerCapture(event.pointerId)) {
                        sleepArc.releasePointerCapture(event.pointerId);
                    }

                    if (dragging) {
                        persistSleepWindow();
                    }

                    cleanupPointerEvents();
                };

                const handlePointerCancel = function () {
                    if (sleepArc.hasPointerCapture(event.pointerId)) {
                        sleepArc.releasePointerCapture(event.pointerId);
                    }

                    cleanupPointerEvents();
                };

                sleepArc.addEventListener('pointermove', handlePointerMove);
                sleepArc.addEventListener('pointerup', handlePointerUp);
                sleepArc.addEventListener('pointercancel', handlePointerCancel);
            });
        }

        document.querySelectorAll('.sleep-edit-cancel').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const key = btn.dataset.cancel;
                const panel = document.querySelector('[data-panel="' + key + '"]');
                if (panel) {
                    panel.hidden = true;
                    syncEditRowVisibility();
                }
            });
        });

        const initCompactWheelPicker = function (pickerSelector, inputElement, displaySelector, includePeriodInDisplay) {
            const picker = document.querySelector(pickerSelector);
            if (!picker || !inputElement) {
                return;
            }

            const hoursCol = picker.querySelector('[data-column="hours"]');
            const minutesCol = picker.querySelector('[data-column="minutes"]');
            const periodCol = picker.querySelector('[data-column="period"]');

            const mod = function (value, base) {
                return ((value % base) + base) % base;
            };

            const formatTwo = function (value) {
                return String(value).padStart(2, '0');
            };

            const renderSlots = function () {
                const currentMinutes = toMinutes(inputElement.value);
                if (currentMinutes === null) {
                    return;
                }

                const hour24 = Math.floor(currentMinutes / 60) % 24;
                const minute = currentMinutes % 60;
                const currentHour12 = (hour24 % 12) || 12;
                const currentPeriod = hour24 >= 12 ? 'PM' : 'AM';

                if (hoursCol) {
                    const prev = hoursCol.querySelector('[data-slot="prev"]');
                    const current = hoursCol.querySelector('[data-slot="current"]');
                    const next = hoursCol.querySelector('[data-slot="next"]');
                    if (prev && current && next) {
                        prev.textContent = String(((currentHour12 + 10) % 12) + 1);
                        current.textContent = String(currentHour12);
                        next.textContent = String((currentHour12 % 12) + 1);
                    }
                }

                if (minutesCol) {
                    const prev = minutesCol.querySelector('[data-slot="prev"]');
                    const current = minutesCol.querySelector('[data-slot="current"]');
                    const next = minutesCol.querySelector('[data-slot="next"]');
                    if (prev && current && next) {
                        prev.textContent = formatTwo(mod(minute - 1, 60));
                        current.textContent = formatTwo(minute);
                        next.textContent = formatTwo(mod(minute + 1, 60));
                    }
                }

                if (periodCol) {
                    const prev = periodCol.querySelector('[data-slot="prev"]');
                    const current = periodCol.querySelector('[data-slot="current"]');
                    const next = periodCol.querySelector('[data-slot="next"]');
                    const opposite = currentPeriod === 'AM' ? 'PM' : 'AM';

                    if (prev && current && next) {
                        prev.textContent = '';
                        current.textContent = currentPeriod;
                        next.textContent = opposite;
                        current.classList.add('sleep-wheel-selected');
                        prev.classList.remove('sleep-wheel-selected');
                        next.classList.remove('sleep-wheel-selected');
                    }
                }

                document.querySelectorAll(displaySelector).forEach(function (el) {
                    const baseTime = formatTwo(currentHour12) + ':' + formatTwo(minute);
                    el.textContent = includePeriodInDisplay ? (baseTime + ' ' + currentPeriod) : baseTime;
                });
            };

            const stepColumn = function (columnType, direction) {
                const currentMinutes = toMinutes(inputElement.value);
                if (currentMinutes === null) {
                    return;
                }

                let hour24 = Math.floor(currentMinutes / 60) % 24;
                let minute = currentMinutes % 60;

                if (columnType === 'hours') {
                    hour24 = mod(hour24 + direction, 24);
                }

                if (columnType === 'minutes') {
                    minute = mod(minute + direction, 60);
                }

                if (columnType === 'period') {
                    hour24 = hour24 >= 12 ? hour24 - 12 : hour24 + 12;
                }

                const newTimeValue = minutesToTimeValue((hour24 * 60) + minute);
                
                // Validate 1-hour minimum sleep duration constraint
                if (inputElement === bedtimeInput) {
                    // When editing bedtime, check against alarmEnd
                    const alarmEndMinutes = toMinutes(sleepDial.dataset.alarmEnd);
                    const newBedtimeMinutes = toMinutes(newTimeValue);
                    if (!isAllowedWindow(newBedtimeMinutes, alarmEndMinutes)) {
                        return;
                    }
                } else if (inputElement === alarmEndInput) {
                    // When editing alarm, check against bedtime
                    const bedtimeMinutes = toMinutes(sleepDial.dataset.bedtime);
                    const newAlarmMinutes = toMinutes(newTimeValue);
                    if (!isAllowedWindow(bedtimeMinutes, newAlarmMinutes)) {
                        return;
                    }
                }

                inputElement.value = newTimeValue;
                renderSlots();
                syncDialFromEditInputs();
            };

            [hoursCol, minutesCol, periodCol].forEach(function (column) {
                if (!column) {
                    return;
                }

                const columnType = column.getAttribute('data-column');
                let wheelSteps = 0;
                let wheelFrame = null;

                const flushWheel = function () {
                    if (!wheelSteps) {
                        wheelFrame = null;
                        return;
                    }

                    stepColumn(columnType, wheelSteps > 0 ? 1 : -1);
                    wheelSteps += wheelSteps > 0 ? -1 : 1;
                    wheelFrame = requestAnimationFrame(flushWheel);
                };

                column.addEventListener('wheel', function (event) {
                    event.preventDefault();
                    const direction = event.deltaY > 0 ? 1 : -1;
                    const steps = Math.min(6, Math.ceil(Math.abs(event.deltaY) / 40));
                    wheelSteps += direction * steps;
                    if (!wheelFrame) {
                        wheelFrame = requestAnimationFrame(flushWheel);
                    }
                }, { passive: false });

                let dragging = false;
                let lastY = 0;
                let carry = 0;

                column.addEventListener('pointerdown', function (event) {
                    if (event.pointerType === 'mouse' && event.button !== 0) {
                        return;
                    }

                    dragging = true;
                    lastY = event.clientY;
                    carry = 0;
                    column.setPointerCapture(event.pointerId);
                });

                column.addEventListener('pointermove', function (event) {
                    if (!dragging) {
                        return;
                    }

                    const deltaY = event.clientY - lastY;
                    lastY = event.clientY;
                    carry += deltaY;

                    while (Math.abs(carry) >= 18) {
                        stepColumn(columnType, carry > 0 ? -1 : 1);
                        carry += carry > 0 ? -18 : 18;
                    }
                });

                const endDrag = function (event) {
                    if (!dragging) {
                        return;
                    }

                    dragging = false;
                    carry = 0;
                    if (column.hasPointerCapture(event.pointerId)) {
                        column.releasePointerCapture(event.pointerId);
                    }
                };

                column.addEventListener('pointerup', endDrag);
                column.addEventListener('pointercancel', endDrag);
            });

            renderSlots();

            inputElement.addEventListener('input', function (evt) {
                // Skip validation for programmatic updates (e.g., from marker dragging)
                if (!evt.isTrusted) {
                    renderSlots();
                    return;
                }

                // Validate constraint before rendering for user input
                if (inputElement === bedtimeInput) {
                    const alarmEndMinutes = toMinutes(sleepDial.dataset.alarmEnd);
                    const newBedtimeMinutes = toMinutes(inputElement.value);
                    if (!isAllowedWindow(newBedtimeMinutes, alarmEndMinutes)) {
                        return;
                    }
                } else if (inputElement === alarmEndInput) {
                    const bedtimeMinutes = toMinutes(sleepDial.dataset.bedtime);
                    const newAlarmMinutes = toMinutes(inputElement.value);
                    if (!isAllowedWindow(bedtimeMinutes, newAlarmMinutes)) {
                        return;
                    }
                }
                
                renderSlots();
                syncDialFromEditInputs();
            });

            inputElement.addEventListener('change', function (evt) {
                renderSlots();
                
                // Skip syncing to dial for programmatic updates (e.g., from marker dragging)
                if (evt.isTrusted) {
                    // Validate constraint before syncing for user input
                    if (inputElement === bedtimeInput) {
                        const alarmEndMinutes = toMinutes(sleepDial.dataset.alarmEnd);
                        const newBedtimeMinutes = toMinutes(inputElement.value);
                        if (!isAllowedWindow(newBedtimeMinutes, alarmEndMinutes)) {
                            return;
                        }
                    } else if (inputElement === alarmEndInput) {
                        const bedtimeMinutes = toMinutes(sleepDial.dataset.bedtime);
                        const newAlarmMinutes = toMinutes(inputElement.value);
                        if (!isAllowedWindow(bedtimeMinutes, newAlarmMinutes)) {
                            return;
                        }
                    }
                    syncDialFromEditInputs();
                }
            });
        };

        initCompactWheelPicker('[data-picker="bedtime"]', bedtimeInput, '[data-display="bedtime"]', true);
        initCompactWheelPicker('[data-picker="alarm-end"]', alarmEndInput, '[data-display="alarm-end"]', false);

        syncEditRowVisibility();

        const bedtimePanel = document.querySelector('[data-panel="bedtime"]');
        if (bedtimePanel) {
            bedtimePanel.addEventListener('submit', function (event) {
                event.preventDefault();
                if (!bedtimeInput || !bedtimeInput.value) {
                    return;
                }

                const nextBedtime = toMinutes(bedtimeInput.value);
                const currentAlarmEnd = toMinutes(sleepDial.dataset.alarmEnd);
                if (!isAllowedWindow(nextBedtime, currentAlarmEnd)) {
                    bedtimeInput.value = sleepDial.dataset.bedtime || bedtimeInput.value;
                    return;
                }

                sleepDial.dataset.bedtime = bedtimeInput.value;

                syncSleepFields();
                persistSleepWindow();
                bedtimePanel.hidden = true;
                syncEditRowVisibility();
            });
        }

        const alarmPanel = document.querySelector('[data-panel="alarm"]');
        const syncAlarmPanelState = function () {
            if (!alarmPanel || !alarmToggle) {
                return;
            }

            alarmPanel.classList.toggle('alarm-disabled', !alarmToggle.checked);
            if (alarmDayGroup) {
                alarmDayGroup.classList.toggle('is-disabled', !alarmToggle.checked);
            }
            alarmDayToggles.forEach(function (toggle) {
                toggle.disabled = !alarmToggle.checked;
            });
            updateAlarmRepeatDisplay();
            syncSmartAlarmState();
            syncSleepFields();
        };

        const syncSmartAlarmState = function () {
            if (!wakeupRow || !smartAlarmToggle) {
                return;
            }

            wakeupRow.hidden = !smartAlarmToggle.checked;
        };

        if (alarmToggle) {
            alarmToggle.addEventListener('change', syncAlarmPanelState);
        }

        if (smartAlarmToggle) {
            smartAlarmToggle.addEventListener('change', syncSmartAlarmState);
            smartAlarmToggle.addEventListener('input', syncSmartAlarmState);
            smartAlarmToggle.addEventListener('click', syncSmartAlarmState);
        }

        if (alarmDayToggles.length) {
            alarmDayToggles.forEach(function (toggle) {
                toggle.addEventListener('change', function () {
                    updateAlarmRepeatDisplay();
                    persistSleepWindow();
                });
            });
        }

        if (sleepReminderToggle) {
            try {
                const storedReminderEnabled = localStorage.getItem(sleepReminderEnabledKey);
                if (storedReminderEnabled !== null) {
                    sleepReminderToggle.checked = storedReminderEnabled === 'true';
                }
            } catch (error) {
                // Ignore storage failures.
            }

            sleepReminderToggle.addEventListener('change', function () {
                if (!sleepReminderToggle.checked) {
                    try {
                        localStorage.setItem(sleepReminderEnabledKey, 'false');
                    } catch (error) {
                        // Ignore storage failures.
                    }
                    clearSleepReminderTimer();
                    return;
                }

                requestSleepNotificationPermission().then(function (status) {
                    if (status !== 'granted') {
                        sleepReminderToggle.checked = false;
                        if (sleepReminderHint) {
                            sleepReminderHint.hidden = false;
                        }
                        try {
                            localStorage.setItem(sleepReminderEnabledKey, 'false');
                        } catch (error) {
                            // Ignore storage failures.
                        }
                        clearSleepReminderTimer();
                        return;
                    }

                    try {
                        localStorage.setItem(sleepReminderEnabledKey, 'true');
                    } catch (error) {
                        // Ignore storage failures.
                    }

                    if (sleepReminderHint) {
                        sleepReminderHint.hidden = true;
                    }
                    scheduleSleepReminder(true);
                });
            });

            if (sleepReminderToggle.checked && Notification.permission === 'granted') {
                if (sleepReminderHint) {
                    sleepReminderHint.hidden = true;
                }
                scheduleSleepReminder(true);
            } else if (sleepReminderToggle.checked && sleepReminderHint) {
                sleepReminderHint.hidden = false;
            }
        }

        if (repeatOpenButton) {
            repeatOpenButton.addEventListener('click', function () {
                openSleepModal(repeatModal);
            });
        }

        if (repeatCloseButtons.length) {
            repeatCloseButtons.forEach(function (btn) {
                btn.addEventListener('click', function () {
                    closeSleepModal(repeatModal);
                });
            });
        }

        if (repeatModal) {
            repeatModal.addEventListener('click', function (event) {
                if (event.target && event.target.hasAttribute('data-repeat-close')) {
                    closeSleepModal(repeatModal);
                }
            });
        }

        if (snoozeOpenButton) {
            snoozeOpenButton.addEventListener('click', function () {
                openSleepModal(snoozeModal);
                syncSnoozeWheelPadding();
                const currentValue = Number(sleepDial.dataset.snoozeMinutes || 15);
                setSnoozeActive(currentValue, false);
                scrollSnoozeToValue(currentValue, false);
            });
        }

        if (wakeupOpenButton) {
            wakeupOpenButton.addEventListener('click', function () {
                openSleepModal(wakeupModal);
                syncWakeupWheelPadding();
                const currentValue = Number(sleepDial.dataset.wakeupMinutes || 30);
                setWakeupActive(currentValue, false);
                scrollWakeupToValue(currentValue, false);
            });
        }

        if (snoozeCloseButtons.length) {
            snoozeCloseButtons.forEach(function (btn) {
                btn.addEventListener('click', function () {
                    closeSleepModal(snoozeModal);
                });
            });
        }

        if (wakeupCloseButtons.length) {
            wakeupCloseButtons.forEach(function (btn) {
                btn.addEventListener('click', function () {
                    closeSleepModal(wakeupModal);
                });
            });
        }

        if (snoozeModal) {
            snoozeModal.addEventListener('click', function (event) {
                if (event.target && event.target.hasAttribute('data-snooze-close')) {
                    closeSleepModal(snoozeModal);
                }
            });
        }

        if (wakeupModal) {
            wakeupModal.addEventListener('click', function (event) {
                if (event.target && event.target.hasAttribute('data-wakeup-close')) {
                    closeSleepModal(wakeupModal);
                }
            });
        }

        if (snoozeItems.length) {
            snoozeItems.forEach(function (item) {
                item.addEventListener('click', function () {
                    const snoozeValue = Number(item.dataset.snoozeMinute || 15);
                    scrollSnoozeToValue(snoozeValue, true);
                    setSnoozeActive(snoozeValue, false);
                    persistSleepWindow();
                });
            });
        }

        if (wakeupItems.length) {
            wakeupItems.forEach(function (item) {
                item.addEventListener('click', function () {
                    const wakeupValue = Number(item.dataset.wakeupMinute || 30);
                    scrollWakeupToValue(wakeupValue, true);
                    setWakeupActive(wakeupValue, false);
                    persistSleepWindow();
                });
            });
        }

        if (snoozeWheel) {
            snoozeWheel.addEventListener('scroll', function () {
                if (Date.now() < snoozeProgrammaticUntil) {
                    return;
                }
                updateSnoozeFromScroll();
                scheduleSnoozeSnap();
            }, { passive: true });
        }

        if (wakeupWheel) {
            wakeupWheel.addEventListener('scroll', function () {
                if (Date.now() < wakeupProgrammaticUntil) {
                    return;
                }
                updateWakeupFromScroll();
                scheduleWakeupSnap();
            }, { passive: true });
        }

        window.addEventListener('resize', function () {
            syncSnoozeWheelPadding();
            syncWakeupWheelPadding();
        });

        syncSmartAlarmState();

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && repeatModal && !repeatModal.hidden) {
                closeSleepModal(repeatModal);
            } else if (event.key === 'Escape' && snoozeModal && !snoozeModal.hidden) {
                closeSleepModal(snoozeModal);
            } else if (event.key === 'Escape' && wakeupModal && !wakeupModal.hidden) {
                closeSleepModal(wakeupModal);
            }
        });

        syncAlarmPanelState();

        if (alarmPanel) {
            alarmPanel.addEventListener('submit', function (event) {
                event.preventDefault();
                if (!alarmEndInput || !alarmEndInput.value) {
                    return;
                }

                const currentBedtime = toMinutes(sleepDial.dataset.bedtime);
                const nextAlarmEnd = toMinutes(alarmEndInput.value);
                if (!isAllowedWindow(currentBedtime, nextAlarmEnd)) {
                    alarmEndInput.value = sleepDial.dataset.alarmEnd || alarmEndInput.value;
                    return;
                }

                sleepDial.dataset.alarmEnd = alarmEndInput.value;

                syncSleepFields();
                persistSleepWindow();
                alarmPanel.hidden = true;
                syncEditRowVisibility();
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
    const sleepFlowLayer = document.getElementById('sleepFlowLayer');
    if (dailyCalendarDays || sleepFlowLayer) {
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
        const sleepNowBtn = document.getElementById('sleepNowBtn');
        const dailyTrackNowBtn = document.getElementById('dailyTrackNowBtn');
        const dailySleepNowBtn = document.getElementById('dailySleepNowBtn');
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

        const to12HourFromTimeValue = function (timeValue) {
            const minutes = toMinutes(timeValue);
            if (minutes === null) {
                return '--:--';
            }

            const hour24 = Math.floor(minutes / 60) % 24;
            const minute = minutes % 60;
            return to12Hour(hour24, minute);
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
            const interval = getSleepInterval();
            const bedtimeText = to12HourFromTimeValue(interval.bedtime);
            const alarmStartText = to12HourFromTimeValue(interval.alarmStart);
            const alarmEndText = to12HourFromTimeValue(interval.alarmEnd);
            const configuredSleepMinutes = sessionDurationFromInterval(interval);

            const sleepQuality = asleepMinutes >= 420 ? 'strong' : (asleepMinutes >= 360 ? 'steady' : 'light');
            const noiseDb = 20 + (seed % 11);

            return {
                bedtime: bedtimeText,
                alarm: alarmStartText + '-' + alarmEndText,
                goal: formatDuration(configuredSleepMinutes),
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

            renderSlots();
            sleepNoiseTimer = setInterval(setNoise, 60000);
            inputElement.addEventListener('input', function (evt) {
                renderSlots();
                
                // Skip syncing to dial for programmatic updates (e.g., from marker dragging)
                if (evt.isTrusted) {
                    // Validate constraint before syncing for user input
                    if (inputElement === bedtimeInput) {
                        const alarmEndMinutes = toMinutes(sleepDial.dataset.alarmEnd);
                        const newBedtimeMinutes = toMinutes(inputElement.value);
                        if (!isAllowedWindow(newBedtimeMinutes, alarmEndMinutes)) {
                            return;
                        }
                    } else if (inputElement === alarmEndInput) {
                        const bedtimeMinutes = toMinutes(sleepDial.dataset.bedtime);
                        const newAlarmMinutes = toMinutes(inputElement.value);
                        if (!isAllowedWindow(bedtimeMinutes, newAlarmMinutes)) {
                            return;
                        }
                    }
                    syncDialFromEditInputs();
                }
            });

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
            if (!dailyCalendarDays) {
                return;
            }

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

        [sleepNowBtn, dailyTrackNowBtn, dailySleepNowBtn].forEach(function (triggerBtn) {
            if (!triggerBtn) {
                return;
            }

            triggerBtn.addEventListener('click', function () {
                openSleepNowFlow();
            });
        });

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
        const movementTypeNeedle = document.getElementById('movementTypeNeedle');
        const movementLegendStill = document.getElementById('movementLegendStill');
        const movementLegendBalanced = document.getElementById('movementLegendBalanced');
        const movementLegendMischievous = document.getElementById('movementLegendMischievous');
        const movementScore = document.getElementById('movementScore');
        const movementTurns = document.getElementById('movementTurns');
        const movementStillPeriod = document.getElementById('movementStillPeriod');
        const movementInsight = document.getElementById('movementInsight');
        const movementFullTelemetryToggle = document.getElementById('movementFullTelemetryToggle');
        const movementTelemetryModal = document.getElementById('movementTelemetryModal');
        const movementTelemetryRange = document.getElementById('movementTelemetryRange');
        const movementTelemetryChart = document.getElementById('movementTelemetryChart');
        const movementTelemetryCloseButtons = movementTelemetryModal
            ? movementTelemetryModal.querySelectorAll('[data-movement-telemetry-close]')
            : [];

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
        let telemetryChartInstance = null;
        let latestMovement = null;
        let selectedTelemetryIndex = -1;

        const filterRecordsByDate = function (records, dateValue) {
            if (!Array.isArray(records)) {
                return [];
            }

            if (!dateValue) {
                return records;
            }

            return records.filter(function (record) {
                const stamp = record && record.time ? String(record.time) : '';
                if (!stamp) {
                    return false;
                }

                const parsed = new Date(stamp);
                if (Number.isNaN(parsed.getTime())) {
                    return false;
                }

                const yyyy = parsed.getFullYear();
                const mm = String(parsed.getMonth() + 1).padStart(2, '0');
                const dd = String(parsed.getDate()).padStart(2, '0');
                return (yyyy + '-' + mm + '-' + dd) === dateValue;
            });
        };

        const mapMovementSeries = function (records) {
            const labels = [];
            const points = [];

            records.forEach(function (record) {
                const motionValue = Number(record && record.motion);
                if (!Number.isFinite(motionValue)) {
                    return;
                }

                const clamped = Math.max(0, Math.min(100, Math.round(motionValue)));
                const stamp = record && record.time ? record.time : null;
                const label = stamp ? new Date(stamp).toLocaleTimeString() : new Date().toLocaleTimeString();
                labels.push(label);
                points.push(clamped);
            });

            return {
                labels: labels,
                points: points
            };
        };

        const longestStillSecondsFromRecords = function (records, stillThreshold) {
            if (!Array.isArray(records) || records.length === 0) {
                return 0;
            }

            const normalized = records.map(function (record) {
                const motionValue = Number(record && record.motion);
                const stamp = record && record.time ? Date.parse(record.time) : NaN;
                if (!Number.isFinite(motionValue) || Number.isNaN(stamp)) {
                    return null;
                }

                return {
                    motion: Math.max(0, Math.min(100, Math.round(motionValue))),
                    stamp: stamp
                };
            }).filter(function (item) {
                return item !== null;
            }).sort(function (a, b) {
                return a.stamp - b.stamp;
            });

            if (!normalized.length) {
                return 0;
            }

            const gaps = [];
            for (let i = 1; i < normalized.length; i += 1) {
                const delta = Math.round((normalized[i].stamp - normalized[i - 1].stamp) / 1000);
                if (delta > 0 && delta < 60) {
                    gaps.push(delta);
                }
            }

            const sampleSeconds = gaps.length
                ? Math.max(1, Math.round(gaps.reduce(function (sum, v) { return sum + v; }, 0) / gaps.length))
                : 2;

            let longest = 0;
            let current = 0;
            let previousStill = false;

            normalized.forEach(function (item, index) {
                const isStill = item.motion <= stillThreshold;

                if (!isStill) {
                    current = 0;
                    previousStill = false;
                    return;
                }

                if (!previousStill) {
                    current = sampleSeconds;
                } else {
                    const delta = Math.max(1, Math.round((item.stamp - normalized[index - 1].stamp) / 1000));
                    current += Math.min(delta, 60);
                }

                if (current > longest) {
                    longest = current;
                }

                previousStill = true;
            });

            return longest;
        };

        const classifySleeper = function (points, records) {
            if (!points.length) {
                return {
                    type: 'Waiting for device data',
                    level: 1,
                    avg: 0,
                    turns: 0,
                    longestStillSeconds: 0,
                    volatility: 0,
                    needlePos: '50%',
                    stillPercent: 0,
                    activePercent: 0,
                    insight: 'No telemetry received yet from your Seeed device.'
                };
            }

            const avg = points.reduce(function (sum, p) { return sum + p; }, 0) / points.length;
            const turns = points.filter(function (p) { return p >= 66; }).length;
            const longestStillSeconds = longestStillSecondsFromRecords(records || [], 30);
            const peak = Math.max.apply(null, points);
            const trough = Math.min.apply(null, points);
            const volatility = peak - trough;

            let type = 'Balanced Sleeper';
            let insight = 'Your movement pattern is moderate and fairly stable through the night.';
            let level = 1;
            let needlePos = '50%';

            if (avg <= 34 && turns <= 4) {
                type = 'Still Sleeper';
                insight = 'You remained mostly calm and still, which often aligns with deeper uninterrupted sleep.';
                level = 0;
                needlePos = '14%';
            } else if (avg >= 57 || turns >= 10) {
                type = 'Mischievous Sleeper';
                insight = 'Frequent movements were detected. Consider adjusting pillow support and room comfort.';
                level = 2;
                needlePos = '86%';
            }

            return {
                type: type,
                level: level,
                avg: Math.round(avg),
                turns: turns,
                longestStillSeconds: longestStillSeconds,
                volatility: volatility,
                needlePos: needlePos,
                stillPercent: Math.round((points.filter(function (p) { return p <= 40; }).length / points.length) * 100),
                activePercent: Math.round((points.filter(function (p) { return p > 40; }).length / points.length) * 100),
                insight: insight
            };
        };

        const formatStillDuration = function (seconds) {
            const safe = Math.max(0, Math.round(Number(seconds) || 0));
            const mins = Math.floor(safe / 60);
            const secs = safe % 60;

            if (mins === 0) {
                return secs + ' sec';
            }

            return mins + ' min ' + String(secs).padStart(2, '0') + ' sec';
        };

        const getTipOffSeries = function (points, tipOffIndex) {
            return points.map(function (value, index) {
                return index === tipOffIndex ? value : null;
            });
        };

        const updateTelemetryRangeText = function (labels, points, tipOffIndex) {
            if (!movementTelemetryRange) {
                return;
            }

            if (labels.length === 0) {
                movementTelemetryRange.textContent = 'No telemetry from device yet.';
                return;
            }

            let text = labels[0] + ' to ' + labels[labels.length - 1] +
                ' (' + labels.length + ' telemetry points)';

            if (tipOffIndex >= 0 && tipOffIndex < labels.length) {
                text += ' · Tip-off point: ' + labels[tipOffIndex] + ' (' + points[tipOffIndex] + ')';
            }

            movementTelemetryRange.textContent = text;
        };

        const renderTelemetryTimeline = function (labels, points) {
            const isCompactViewport = window.matchMedia('(max-width: 575.98px)').matches;
            if (selectedTelemetryIndex >= labels.length) {
                selectedTelemetryIndex = -1;
            }

            updateTelemetryRangeText(labels, points, selectedTelemetryIndex);

            if (typeof Chart === 'undefined' || !movementTelemetryChart) {
                return;
            }

            if (movementTelemetryModal && movementTelemetryModal.hidden) {
                return;
            }

            if (telemetryChartInstance) {
                telemetryChartInstance.data.labels = labels;
                telemetryChartInstance.data.datasets[0].data = points;
                telemetryChartInstance.data.datasets[1].data = getTipOffSeries(points, selectedTelemetryIndex);
                telemetryChartInstance.options.scales.x.ticks.autoSkip = true;
                telemetryChartInstance.options.scales.x.ticks.maxTicksLimit = isCompactViewport ? 6 : 12;
                telemetryChartInstance.options.scales.x.ticks.maxRotation = isCompactViewport ? 0 : 35;
                telemetryChartInstance.options.scales.x.ticks.minRotation = isCompactViewport ? 0 : 35;
                telemetryChartInstance.options.scales.x.ticks.font.size = isCompactViewport ? 9 : 10;
                telemetryChartInstance.update('none');
                return;
            }

            telemetryChartInstance = new Chart(movementTelemetryChart, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Full telemetry',
                        data: points,
                        borderColor: '#73deff',
                        backgroundColor: 'rgba(115, 222, 255, 0.2)',
                        fill: true,
                        tension: 0.28,
                        pointRadius: 0,
                        pointHitRadius: 18,
                        borderWidth: 2
                    }, {
                        label: 'Tip-off point',
                        data: getTipOffSeries(points, selectedTelemetryIndex),
                        showLine: false,
                        borderWidth: 0,
                        pointRadius: 5,
                        pointHoverRadius: 5,
                        pointBackgroundColor: '#ffd27a',
                        pointBorderColor: '#1e2a3f',
                        pointBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    onClick: function (event, activeElements, chart) {
                        if (!activeElements || !activeElements.length) {
                            return;
                        }

                        selectedTelemetryIndex = activeElements[0].index;
                        chart.data.datasets[1].data = getTipOffSeries(chart.data.datasets[0].data, selectedTelemetryIndex);
                        updateTelemetryRangeText(chart.data.labels, chart.data.datasets[0].data, selectedTelemetryIndex);
                        chart.update('none');
                    },
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            min: 0,
                            max: 100,
                            grid: { color: 'rgba(121, 167, 217, 0.18)' },
                            ticks: {
                                color: '#9eb5cf',
                                stepSize: 20
                            }
                        },
                        x: {
                            grid: { display: false },
                            ticks: {
                                color: '#9eb5cf',
                                autoSkip: true,
                                maxTicksLimit: isCompactViewport ? 6 : 12,
                                maxRotation: isCompactViewport ? 0 : 35,
                                minRotation: isCompactViewport ? 0 : 35,
                                font: {
                                    size: isCompactViewport ? 9 : 10
                                }
                            }
                        }
                    }
                }
            });
        };

        const renderMovement = function (records) {
            const movement = mapMovementSeries(records || []);
            latestMovement = movement;
            const profile = classifySleeper(movement.points, records || []);

            renderTelemetryTimeline(movement.labels, movement.points);

            if (movementSleeperType) {
                movementSleeperType.textContent = profile.type;
                movementSleeperType.classList.remove('is-still', 'is-balanced', 'is-mischievous');
                if (profile.level === 0) {
                    movementSleeperType.classList.add('is-still');
                } else if (profile.level === 2) {
                    movementSleeperType.classList.add('is-mischievous');
                } else {
                    movementSleeperType.classList.add('is-balanced');
                }
            }

            if (movementTypeNeedle) {
                movementTypeNeedle.style.setProperty('--needle-pos', profile.needlePos);
            }

            [movementLegendStill, movementLegendBalanced, movementLegendMischievous].forEach(function (node) {
                if (node) {
                    node.classList.remove('active');
                }
            });

            if (profile.level === 0 && movementLegendStill) {
                movementLegendStill.classList.add('active');
            }

            if (profile.level === 1 && movementLegendBalanced) {
                movementLegendBalanced.classList.add('active');
            }

            if (profile.level === 2 && movementLegendMischievous) {
                movementLegendMischievous.classList.add('active');
            }

            if (movementScore) {
                movementScore.textContent = movement.points.length ? (profile.level >= 2 ? 'Active' : 'Calm') : '--';
            }

            if (movementTurns) {
                movementTurns.textContent = String(profile.turns);
            }

            if (movementStillPeriod) {
                movementStillPeriod.textContent = movement.points.length ? formatStillDuration(profile.longestStillSeconds) : '--';
            }

            if (movementInsight) {
                movementInsight.textContent = movement.points.length
                    ? (profile.insight + ' Volatility index: ' + profile.volatility + '.')
                    : profile.insight;
            }

            if (typeof Chart !== 'undefined' && movementPatternChart) {
                if (patternChartInstance) {
                    patternChartInstance.data.labels = movement.labels;
                    patternChartInstance.data.datasets[0].data = movement.points;
                    patternChartInstance.update('none');
                } else {
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
            }

            if (typeof Chart !== 'undefined' && movementStyleChart) {
                if (styleChartInstance) {
                    styleChartInstance.data.datasets[0].data = [profile.stillPercent, profile.activePercent];
                    styleChartInstance.update('none');
                } else {
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
            }
        };

        const fetchMovementFromApi = function (selectedDate) {
            fetch('api/motion-data.php', { cache: 'no-store' })
                .then(function (response) { return response.json(); })
                .then(function (payload) {
                    if (!payload || payload.ok === false) {
                        renderMovement([]);
                        return;
                    }

                    const allRecords = Array.isArray(payload.data) ? payload.data : [];
                    const filtered = filterRecordsByDate(allRecords, selectedDate);

                    if (filtered.length) {
                        renderMovement(filtered);
                        return;
                    }

                    // Show the latest real telemetry if selected date has no entries.
                    renderMovement(allRecords.slice(-50));
                })
                .catch(function () {
                    renderMovement([]);
                });
        };

        if (movementDateInput) {
            movementDateInput.addEventListener('change', function () {
                fetchMovementFromApi(movementDateInput.value || dateForInput);
            });
        }

        if (movementFullTelemetryToggle && movementTelemetryModal) {
            movementFullTelemetryToggle.addEventListener('click', function () {
                movementTelemetryModal.hidden = false;
                document.body.classList.add('movement-telemetry-open');
                movementFullTelemetryToggle.setAttribute('aria-expanded', 'true');
                movementFullTelemetryToggle.textContent = 'Hide full telemetry';

                if (latestMovement) {
                    renderTelemetryTimeline(latestMovement.labels, latestMovement.points);
                }
            });
        }

        if (movementTelemetryCloseButtons.length) {
            movementTelemetryCloseButtons.forEach(function (button) {
                button.addEventListener('click', function () {
                    movementTelemetryModal.hidden = true;
                    document.body.classList.remove('movement-telemetry-open');
                    if (movementFullTelemetryToggle) {
                        movementFullTelemetryToggle.setAttribute('aria-expanded', 'false');
                        movementFullTelemetryToggle.textContent = 'Show full telemetry';
                    }
                });
            });
        }

        document.addEventListener('keydown', function (event) {
            if (event.key !== 'Escape' || !movementTelemetryModal || movementTelemetryModal.hidden) {
                return;
            }

            movementTelemetryModal.hidden = true;
            document.body.classList.remove('movement-telemetry-open');
            if (movementFullTelemetryToggle) {
                movementFullTelemetryToggle.setAttribute('aria-expanded', 'false');
                movementFullTelemetryToggle.textContent = 'Show full telemetry';
            }
        });

        fetchMovementFromApi(dateForInput);
        setInterval(function () {
            const selectedDate = movementDateInput ? (movementDateInput.value || dateForInput) : dateForInput;
            fetchMovementFromApi(selectedDate);
        }, 2000);
    }

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

    const livePanel = document.getElementById('arduinoLivePanel');
    if (livePanel) {
        const liveSnoreLevel = document.getElementById('liveSnoreLevel');
        const liveMovement = document.getElementById('liveMovement');
        const liveBattery = document.getElementById('liveBattery');
        const liveDeviceStatus = document.getElementById('liveDeviceStatus');

        const renderLiveMetrics = function (payload) {
            if (liveSnoreLevel) {
                liveSnoreLevel.textContent = String(payload.snoreLevel ?? 0);
            }
            if (liveMovement) {
                liveMovement.textContent = String(payload.movement ?? 0);
            }
            if (liveBattery) {
                liveBattery.textContent = String(payload.battery ?? 0) + '%';
            }
            if (liveDeviceStatus) {
                const stamp = payload.timestamp || payload.receivedAt || 'n/a';
                liveDeviceStatus.textContent = 'Device: ' + (payload.device || 'unknown') + ' | Last update: ' + stamp;
            }
        };

        const fetchLiveMetrics = function () {
            fetch('api/live-metrics.php', { cache: 'no-store' })
                .then(function (response) { return response.json(); })
                .then(function (payload) { renderLiveMetrics(payload || {}); })
                .catch(function () {
                    if (liveDeviceStatus) {
                        liveDeviceStatus.textContent = 'Unable to reach live API. Start Apache and the serial bridge.';
                    }
                });
        };

        fetchLiveMetrics();
        setInterval(fetchLiveMetrics, 2000);
    }

    const deviceLivePanel = document.getElementById('deviceLivePanel');
    if (deviceLivePanel) {
        const deviceBatteryValue = document.getElementById('deviceBatteryValue');
        const deviceBatteryStatus = document.getElementById('deviceBatteryStatus');
        const deviceName = document.getElementById('deviceName');
        const deviceConnectionState = document.getElementById('deviceConnectionState');
        const deviceLastUpdate = document.getElementById('deviceLastUpdate');
        const connectionFreshMs = 10000;

        const isTelemetryFresh = function (payload) {
            if (!payload || payload.ok === false) {
                return false;
            }

            const stamp = payload.timestamp || payload.receivedAt;
            if (!stamp) {
                return false;
            }

            const parsed = Date.parse(stamp);
            if (Number.isNaN(parsed)) {
                return false;
            }

            return (Date.now() - parsed) <= connectionFreshMs;
        };

        const renderDeviceLiveMetrics = function (payload) {
            const battery = Number(payload && payload.battery);
            const batterySafe = Number.isFinite(battery) ? Math.max(0, Math.min(100, Math.round(battery))) : null;
            const stamp = payload && (payload.timestamp || payload.receivedAt) ? (payload.timestamp || payload.receivedAt) : null;
            const device = payload && payload.device ? payload.device : 'unknown';
            const connected = isTelemetryFresh(payload);

            if (deviceBatteryValue) {
                deviceBatteryValue.textContent = batterySafe === null ? '--%' : (String(batterySafe) + '%');
            }

            if (deviceBatteryStatus) {
                if (batterySafe === null) {
                    deviceBatteryStatus.textContent = 'Waiting for battery telemetry...';
                } else if (batterySafe <= 20) {
                    deviceBatteryStatus.textContent = 'Low battery, consider charging soon.';
                } else if (batterySafe <= 50) {
                    deviceBatteryStatus.textContent = 'Battery is moderate.';
                } else {
                    deviceBatteryStatus.textContent = 'Battery is healthy.';
                }
            }

            if (deviceName) {
                deviceName.textContent = 'Device: ' + device;
            }

            if (deviceConnectionState) {
                deviceConnectionState.textContent = connected ? 'Connection: Connected' : 'Connection: Disconnected';
            }

            if (deviceLastUpdate) {
                deviceLastUpdate.textContent = 'Last update: ' + (stamp || '--');
            }
        };

        const fetchDeviceLiveMetrics = function () {
            fetch('api/live-metrics.php', { cache: 'no-store' })
                .then(function (response) { return response.json(); })
                .then(function (payload) {
                    if (!payload || payload.ok === false) {
                        renderDeviceLiveMetrics({});
                        return;
                    }
                    renderDeviceLiveMetrics(payload);
                })
                .catch(function () {
                    if (deviceBatteryStatus) {
                        deviceBatteryStatus.textContent = 'Unable to reach live API. Start Apache and the serial bridge.';
                    }
                });
        };

        fetchDeviceLiveMetrics();
        setInterval(fetchDeviceLiveMetrics, 2000);
    }
});
