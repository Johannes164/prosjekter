// helpers.js

import {
  showConfirmation,
  showAlert,
  showExerciseModal,
  showDownloadOptions,
  showAddSectionPopup,
  showAddExercisePopup,
  showEditSectionPopup,
  showProgressPopup,
} from './popups.js';
import { saveSections, saveProgress } from './storage.js';
import { loadSections, defaultSections } from './storage.js';
import {
  selectedExercises,
  completedExercises,
  selectedExerciseOrder,
} from './storage.js';

/* -------------------- Utility Functions -------------------- */

export function encodeWorkoutData(data) {
  return encodeURIComponent(btoa(JSON.stringify(data)));
}

export function decodeWorkoutData(encodedData) {
  try {
    return JSON.parse(atob(decodeURIComponent(encodedData)));
  } catch (e) {
    return null;
  }
}

export function toggleDarkModeClasses(elements, action) {
  elements.forEach((element) => {
    if (element) {
      element.classList[action]('dark-mode');
    }
  });
}

/* -------------------- Settings Functions -------------------- */

export function loadSettings() {
  // Load dark mode setting from localStorage
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  }

  // Load font size
  const savedFontSize = localStorage.getItem('fontSize') || 'medium';
  document.body.classList.add(`${savedFontSize}-font`);

  // Load theme
  const savedTheme = localStorage.getItem('theme') || 'theme-blue'; // Set blue as the new default
  document.body.classList.add(savedTheme);
}

export function createSettingsPanel() {
  const settingsButton = document.createElement('button');
  settingsButton.id = 'settings-button';
  settingsButton.innerHTML = '⚙️'; // Settings emoji
  settingsButton.setAttribute('aria-label', 'Settings');
  settingsButton.style.top = '20px'; // Move 20 pixels up
  document.body.appendChild(settingsButton);

  const settingsPanel = document.createElement('div');
  settingsPanel.id = 'settings-panel';
  settingsPanel.innerHTML = `
    <label class="toggle-switch">
        <input type="checkbox" id="dark-mode-toggle">
        <span class="slider"></span>
        <span class="toggle-label">Dark Mode</span>
    </label>
    <label class="toggle-switch">
        <input type="checkbox" id="notes-display-toggle">
        <span class="slider"></span>
        <span class="toggle-label">Show Notes</span>
    </label>
    <!-- New Drag and Drop Toggle -->
    <label class="toggle-switch">
        <input type="checkbox" id="drag-drop-toggle">
        <span class="slider"></span>
        <span class="toggle-label">Enable Drag and Drop</span>
    </label>
    <label>
        Font Size:
        <select id="font-size-select" style="width: 100%; padding: 5px; margin-top: 5px;">
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
        </select>
    </label>
    <label>
        Theme:
        <select id="theme-select" style="width: 100%; padding: 5px; margin-top: 5px;">
            <option value="theme-blue">Blue</option>
            <option value="theme-red">Red</option>
            <option value="theme-green">Green</option>
            <option value="theme-purple">Purple</option>
            <option value="theme-orange">Orange</option>
            <option value="high-contrast">High Contrast</option>
        </select>
    </label>
    <button id="reset-data">Reset Data</button>
    <button id="use-old-version">Use the Old Version</button>
  `;
  document.body.appendChild(settingsPanel);

  let isSettingsPanelOpen = false;
  settingsButton.addEventListener('click', () => {
    isSettingsPanelOpen = !isSettingsPanelOpen;
    settingsPanel.style.display = isSettingsPanelOpen ? 'block' : 'none';
  });

  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const notesDisplayToggle = document.getElementById('notes-display-toggle');
  const fontSizeSelect = document.getElementById('font-size-select');
  const themeSelect = document.getElementById('theme-select');
  const dragDropToggle = document.getElementById('drag-drop-toggle');

  // Set initial state based on localStorage
  darkModeToggle.checked = localStorage.getItem('darkMode') === 'true';
  notesDisplayToggle.checked = localStorage.getItem('notesVisible') !== 'false'; // Default to true
  const savedFontSize = localStorage.getItem('fontSize') || 'medium';
  fontSizeSelect.value = savedFontSize;
  const savedTheme = localStorage.getItem('theme') || 'theme-blue'; // Set blue as the new default
  themeSelect.value = savedTheme;

  // Set initial state for drag and drop based on localStorage or screen width
  let dragDropEnabled = localStorage.getItem('dragDropEnabled');
  if (dragDropEnabled === null) {
    // Default to off if screen width is 768px or smaller
    if (window.innerWidth <= 768) {
      dragDropEnabled = 'false';
    } else {
      dragDropEnabled = 'true';
    }
    localStorage.setItem('dragDropEnabled', dragDropEnabled);
  }
  dragDropToggle.checked = dragDropEnabled === 'true';

  darkModeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
    const elementsToToggle = document.querySelectorAll(
      '.exercise-section, #selected-exercises, .exercise, th, td, tbody tr, .weight-input, .section-header, .exercise-menu'
    );
    toggleDarkModeClasses(elementsToToggle, 'toggle');
    settingsPanel.classList.toggle('dark-mode');
    const helpPanel = document.getElementById('help-panel');
    if (helpPanel) helpPanel.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
  });

  notesDisplayToggle.addEventListener('change', () => {
    const notesVisible = notesDisplayToggle.checked;
    document.querySelectorAll('.note').forEach((note) => {
      if (note.textContent.trim() !== '') {
        note.classList.toggle('visible', notesVisible);
      }
    });
    localStorage.setItem('notesVisible', notesVisible);
  });

  fontSizeSelect.addEventListener('change', () => {
    const selectedFontSize = fontSizeSelect.value;
    document.body.classList.remove('small-font', 'medium-font', 'large-font');
    document.body.classList.add(`${selectedFontSize}-font`);
    localStorage.setItem('fontSize', selectedFontSize);
  });

  themeSelect.addEventListener('change', () => {
    const selectedTheme = themeSelect.value;
    document.body.classList.remove(
      'theme-blue',
      'theme-red',
      'theme-green',
      'theme-purple',
      'theme-orange',
      'high-contrast'
    );
    document.body.classList.add(selectedTheme);
    localStorage.setItem('theme', selectedTheme);
  });

  dragDropToggle.addEventListener('change', () => {
    const isEnabled = dragDropToggle.checked;
    localStorage.setItem('dragDropEnabled', isEnabled);
    // Reload the page to apply changes
    location.reload();
  });

  document.getElementById('reset-data').addEventListener('click', () => {
    showConfirmation(
      'Are you sure you want to reset all data? This will clear your saved workouts and settings.',
      () => {
        localStorage.clear();
        location.reload();
      }
    );
  });

  document.getElementById('use-old-version').addEventListener('click', () => {
    window.open('https://johannes164.github.io/prosjekter/ex.html', '_blank');
  });

  // Apply dark mode to settings panel if active
  if (document.body.classList.contains('dark-mode')) {
    settingsPanel.classList.add('dark-mode');
  }
}

/* -------------------- Notes Functions -------------------- */

export function adjustNotesVisibility() {
  let notesVisible = localStorage.getItem('notesVisible');
  if (notesVisible === null) {
    notesVisible = 'true';
    localStorage.setItem('notesVisible', 'true');
  }
  const isVisible = notesVisible === 'true';
  document.querySelectorAll('.note').forEach((note) => {
    if (note.textContent.trim() !== '') {
      note.classList.toggle('visible', isVisible);
    } else {
      note.classList.remove('visible');
    }
  });
}

/* -------------------- Help Functions -------------------- */

export function createHelpPanel() {
  const helpButton = document.createElement('button');
  helpButton.id = 'help-button';
  helpButton.innerHTML = '❔';
  helpButton.setAttribute('aria-label', 'Help');
  helpButton.style.top = '20px'; // Move 20 pixels up
  document.body.appendChild(helpButton);

  const helpPanel = document.createElement('div');
  helpPanel.id = 'help-panel';
  helpPanel.innerHTML = `
    <h2>Quick Guide</h2>
    <ul style="text-align: left;">
        <li>Click exercises to select or deselect them.</li>
        <li>Use the search bar to find exercises.</li>
        <li>Drag exercises in your workout to reorder them.</li>
        <li>Add or edit exercises and sections as needed.</li>
        <li>Use the buttons to manage your workout.</li>
    </ul>
    <button id="close-help">Close</button>
  `;
  document.body.appendChild(helpPanel);

  let isHelpPanelOpen = false;
  helpButton.addEventListener('click', () => {
    isHelpPanelOpen = !isHelpPanelOpen;
    helpPanel.style.display = isHelpPanelOpen ? 'block' : 'none';
    toggleDarkModeClasses(
      [helpPanel],
      document.body.classList.contains('dark-mode') ? 'add' : 'remove'
    );
  });

  document.getElementById('close-help').addEventListener('click', () => {
    helpPanel.style.display = 'none';
    isHelpPanelOpen = false;
  });
}

/* -------------------- Actions and Controls Functions -------------------- */

export function createControls() {
  const controlsDiv = document.createElement('div');
  controlsDiv.className = 'controls';

  const sectionsTitle = document.createElement('h2');
  sectionsTitle.textContent = 'Sections';
  controlsDiv.appendChild(sectionsTitle);

  const resetButton = document.createElement('button');
  resetButton.id = 'reset-button';
  resetButton.textContent = 'Reset';

  const exportButton = document.createElement('button');
  exportButton.id = 'export-button';
  exportButton.textContent = 'Export';

  const importButton = document.createElement('button');
  importButton.id = 'import-button';
  importButton.textContent = 'Import';

  controlsDiv.appendChild(resetButton);
  controlsDiv.appendChild(exportButton);
  controlsDiv.appendChild(importButton);

  // Insert controls after the "Sections" title
  document.querySelector('main').insertBefore(
    controlsDiv,
    document.querySelector('#exercise-search').nextSibling
  );

  // Event listeners for controls
  resetButton.addEventListener('click', () => {
    showConfirmation(
      'Are you sure you want to load the default sections? This will replace your current sections.',
      () => {
        localStorage.removeItem('sectionData');
        loadSections(defaultSections);
        saveSections();
        showAlert('Default sections loaded.');
      }
    );
  });

  exportButton.addEventListener('click', () => {
    const sections = JSON.parse(localStorage.getItem('sectionData')) || [];
    const dataStr = JSON.stringify(sections, null, 2);

    // Create a blob and trigger a download
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'workout_sections.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  importButton.addEventListener('click', () => {
    // Create a hidden file input
    const importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.accept = '.json';
    importInput.style.display = 'none';
    document.body.appendChild(importInput);

    importInput.addEventListener('change', () => {
      const file = importInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedSections = JSON.parse(e.target.result);
            if (Array.isArray(importedSections)) {
              localStorage.setItem('sectionData', JSON.stringify(importedSections));
              loadSections(importedSections);
              saveSections();
              showAlert('Workout imported successfully.');
            } else {
              showAlert('Invalid JSON format.');
            }
          } catch (error) {
            showAlert('Error parsing JSON.');
          }
        };
        reader.readAsText(file);
      } else {
        showAlert('Please select a file to import.');
      }
      document.body.removeChild(importInput);
    });

    // Trigger the file input
    importInput.click();
  });

  // Get the "New Section" button
  const newSectionButton = document.getElementById('new-section-button');

  // Attach event listener to the "New Section" button
  if (newSectionButton) {
    newSectionButton.addEventListener('click', () => {
      showAddSectionPopup(); // Show the popup when the button is clicked
    });
  } else {
    // If the button doesn't exist, create it
    const newSectionBtn = document.createElement('button');
    newSectionBtn.id = 'new-section-button';
    newSectionBtn.textContent = 'New Section';
    newSectionBtn.style.backgroundColor = 'var(--accent-color)';
    newSectionBtn.style.color = '#fff';
    newSectionBtn.style.marginTop = '20px';

    document.querySelector('main').appendChild(newSectionBtn);

    newSectionBtn.addEventListener('click', () => {
      showAddSectionPopup();
    });
  }
}

export function createActionButtons() {
  const actionButtonsDiv = document.createElement('div');
  actionButtonsDiv.className = 'action-buttons';
  const selectedExercisesDiv = document.getElementById('selected-exercises');
  selectedExercisesDiv.appendChild(actionButtonsDiv);

  const firstRow = document.createElement('div');
  firstRow.className = 'action-buttons-row';

  const completeButton = document.createElement('button');
  completeButton.id = 'complete-button';
  completeButton.textContent = 'Confirm Workout Completed';

  const viewProgressButton = document.createElement('button');
  viewProgressButton.id = 'view-progress-button';
  viewProgressButton.textContent = 'View Progress';

  firstRow.appendChild(completeButton);
  firstRow.appendChild(viewProgressButton);

  const secondRow = document.createElement('div');
  secondRow.className = 'action-buttons-row';

  const downloadButton = document.createElement('button');
  downloadButton.id = 'download-button';
  downloadButton.textContent = 'Download Workout';

  const shareButton = document.createElement('button');
  shareButton.id = 'share-button';
  shareButton.textContent = 'Share Workout';

  secondRow.appendChild(downloadButton);
  secondRow.appendChild(shareButton);

  actionButtonsDiv.appendChild(firstRow);
  actionButtonsDiv.appendChild(secondRow);

  const deselectAllButton = document.createElement('button');
  deselectAllButton.id = 'deselect-all-button';
  deselectAllButton.textContent = 'Deselect All';

  selectedExercisesDiv.appendChild(deselectAllButton);

  // Event listeners for buttons
  completeButton.addEventListener('click', () => {
    if (selectedExercises.length === 0) {
      showAlert('Please select exercises before confirming the workout.');
      return;
    }

    // Remove 'completed' class from previous exercises
    document.querySelectorAll('.exercise.completed').forEach((exercise) => {
      exercise.classList.remove('completed');
    });

    // Mark selected exercises as completed
    document.querySelectorAll('.exercise.selected').forEach((exercise) => {
      exercise.classList.add('completed');
    });

    // Update completedExercises array
    completedExercises.length = 0;
    completedExercises.push(...selectedExercises);
    localStorage.setItem('completedExercises', JSON.stringify(completedExercises));

    // Save progress
    saveProgress();

    // Clear selectedExercises array and remove 'selected' classes
    selectedExercises.length = 0;
    localStorage.removeItem('selectedExercises');
    localStorage.removeItem('selectedExerciseOrder');
    document.querySelectorAll('.exercise.selected').forEach((exercise) => {
      exercise.classList.remove('selected');
    });

    // Clear the table
    const exerciseTableBody = document.querySelector('#exercise-table tbody');
    while (exerciseTableBody.firstChild) {
      exerciseTableBody.removeChild(exerciseTableBody.firstChild);
    }

    showAlert('Workout completed and saved!');
  });

  viewProgressButton.addEventListener('click', () => {
    showProgressPopup();
  });

  deselectAllButton.addEventListener('click', () => {
    selectedExercises.length = 0;
    selectedExerciseOrder.length = 0;
    localStorage.removeItem('selectedExercises');
    localStorage.removeItem('selectedExerciseOrder');

    document.querySelectorAll('.exercise.selected').forEach((exercise) => {
      exercise.classList.remove('selected');
    });

    // Clear the table
    const exerciseTableBody = document.querySelector('#exercise-table tbody');
    while (exerciseTableBody.firstChild) {
      exerciseTableBody.removeChild(exerciseTableBody.firstChild);
    }
  });

  shareButton.addEventListener('click', () => {
    const sections = JSON.parse(localStorage.getItem('sectionData')) || [];
    const encodedData = encodeWorkoutData(sections);
    const shareableLink = `${window.location.origin}${window.location.pathname}?data=${encodedData}`;
    copyToClipboardWithAnimation(shareableLink, shareButton);
  });

  downloadButton.addEventListener('click', () => {
    showDownloadOptions();
  });
}

/* -------------------- Exercises and DOM Manipulation Functions -------------------- */

export function addSectionToDOM(title, exercises = []) {
  const section = document.createElement('div');
  section.className = 'exercise-section';

  const sectionHeader = document.createElement('div');
  sectionHeader.className = 'section-header';

  const sectionTitle = document.createElement('h2');
  sectionTitle.textContent = title || 'Untitled Section';

  const addExerciseButton = document.createElement('button');
  addExerciseButton.textContent = 'Add Exercise';
  addExerciseButton.className = 'add-exercise-button';

  const editSectionButton = document.createElement('button');
  editSectionButton.innerHTML = '📝';
  editSectionButton.className = 'edit-section-button';

  sectionHeader.appendChild(sectionTitle);
  sectionHeader.appendChild(addExerciseButton);
  sectionHeader.appendChild(editSectionButton);

  section.appendChild(sectionHeader);

  const exerciseContainer = document.createElement('div');
  exerciseContainer.className = 'exercise-container';

  exercises.forEach((exerciseData) => {
    addExerciseToContainer(exerciseData, exerciseContainer);
  });

  section.appendChild(exerciseContainer);

  // Insert the section before the "New Section" button
  const newSectionButton = document.getElementById('new-section-button');
  document.querySelector('main').insertBefore(section, newSectionButton);

  // Initialize Sortable for the exercises in this section if drag and drop is enabled
  const dragDropEnabled = localStorage.getItem('dragDropEnabled') === 'true';
  if (dragDropEnabled) {
    new Sortable(exerciseContainer, {
      animation: 150,
      onEnd: function () {
        saveSections(); // Save the new order
      },
    });
  }

  // Apply dark mode if active
  if (document.body.classList.contains('dark-mode')) {
    toggleDarkModeClasses([section, sectionHeader], 'add');
  } else {
    toggleDarkModeClasses([section, sectionHeader], 'remove');
  }

  // Event listeners for section buttons
  editSectionButton.addEventListener('click', () => {
    showEditSectionPopup(sectionTitle, section);
  });

  addExerciseButton.addEventListener('click', () => {
    showAddExercisePopup(exerciseContainer);
  });
}

export function addExerciseToContainer(exerciseData, container) {
  const exercise = document.createElement('div');
  exercise.className = 'exercise';
  exercise.dataset.name = exerciseData.name || '';
  exercise.dataset.sets = exerciseData.sets || '';
  exercise.dataset.reps = exerciseData.reps || '';
  exercise.dataset.rest = exerciseData.rest || '';

  // Exercise Name
  const exerciseName = document.createElement('span');
  exerciseName.className = 'exercise-name';
  exerciseName.textContent = exerciseData.name || 'Unnamed Exercise';

  const note = document.createElement('div');
  note.className = 'note';

  // Set note text if it exists
  if (exerciseData.note && exerciseData.note.trim() !== '') {
    note.textContent = exerciseData.note;
  }

  // Exercise menu button
  const exerciseMenuButton = document.createElement('button');
  exerciseMenuButton.innerHTML = '...';
  exerciseMenuButton.className = 'exercise-menu-button';

  const exerciseMenu = document.createElement('div');
  exerciseMenu.className = 'exercise-menu';

  const viewDetailsOption = document.createElement('button');
  viewDetailsOption.textContent = 'Details';

  const removeExerciseOption = document.createElement('button');
  removeExerciseOption.textContent = 'Remove Exercise';
  removeExerciseOption.style.color = '#d32f2f';

  exerciseMenu.appendChild(viewDetailsOption);
  exerciseMenu.appendChild(removeExerciseOption);

  exercise.appendChild(exerciseName);
  exercise.appendChild(note);
  exercise.appendChild(exerciseMenuButton);
  exercise.appendChild(exerciseMenu);

  container.appendChild(exercise);

  // Apply 'selected' class if exercise is selected
  if (selectedExercises.includes(exercise.dataset.name)) {
    exercise.classList.add('selected');
  }

  // Apply 'completed' class if exercise is completed
  if (completedExercises.includes(exercise.dataset.name)) {
    exercise.classList.add('completed');
  }

  // Apply dark mode if active
  if (document.body.classList.contains('dark-mode')) {
    toggleDarkModeClasses([exercise, exerciseMenu], 'add');
  } else {
    toggleDarkModeClasses([exercise, exerciseMenu], 'remove');
  }

  exerciseMenuButton.addEventListener('click', (event) => {
    event.stopPropagation();
    exerciseMenu.style.display = exerciseMenu.style.display === 'block' ? 'none' : 'block';
  });

  // Close the menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!exerciseMenu.contains(e.target) && !exerciseMenuButton.contains(e.target)) {
      exerciseMenu.style.display = 'none';
    }
  });

  removeExerciseOption.addEventListener('click', (event) => {
    event.stopPropagation();
    exerciseMenu.style.display = 'none';
    showConfirmation('Are you sure you want to remove this exercise?', () => {
      const name = exercise.dataset.name;
      // Update selected and completed exercises
      const selectedIndex = selectedExercises.indexOf(name);
      if (selectedIndex > -1) {
        selectedExercises.splice(selectedIndex, 1);
      }
      const completedIndex = completedExercises.indexOf(name);
      if (completedIndex > -1) {
        completedExercises.splice(completedIndex, 1);
      }
      const orderIndex = selectedExerciseOrder.indexOf(name);
      if (orderIndex > -1) {
        selectedExerciseOrder.splice(orderIndex, 1);
      }
      localStorage.setItem('selectedExercises', JSON.stringify(selectedExercises));
      localStorage.setItem('completedExercises', JSON.stringify(completedExercises));
      localStorage.setItem('selectedExerciseOrder', JSON.stringify(selectedExerciseOrder));

      if (exercise.classList.contains('selected')) {
        removeExerciseFromTable(name);
      }

      exercise.remove();
      saveSections();
    });
  });

  viewDetailsOption.addEventListener('click', (event) => {
    event.stopPropagation();
    exerciseMenu.style.display = 'none';
    showExerciseModal(exercise);
  });

  exercise.addEventListener('click', function (event) {
    if (event.target === exerciseMenuButton || exerciseMenu.contains(event.target)) {
      return;
    }
    const name = exercise.dataset.name;
    if (exercise.classList.contains('selected')) {
      exercise.classList.remove('selected');
      removeExerciseFromTable(name);
      selectedExercises.splice(selectedExercises.indexOf(name), 1);
      selectedExerciseOrder.splice(selectedExerciseOrder.indexOf(name), 1);
    } else {
      exercise.classList.add('selected');
      addExerciseToTable(exercise);
      selectedExercises.push(name);
      selectedExerciseOrder.push(name);
    }
    localStorage.setItem('selectedExercises', JSON.stringify(selectedExercises));
    localStorage.setItem('selectedExerciseOrder', JSON.stringify(selectedExerciseOrder));
  });

  // Display notes on the exercise button
  if (note.textContent.trim() !== '') {
    note.classList.add('visible');
  }

  // Ensure the exercise starts in the correct mode
  if (document.body.classList.contains('dark-mode')) {
    exercise.classList.add('dark-mode');
  } else {
    exercise.classList.remove('dark-mode');
  }
}

export function addExerciseToTable(exercise) {
  const exerciseTableBody = document.querySelector('#exercise-table tbody');
  const row = document.createElement('tr');
  row.classList.toggle('dark-mode', document.body.classList.contains('dark-mode'));

  row.setAttribute('data-name', exercise.dataset.name);

  // Remove Button
  const removeCell = document.createElement('td');
  const removeButton = document.createElement('button');
  removeButton.textContent = '❌';
  removeButton.className = 'remove-button';
  removeCell.appendChild(removeButton);

  // Append the removeCell to the row
  row.appendChild(removeCell);

  // Now create other cells and append them to the row
  const nameCell = document.createElement('td');
  nameCell.textContent = exercise.dataset.name;
  row.appendChild(nameCell);

  const setsCell = document.createElement('td');
  setsCell.textContent = exercise.dataset.sets;
  row.appendChild(setsCell);

  const repsCell = document.createElement('td');
  repsCell.textContent = exercise.dataset.reps;
  row.appendChild(repsCell);

  const restCell = document.createElement('td');
  restCell.textContent = exercise.dataset.rest;
  row.appendChild(restCell);

  // Weight Input Cell
  const weightCell = document.createElement('td');
  const weightInput = document.createElement('input');
  weightInput.type = 'text';
  weightInput.className = 'weight-input';
  weightInput.placeholder = 'Add note';
  weightInput.classList.toggle('dark-mode', document.body.classList.contains('dark-mode'));
  weightCell.appendChild(weightInput);
  row.appendChild(weightCell);

  // Apply 'dark-mode' class to each 'td' in the row
  if (document.body.classList.contains('dark-mode')) {
    row.querySelectorAll('td').forEach((td) => td.classList.add('dark-mode'));
  }

  // Now append the row to the table body
  exerciseTableBody.appendChild(row);

  // Add event listener to removeButton
  removeButton.addEventListener('click', (event) => {
    event.stopPropagation();

    const name = exercise.dataset.name;

    // Find the exercise element in the exercises list
    const exerciseElement = document.querySelector(`.exercise[data-name="${name}"]`);
    if (exerciseElement) {
      exerciseElement.classList.remove('selected');
    }

    // Check if selected exercise exists in the array
    const selectedIndex = selectedExercises.indexOf(name);
    if (selectedIndex > -1) {
      selectedExercises.splice(selectedIndex, 1);
    }

    const orderIndex = selectedExerciseOrder.indexOf(name);
    if (orderIndex > -1) {
      selectedExerciseOrder.splice(orderIndex, 1);
    }

    localStorage.setItem('selectedExercises', JSON.stringify(selectedExercises));
    localStorage.setItem('selectedExerciseOrder', JSON.stringify(selectedExerciseOrder));

    // Remove the row from the table
    row.parentNode.removeChild(row);
  });

  const noteElement = exercise.querySelector('.note');
  if (noteElement.textContent.trim() !== '') {
    weightInput.value = noteElement.textContent;
  }

  weightInput.addEventListener('input', function () {
    if (weightInput.value.trim() !== '') {
      noteElement.textContent = weightInput.value;
      noteElement.classList.toggle('visible', localStorage.getItem('notesVisible') === 'true');
    } else {
      noteElement.textContent = '';
      noteElement.classList.remove('visible');
    }
    saveSections(); // Save the updated note
  });

  // Ensure the note display is correct on reload
  if (noteElement.textContent.trim() !== '') {
    noteElement.classList.toggle('visible', localStorage.getItem('notesVisible') === 'true');
  } else {
    noteElement.classList.remove('visible');
  }
}

export function removeExerciseFromTable(name) {
  const exerciseTableBody = document.querySelector('#exercise-table tbody');
  const rows = exerciseTableBody.querySelectorAll('tr');
  rows.forEach((row) => {
    if (row.getAttribute('data-name') === name) {
      exerciseTableBody.removeChild(row);
    }
  });
}

export function updateExerciseInTable(exercise) {
  const name = exercise.dataset.name;
  const exerciseTableBody = document.querySelector('#exercise-table tbody');
  const rows = exerciseTableBody.querySelectorAll('tr');

  rows.forEach((row) => {
    if (row.getAttribute('data-name') === name) {
      // Update the cells in the row
      const cells = row.querySelectorAll('td');
      // cells[1] is the exercise name
      cells[1].textContent = exercise.dataset.name;
      cells[2].textContent = exercise.dataset.sets;
      cells[3].textContent = exercise.dataset.reps;
      cells[4].textContent = exercise.dataset.rest;
      // Note is in cells[5], keep the input value
    }
  });
}

/* -------------------- Download Functions -------------------- */

// Dynamically load jsPDF and autoTable if not already loaded
if (!window.jspdf) {
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  script.onload = () => {
    loadAutoTable();
  };
  document.head.appendChild(script);
} else {
  loadAutoTable();
}

function loadAutoTable() {
  if (!window.jspdf.jsPDF.API.autoTable) {
    const script = document.createElement('script');
    script.src =
      'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js';
    document.head.appendChild(script);
  }
}

export function downloadWorkout(format) {
  const exerciseTable = document.getElementById('exercise-table');

  if (format === 'csv') {
    const exerciseTableBody = document.querySelector('#exercise-table tbody');
    if (exerciseTableBody.children.length === 0) {
      showAlert('No exercises to download. Please select exercises first.');
      return;
    }
    let csvContent = 'Exercise,Sets,Reps,Rest,Note\n';

    Array.from(exerciseTableBody.children).forEach((row) => {
      const cells = row.querySelectorAll('td');
      const exerciseName = cells[1].textContent;
      const sets = cells[2].textContent;
      const reps = cells[3].textContent;
      const rest = cells[4].textContent;
      const note = cells[5].querySelector('input').value || '';
      const rowContent = `"${exerciseName}","${sets}","${reps}","${rest}","${note}"\n`;
      csvContent += rowContent;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'workout.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  } else if (format === 'png') {
    if (!exerciseTable) {
      showAlert('No exercises to download. Please select exercises first.');
      return;
    }

    // Clone the table to avoid modifying the original
    const clonedTable = exerciseTable.cloneNode(true);
    clonedTable.style.backgroundColor = getComputedStyle(document.body).backgroundColor;
    clonedTable.style.color = getComputedStyle(document.body).color;
    clonedTable.querySelectorAll('th, td').forEach((cell) => {
      cell.style.backgroundColor = getComputedStyle(cell).backgroundColor;
      cell.style.color = getComputedStyle(cell).color;
    });

    // Create a container for rendering
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '-9999px';
    container.appendChild(clonedTable);
    document.body.appendChild(container);

    html2canvas(clonedTable, { scale: 2 }).then((canvas) => {
      const link = document.createElement('a');
      link.download = 'workout.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      document.body.removeChild(container); // Clean up
    });
  } else if (format === 'pdf') {
    if (!exerciseTable) {
      showAlert('No exercises to download. Please select exercises first.');
      return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'pt', 'a4');
    const exerciseTableBody = document.querySelector('#exercise-table tbody');
    if (exerciseTableBody.children.length === 0) {
      showAlert('No exercises to download. Please select exercises first.');
      return;
    }

    const columns = ["Exercise", "Sets", "Reps", "Rest", "Note"];
    const rows = [];

    Array.from(exerciseTableBody.children).forEach((row) => {
      const cells = row.querySelectorAll('td');
      const exerciseName = cells[1].textContent;
      const sets = cells[2].textContent;
      const reps = cells[3].textContent;
      const rest = cells[4].textContent;
      const note = cells[5].querySelector('input').value || '';
      rows.push([exerciseName, sets, reps, rest, note]);
    });

    // Now add the table to the PDF
    pdf.autoTable({
      head: [columns],
      body: rows,
      startY: 20,
    });

    pdf.save('workout.pdf');
  }
}

/* -------------------- Copy to Clipboard Function -------------------- */

export function copyToClipboardWithAnimation(text, button) {
  navigator.clipboard.writeText(text).then(
    () => {
      // Change button to green with checkmark
      const originalText = button.textContent;
      button.style.backgroundColor = 'green';
      button.textContent = 'Link Copied';
      // Revert back after 2 seconds
      setTimeout(() => {
        button.style.backgroundColor = 'var(--accent-color)';
        button.textContent = originalText;
      }, 2000);
    },
    () => {
      showAlert('Failed to copy to clipboard.');
    }
  );
}
