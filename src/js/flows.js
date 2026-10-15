import { appState, selection, syncSelections } from './state.js';
import { createButtonHeartEffect, createHeart, createHeartBurst, sprinkleHearts } from './effects.js';

const DEFAULT_MUSIC_VOLUME = 0.5;
const VOLUME_STEP = 0.05;

const fadeSwapCards = (current, next, onShown) => {
    if (!current || !next) return;
    current.style.transform = 'scale(0.8)';
    current.style.opacity = '0';
    setTimeout(() => {
        current.style.display = 'none';
        next.style.display = 'block';
        setTimeout(() => {
            next.classList.remove('hidden');
            next.style.opacity = '1';
            next.style.transform = 'scale(1)';
            onShown?.();
        }, 50);
    }, 500);
};

const setupMusicControls = (els) => {
    const {
        bgMusic,
        musicWidget,
        musicToggle,
        musicPlayToggle,
        musicVolumeDown,
        musicVolumeUp,
        musicVolumeValue
    } = els;

    if (!bgMusic || !musicWidget || !musicToggle || !musicVolumeValue) return;

    const clampVolume = (value) => Math.min(1, Math.max(0, value));

    const updateVolumeLabel = () => {
        const vol = clampVolume(bgMusic.volume);
        musicVolumeValue.textContent = `${Math.round(vol * 100)}%`;
    };

    const setVolume = (value) => {
        const vol = clampVolume(value);
        bgMusic.volume = vol;
        bgMusic.dataset.userVolume = String(vol);
        updateVolumeLabel();
    };

    setVolume(DEFAULT_MUSIC_VOLUME);

    const syncPlayState = () => {
        if (!musicPlayToggle) return;
        const isPlaying = !bgMusic.paused;
        musicPlayToggle.classList.toggle('is-playing', isPlaying);
    };

    const requestPlay = () => {
        bgMusic.play()
            .then(syncPlayState)
            .catch(() => {
                musicWidget.classList.add('needs-interaction');
                setTimeout(() => musicWidget.classList.remove('needs-interaction'), 800);
            });
    };

    musicPlayToggle?.addEventListener('click', (event) => {
        event.stopPropagation();
        if (bgMusic.paused) {
            requestPlay();
        } else {
            bgMusic.pause();
            syncPlayState();
        }
    });

    const adjustVolume = (delta) => setVolume(bgMusic.volume + delta);

    musicVolumeDown?.addEventListener('click', (event) => {
        event.stopPropagation();
        adjustVolume(-VOLUME_STEP);
    });

    musicVolumeUp?.addEventListener('click', (event) => {
        event.stopPropagation();
        adjustVolume(VOLUME_STEP);
    });

    musicToggle.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        musicWidget.classList.toggle('open');
        if (bgMusic.paused) bgMusic.pause();
    });

    document.addEventListener('click', (event) => {
        if (!musicWidget.contains(event.target)) {
            musicWidget.classList.remove('open');
        }
    });

    bgMusic.addEventListener('volumechange', updateVolumeLabel);
    bgMusic.addEventListener('play', syncPlayState);
    bgMusic.addEventListener('pause', syncPlayState);

    updateVolumeLabel();
    syncPlayState();
};

const setupYesNoFlow = (els) => {
    const noBtnResponses = [
        "Really?", "Are you sure?", "Think again!", "Last chance...",
        "I guess you misclicked", "Come on...", "You mean yes?", "Try again?",
        "You missed the yes button!", "Changed your mind yet?",
        "Give it another shot!", "Why not?", "Cutie, I don't allow no for an answer!",
        "No = Yes, Yes = Yes :)", "I think you mean yes", "Maybe you wanna try again"
    ];

    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    let shuffledResponses = shuffleArray(noBtnResponses);
    let currentIndex = 0;

    if (els.noBtn) {
        els.noBtn.addEventListener('mouseover', () => {
            const maxX = window.innerWidth - els.noBtn.offsetWidth - 50;
            const maxY = window.innerHeight - els.noBtn.offsetHeight - 50;
            const cardRect = document.querySelector('.card')?.getBoundingClientRect();
            let randomX;
            let randomY;
            do {
                randomX = Math.floor(Math.random() * maxX);
                randomY = Math.floor(Math.random() * maxY);
            } while (
                cardRect &&
                randomX > cardRect.left - els.noBtn.offsetWidth &&
                randomX < cardRect.right &&
                randomY > cardRect.top - els.noBtn.offsetHeight &&
                randomY < cardRect.bottom
            );
            els.noBtn.style.position = 'fixed';
            els.noBtn.style.left = `${randomX}px`;
            els.noBtn.style.top = `${randomY}px`;

            els.noBtn.innerHTML = `<b>${shuffledResponses[currentIndex]}</b>`;
            currentIndex++;

            if (currentIndex >= shuffledResponses.length) {
                shuffledResponses = shuffleArray(noBtnResponses);
                currentIndex = 0;
            }
            if (els.nervousCat) {
                els.nervousCat.style.animation = 'nervousShake 0.1s infinite';
            }
        });
    }

    if (els.yesBtn) {
        els.yesBtn.addEventListener('click', () => {
            if (els.yesArrow) {
                els.yesArrow.style.opacity = '0';
                els.yesArrow.style.transform = 'translateY(-50px)';
                els.yesArrow.style.transition = 'all 0.5s ease-out';
            }

            if (els.bgMusic) {
                if (!Number.isFinite(els.bgMusic.volume)) {
                    els.bgMusic.volume = DEFAULT_MUSIC_VOLUME;
                }
                els.bgMusic.play().then(() => {
                    els.musicWidget?.classList.add('visible');
                }).catch(() => {
                    console.log('Auto-play was prevented. Please interact with the document first.');
                });
            }
            if (els.musicWidget) {
                els.musicWidget.classList.add('visible');
            }

            createHeartBurst(els.mainCard, 30);

            els.mainCard.style.transform = 'scale(1.05)';
            setTimeout(() => {
                els.mainCard.style.transform = 'scale(0.8)';
                els.mainCard.style.opacity = '0';
                setTimeout(() => {
                    els.mainCard.style.display = 'none';
                    els.successCard.style.display = 'block';
                    setTimeout(() => {
                        els.successCard.classList.remove('hidden');
                        els.successCard.style.opacity = '1';
                        els.successCard.style.transform = 'scale(1)';
                        if (els.successArrow) {
                            els.successArrow.classList.remove('hidden');
                            els.successArrow.style.opacity = '1';
                        }
                        sprinkleHearts(els.successCelebration, 10);
                    }, 50);
                }, 500);
            }, 300);

            if (els.nervousCat) {
                els.nervousCat.style.opacity = '0';
                els.nervousCat.style.transition = 'opacity 0.5s ease-out';
            }
        });
    }
};

const ensureSelectionEntry = (list, value, shouldAdd) => {
    const exists = list.includes(value);
    if (shouldAdd && !exists) {
        list.push(value);
    }
    if (!shouldAdd && exists) {
        return list.filter(item => item !== value);
    }
    return list;
};

const hasSelectionForType = (type) => {
    const map = {
        location: selection.locations,
        food: selection.foods,
        drink: selection.drinks
    };
    return (map[type] && map[type].length > 0) || !!document.querySelector(`.custom-btn[data-${type}].selected`);
};

const updateSelectionUI = (type, els) => {
    const selectionMap = {
        location: selection.locations,
        food: selection.foods,
        drink: selection.drinks
    };

    const messageMap = {
        location: els.selectedLocationMessage,
        food: els.selectedFoodMessage,
        drink: els.selectedDrinkMessage
    };

    const confirmMap = {
        location: els.confirmLocationBtn,
        food: els.confirmFoodBtn,
        drink: els.confirmDrinkBtn
    };

    const statusMap = {
        food: els.foodSelectionStatus,
        drink: els.drinkSelectionStatus
    };

    const hasCustom = !!document.querySelector(`.custom-btn[data-${type}].selected`);
    const selected = selectionMap[type];
    const hasSelection = (selected && selected.length > 0) || hasCustom;
    const messageEl = messageMap[type];
    const confirmEl = confirmMap[type];

    if (hasSelection) {
        messageEl?.classList.remove('hidden');
        messageEl?.classList.add('show');
        if (confirmEl) {
            confirmEl.style.display = 'inline-block';
            createButtonHeartEffect(confirmEl);
        }
    } else {
        messageEl?.classList.remove('show');
        messageEl?.classList.add('hidden');
        if (confirmEl) confirmEl.style.display = 'none';
    }

    if (type === 'food' || type === 'drink') {
        const statusEl = statusMap[type];
        if (statusEl) {
            if (!selected.length) {
                statusEl.classList.remove('active');
                statusEl.innerHTML = '<p>Select your preferences</p>';
            } else {
                statusEl.classList.add('active');
                statusEl.innerHTML = `<p>${selected.length} option${selected.length > 1 ? 's' : ''} selected</p>`;
            }
        }
    }
};

const buildCustomInput = (buttonType, parentCard) => {
    const inputContainer = document.createElement('div');
    inputContainer.id = `${buttonType}-custom-input`;
    inputContainer.className = 'custom-input-container';
    inputContainer.innerHTML = `
        <input type="text" class="custom-text-input" placeholder="Enter your custom ${buttonType} (max 10 words)" maxlength="70">
        <div class="word-counter">0/10 words</div>
    `;
    const confirmBtn = parentCard.querySelector(`#confirm-${buttonType}-btn`);
    if (confirmBtn) {
        confirmBtn.parentNode.insertBefore(inputContainer, confirmBtn);
    } else {
        const message = parentCard.querySelector('.selected-location-message');
        message?.parentNode.insertBefore(inputContainer, message);
    }
    return inputContainer;
};

const handleCustomInput = (buttonType, inputContainer) => {
    const input = inputContainer.querySelector('input');
    const counter = inputContainer.querySelector('.word-counter');
    input.addEventListener('input', () => {
        const words = input.value.trim().split(/\s+/).filter(Boolean);
        const wordCount = words.length;
        if (counter) counter.textContent = `${wordCount}/10 words`;
        if (wordCount > 10) {
            input.value = words.slice(0, 10).join(' ');
            if (counter) counter.textContent = '10/10 words';
        }

        const typed = input.value.trim();
        if (buttonType === 'location') {
            selection.locations = selection.locations.filter(item => !item.startsWith('custom:'));
            if (typed) selection.locations.push(`custom: ${typed}`);
        }
        if (buttonType === 'food') {
            selection.foods = selection.foods.filter(item => !item.startsWith('custom:'));
            if (typed) selection.foods.push(`custom: ${typed}`);
        }
        if (buttonType === 'drink') {
            selection.drinks = selection.drinks.filter(item => !item.startsWith('custom:'));
            if (typed) selection.drinks.push(`custom: ${typed}`);
        }
        updateSelectionUI(buttonType, elsCache);
    });
};

let elsCache;

const setupSelections = (els, tileButtons, customButtons) => {
    elsCache = els;
    const toggleSelection = (button, type, value) => {
        button.classList.toggle('selected');
        const shouldAdd = button.classList.contains('selected');
        if (type === 'location') selection.locations = ensureSelectionEntry(selection.locations, value, shouldAdd);
        if (type === 'food') selection.foods = ensureSelectionEntry(selection.foods, value, shouldAdd);
        if (type === 'drink') selection.drinks = ensureSelectionEntry(selection.drinks, value, shouldAdd);
        if (!shouldAdd) {
            if (type === 'location') selection.locations = selection.locations.filter(item => item !== value);
            if (type === 'food') selection.foods = selection.foods.filter(item => item !== value);
            if (type === 'drink') selection.drinks = selection.drinks.filter(item => item !== value);
        } else {
            createHeartBurst(button, 15);
        }
        updateSelectionUI(type, els);
    };

    tileButtons().forEach(button => {
        button.addEventListener('click', () => {
            const type = button.hasAttribute('data-location') ? 'location' : button.hasAttribute('data-food') ? 'food' : 'drink';
            const value = button.getAttribute(`data-${type}`);
            toggleSelection(button, type, value);
        });
    });

    customButtons().forEach(button => {
        button.addEventListener('click', () => {
            const buttonType = button.hasAttribute('data-location') ? 'location' : button.hasAttribute('data-food') ? 'food' : 'drink';
            const parentCard = button.closest('.card');
            button.classList.toggle('selected');
            let inputContainer = document.getElementById(`${buttonType}-custom-input`);
            if (!inputContainer) {
                inputContainer = buildCustomInput(buttonType, parentCard);
                handleCustomInput(buttonType, inputContainer);
            }
            if (button.classList.contains('selected')) {
                inputContainer.style.display = 'block';
                inputContainer.style.opacity = '0';
                setTimeout(() => {
                    inputContainer.style.opacity = '1';
                    inputContainer.style.transform = 'translateY(0)';
                }, 10);
                updateSelectionUI(buttonType, els);
            } else {
                inputContainer.style.opacity = '0';
                inputContainer.style.transform = 'translateY(10px)';
                setTimeout(() => {
                    inputContainer.style.display = 'none';
                }, 300);
                if (buttonType === 'location') selection.locations = selection.locations.filter(item => !item.startsWith('custom:'));
                if (buttonType === 'food') selection.foods = selection.foods.filter(item => !item.startsWith('custom:'));
                if (buttonType === 'drink') selection.drinks = selection.drinks.filter(item => !item.startsWith('custom:'));
                updateSelectionUI(buttonType, els);
            }
        });
    });
};

const initDatetimeRow = (row, datetimeContainer) => {
    try {
        const datePicker = row.querySelector('.date-picker');
        if (datePicker) {
            flatpickr(datePicker, {
                dateFormat: 'M d, Y',
                minDate: 'today',
                disableMobile: true,
                theme: 'date-theme',
                animate: true,
                position: 'auto center',
                onOpen: () => {
                    const calendar = document.querySelector('.flatpickr-calendar');
                    if (calendar) {
                        calendar.style.animation = 'none';
                        setTimeout(() => {
                            calendar.style.animation = 'calendar-pop 0.3s ease-out';
                        }, 10);
                    }
                }
            });
        }
        const timePicker = row.querySelector('.time-picker');
        if (timePicker) {
            flatpickr(timePicker, {
                enableTime: true,
                noCalendar: true,
                dateFormat: 'h:i K',
                minuteIncrement: 15,
                disableMobile: true,
                theme: 'time-theme',
                animate: true,
                position: 'auto center',
                onOpen: () => {
                    const calendar = document.querySelector('.flatpickr-calendar');
                    if (calendar) {
                        calendar.style.animation = 'none';
                        setTimeout(() => {
                            calendar.style.animation = 'calendar-pop 0.3s ease-out';
                        }, 10);
                    }
                }
            });
        }
        const removeBtn = row.querySelector('.remove-datetime');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                if (datetimeContainer.children.length > 1) {
                    row.style.opacity = '0';
                    row.style.height = '0';
                    row.style.marginBottom = '0';
                    row.style.overflow = 'hidden';
                    setTimeout(() => row.remove(), 300);
                }
            });
        }
    } catch (error) {
        console.error('Error initializing datetime row:', error);
    }
};

const setupDatetimeFlow = (els) => {
    if (els.datetimeRowTemplate) initDatetimeRow(els.datetimeRowTemplate, els.datetimeContainer);

    if (els.addDatetimeBtn) {
        els.addDatetimeBtn.addEventListener('click', () => {
            const newRow = els.datetimeRowTemplate.cloneNode(true);
            newRow.id = '';
            els.datetimeContainer.appendChild(newRow);
            initDatetimeRow(newRow, els.datetimeContainer);
            newRow.style.opacity = '0';
            setTimeout(() => {
                newRow.style.opacity = '1';
            }, 10);
        });
    }

    if (els.confirmDatetimeBtn) {
        els.confirmDatetimeBtn.addEventListener('click', () => {
            const dateOptions = [];
            let isValid = true;
            els.datetimeContainer.querySelectorAll('.datetime-row').forEach(row => {
                const date = row.querySelector('.date-picker').value;
                const time = row.querySelector('.time-picker').value;
                if (!date || !time) {
                    isValid = false;
                    ['date-picker', 'time-picker'].forEach(cls => {
                        const input = row.querySelector(`.${cls}`);
                        if (!input.value) {
                            input.style.borderColor = '#ff3366';
                            setTimeout(() => {
                                input.style.borderColor = '';
                            }, 1000);
                        }
                    });
                } else {
                    dateOptions.push({ date, time });
                }
            });

            if (isValid && dateOptions.length > 0) {
                appState.dateOptions = [...dateOptions];
                els.confirmDatetimeBtn.style.display = 'none';
                els.selectedDatetimeMessage?.classList.remove('hidden');
                els.selectedDatetimeMessage?.classList.add('show');
                if (els.foodNextBtn) {
                    els.foodNextBtn.style.display = 'inline-block';
                }
                if (els.addDatetimeBtn) els.addDatetimeBtn.disabled = true;
                els.datetimeContainer.querySelectorAll('.remove-datetime').forEach(btn => {
                    btn.disabled = true;
                    btn.style.opacity = 0.5;
                });
                els.datetimeContainer.querySelectorAll('input').forEach(input => {
                    input.disabled = true;
                    input.style.opacity = 0.7;
                });
            }
        });
    }
};

const setupFoodNavigation = (els) => {
    if (els.foodNextBtn) {
        els.foodNextBtn.addEventListener('click', () => {
            fadeSwapCards(els.datetimeCard, els.foodCard, () => sprinkleHearts(els.foodCelebration, 8));
        });
    }
};

const setupLocationNavigation = (els) => {
    if (els.chooseLocationBtn) {
        els.chooseLocationBtn.addEventListener('click', () => {
            fadeSwapCards(els.successCard, els.locationCard, () => sprinkleHearts(els.locationCelebration, 8));
        });
    }

    if (els.confirmLocationBtn) {
        els.confirmLocationBtn.addEventListener('click', () => {
            if (!hasSelectionForType('location')) return;
            syncSelections();
            for (let i = 0; i < 20; i++) {
                setTimeout(() => createHeart(els.locationCelebration, { left: '50%', top: '50%', lifetime: 1000 }), i * 30);
            }
            fadeSwapCards(els.locationCard, els.datetimeCard, () => sprinkleHearts(els.datetimeCelebration, 8));
        });
    }
};

const setupFoodFlow = (els) => {
    if (els.confirmFoodBtn) {
        els.confirmFoodBtn.addEventListener('click', () => {
            if (!hasSelectionForType('food')) return;
            syncSelections();
            els.confirmFoodBtn.style.display = 'none';
            els.finalMessage?.classList.remove('hidden');
            setTimeout(() => els.finalMessage?.classList.add('show'), 50);
            document.querySelectorAll('.tile-btn[data-food], .custom-btn[data-food]').forEach(btn => {
                btn.disabled = true;
                btn.style.opacity = '0.7';
                btn.style.cursor = 'default';
            });
        });
    }

    if (els.drinksNextBtn) {
        els.drinksNextBtn.addEventListener('click', () => {
            fadeSwapCards(els.foodCard, els.drinksCard, () => sprinkleHearts(els.drinksCelebration, 8));
        });
    }
};

const setupDrinkFlow = (els, onNoteStep) => {
    if (els.confirmDrinkBtn) {
        els.confirmDrinkBtn.addEventListener('click', () => {
            if (!hasSelectionForType('drink')) return;
            syncSelections();
            els.confirmDrinkBtn.style.display = 'none';
            els.finalDrinkMessage?.classList.remove('hidden');
            setTimeout(() => els.finalDrinkMessage?.classList.add('show'), 50);
            for (let i = 0; i < 30; i++) {
                setTimeout(() => createHeart(els.drinksCelebration, {
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    lifetime: 1000,
                    scale: Math.random() * 0.5 + 0.5,
                    opacity: Math.random() * 0.5 + 0.5
                }), i * 100);
            }
            document.querySelectorAll('.tile-btn[data-drink], .custom-btn[data-drink]').forEach(btn => {
                btn.disabled = true;
                btn.style.opacity = '0.7';
                btn.style.cursor = 'default';
            });
            if (els.completionNextBtn) {
                els.completionNextBtn.style.display = 'inline-block';
                els.completionNextBtn.textContent = 'Continue ♥';
            }
        });
    }

    if (els.completionNextBtn) {
        els.completionNextBtn.addEventListener('click', () => {
            fadeSwapCards(els.drinksCard, els.noteCard, () => sprinkleHearts(els.noteCelebration, 8));
            onNoteStep?.();
        });
    }
};

const enforceNoteLimits = (els) => {
    if (els.noteTextarea && els.noteWordCounter) {
        els.noteTextarea.addEventListener('input', () => {
            const words = els.noteTextarea.value.trim().split(/\s+/).filter(Boolean);
            const wordCount = words.length;
            els.noteWordCounter.textContent = `${wordCount}/150 words`;
            if (wordCount > 150) {
                els.noteTextarea.value = words.slice(0, 150).join(' ');
                els.noteWordCounter.textContent = '150/150 words';
            }
        });
    }
};

const showCompletionCard = (els, onCompletionReady) => {
    if (!els.noteCard || !els.completionCard) return;

    els.noteCard.style.transform = 'scale(0.8)';
    els.noteCard.style.opacity = '0';
    
    setTimeout(() => {
        els.noteCard.style.display = 'none';
        els.completionCard.style.display = 'block';
        els.completionCard.classList.remove('hidden');
        
        setTimeout(() => {
            els.completionCard.classList.add('show');
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
            sprinkleHearts(els.completionHearts, 12);
            
            if (appState.invitationEmailSent) {
                const form = document.getElementById('email-form');
                const success = document.getElementById('email-success');
                if (form && success) {
                    form.classList.add('disabled');
                    success.style.display = 'block';
                    document.getElementById('user-email').disabled = true;
                    document.getElementById('send-email-btn').disabled = true;
                }
            }
            onCompletionReady?.();
        }, 50);
    }, 500);
};

const setupNoteFlow = (els, onCompletionReady) => {
    enforceNoteLimits(els);
    if (els.saveNoteBtn) {
        els.saveNoteBtn.addEventListener('click', () => {
            const noteText = els.noteTextarea?.value.trim();
            if (noteText) appState.userNote = noteText;
            showCompletionCard(els, onCompletionReady);
        });
    }
};

const initFlows = (els, { tileButtons, customButtons }, onCompletionReady) => {
    setupMusicControls(els);
    setupYesNoFlow(els);
    setupSelections(els, tileButtons, customButtons);
    setupLocationNavigation(els);
    setupDatetimeFlow(els);
    setupFoodNavigation(els);
    setupFoodFlow(els);
    setupDrinkFlow(els, () => enforceNoteLimits(els));
    setupNoteFlow(els, onCompletionReady);
};

export { initFlows };
