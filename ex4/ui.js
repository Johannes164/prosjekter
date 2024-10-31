// ui.js

import { createHelpPanel, createSettingsPanel } from './helpers.js';
import { createActionButtons, createControls } from './helpers.js';
import { showProgressPopup } from './popups.js';

export function setupUI() {
    // Create Help Button and Panel
    createHelpPanel();

    // Create Settings Button and Panel
    createSettingsPanel();

    // Create Control Buttons (e.g., Load Default, Export, Import)
    createControls();

    // Create Action Buttons (e.g., Complete Workout, Download)
    createActionButtons();

    // Create Search Toggle Button
    createSearchToggleButton();
}

export function setupEventListeners() {
    // Event listener for search input
    const exerciseSearch = document.getElementById('exercise-search');
    const searchSectionsToggle = document.getElementById('search-sections-toggle');
    let searchSectionsEnabled = searchSectionsToggle.checked;

    // Update the searchSectionsEnabled variable when the toggle is clicked
    searchSectionsToggle.addEventListener('change', function () {
        searchSectionsEnabled = this.checked;
        performSearch(exerciseSearch.value.toLowerCase(), searchSectionsEnabled);
    });

    exerciseSearch.addEventListener('input', function () {
        const query = exerciseSearch.value.toLowerCase();
        performSearch(query, searchSectionsEnabled);
    });

    // Accessibility: Close modals with Escape key
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            document.getElementById('exercise-modal').style.display = 'none';
            document.getElementById('confirmation-overlay').style.display = 'none';
            document.getElementById('alert-overlay').style.display = 'none';
            const helpPanel = document.getElementById('help-panel');
            if (helpPanel) helpPanel.style.display = 'none';
            const settingsPanel = document.getElementById('settings-panel');
            if (settingsPanel) settingsPanel.style.display = 'none';
        }
    });

    // Initialize sortable for the selected exercises table only if drag and drop is enabled
    const dragDropEnabled = localStorage.getItem('dragDropEnabled') === 'true';
    if (dragDropEnabled) {
        const exerciseTableBody = document.querySelector('#exercise-table tbody');
        new Sortable(exerciseTableBody, {
            animation: 150,
            onEnd: function (evt) {
                // Update the selectedExerciseOrder based on new order
                const selectedExerciseOrder = Array.from(exerciseTableBody.querySelectorAll('tr')).map(row => row.dataset.name);
                localStorage.setItem('selectedExerciseOrder', JSON.stringify(selectedExerciseOrder));
            }
        });
    }
}

function performSearch(query, searchSectionsEnabled) {
    const sections = document.querySelectorAll('.exercise-section');

    sections.forEach(section => {
        const sectionTitle = section.querySelector('.section-header h2').textContent.toLowerCase();
        const exercises = section.querySelectorAll('.exercise');
        let sectionMatches = false;

        // Check if the section title matches and the toggle is enabled
        if (searchSectionsEnabled && sectionTitle.includes(query)) {
            exercises.forEach(exercise => {
                exercise.style.display = ''; // Show all exercises in the matching section
            });
            sectionMatches = true;
        } else {
            let hasVisibleExercise = false;
            exercises.forEach(exercise => {
                const name = exercise.dataset.name.toLowerCase();
                if (name.includes(query)) {
                    exercise.style.display = '';
                    hasVisibleExercise = true;
                } else {
                    exercise.style.display = 'none';
                }
            });
            sectionMatches = hasVisibleExercise;
        }

        // Hide or show the section based on whether it has any visible exercises
        section.style.display = sectionMatches ? '' : 'none';
    });
}

function createSearchToggleButton() {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';

    const exerciseSearch = document.getElementById('exercise-search');

    // Create the toggle switch
    const toggleLabel = document.createElement('label');
    toggleLabel.className = 'toggle-switch small';

    const toggleInput = document.createElement('input');
    toggleInput.type = 'checkbox';
    toggleInput.id = 'search-sections-toggle';

    const toggleSlider = document.createElement('span');
    toggleSlider.className = 'slider';

    const toggleText = document.createElement('span');
    toggleText.className = 'toggle-label';
    toggleText.textContent = 'Include Sections';

    toggleLabel.appendChild(toggleInput);
    toggleLabel.appendChild(toggleSlider);
    toggleLabel.appendChild(toggleText);

    // Append the search bar and toggle to the search container
    exerciseSearch.parentNode.insertBefore(searchContainer, exerciseSearch);
    searchContainer.appendChild(exerciseSearch);
    searchContainer.appendChild(toggleLabel);
}
