// app.js

import { setupUI } from './ui.js';
import { loadSettings } from './helpers.js';
import { setupEventListeners } from './ui.js';
import { adjustNotesVisibility } from './helpers.js';
import { loadSections, defaultSections, saveSections } from './storage.js';
import { decodeWorkoutData } from './helpers.js';
import { showAlert } from './popups.js';

export function initializeApp() {
    // Load settings from localStorage
    loadSettings();

    // Setup the UI components
    setupUI();

    // Check for shared data in URL
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('data');

    if (sharedData) {
        const decodedSections = decodeWorkoutData(sharedData);
        if (decodedSections) {
            loadSections(decodedSections);
            saveSections();
            showAlert('Workout loaded from shared link!');
        } else {
            showAlert('Invalid or corrupted workout data in the link.');
            // Load sections from localStorage or default
            const savedSections = JSON.parse(localStorage.getItem('sectionData'));
            if (savedSections && savedSections.length > 0) {
                loadSections(savedSections);
            } else {
                loadSections(defaultSections);
            }
        }
    } else {
        // Load sections from localStorage or default
        const savedSections = JSON.parse(localStorage.getItem('sectionData'));
        if (savedSections && savedSections.length > 0) {
            loadSections(savedSections);
        } else {
            loadSections(defaultSections);
        }
    }

    // Adjust notes visibility
    adjustNotesVisibility();

    // Setup event listeners
    setupEventListeners();
}
