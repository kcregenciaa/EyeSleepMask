document.addEventListener('DOMContentLoaded', function () {
    const sleepDial = document.querySelector('.sleep-dial');
    const alarmToggle = document.getElementById('alarmToggle');

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
        const dialStepMinutes = 5;
        const minSleepWindowMinutes = 1 * 60;
        const maxSleepWindowMinutes = 20 * 60;
        let suppressMarkerClick = false;

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
                    let hour12 = (hour24 % 12) || 12;
                    hour12 = mod((hour12 - 1) + direction, 12) + 1;
                    const isPm = hour24 >= 12;
                    if (hour12 === 12) {
                        hour24 = isPm ? 12 : 0;
                    } else {
                        hour24 = (isPm ? 12 : 0) + hour12;
                    }
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

                column.addEventListener('wheel', function (event) {
                    event.preventDefault();
                    stepColumn(columnType, event.deltaY > 0 ? 1 : -1);
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
            syncSleepFields();
        };

        if (alarmToggle) {
            alarmToggle.addEventListener('change', syncAlarmPanelState);
        }

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
        const movementTypeNeedle = document.getElementById('movementTypeNeedle');
        const movementLegendStill = document.getElementById('movementLegendStill');
        const movementLegendBalanced = document.getElementById('movementLegendBalanced');
        const movementLegendMischievous = document.getElementById('movementLegendMischievous');
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
            const peak = Math.max.apply(null, points);
            const trough = Math.min.apply(null, points);
            const volatility = peak - trough;

            let type = 'Balanced sleeper';
            let insight = 'Your movement pattern is moderate and fairly stable through the night.';
            let level = 1;
            let needlePos = '50%';

            if (avg <= 34 && turns <= 4) {
                type = 'Still sleeper';
                insight = 'You remained mostly calm and still, which often aligns with deeper uninterrupted sleep.';
                level = 0;
                needlePos = '14%';
            } else if (avg >= 57 || turns >= 10) {
                type = 'Mischievous sleeper';
                insight = 'Frequent movements were detected. Consider adjusting pillow support and room comfort.';
                level = 2;
                needlePos = '86%';
            }

            return {
                type: type,
                level: level,
                avg: Math.round(avg),
                turns: turns,
                longestStill: longestStill,
                volatility: volatility,
                needlePos: needlePos,
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

                if (value <= 33) {
                    cell.classList.add('is-calm');
                } else if (value >= 67) {
                    cell.classList.add('is-restless');
                } else {
                    cell.classList.add('is-active');
                }

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
                movementScore.textContent = String(profile.avg);
            }

            if (movementTurns) {
                movementTurns.textContent = String(profile.turns);
            }

            if (movementStillPeriod) {
                movementStillPeriod.textContent = profile.longestStill + ' min';
            }

            if (movementInsight) {
                movementInsight.textContent = profile.insight + ' Volatility index: ' + profile.volatility + '.';
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
