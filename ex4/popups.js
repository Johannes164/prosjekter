// popups.js

import { toggleDarkModeClasses, updateExerciseInTable } from './helpers.js';
import { downloadWorkout } from './helpers.js';
import { saveSections, saveProgress } from './storage.js';
import { addSectionToDOM } from './helpers.js';
import { addExerciseToContainer } from './helpers.js';
import { selectedExercises, completedExercises, selectedExerciseOrder } from './storage.js';

/* -------------------- Popup Functions -------------------- */

export function showConfirmation(message, onConfirm) {
  const overlay = document.getElementById('confirmation-overlay');
  const popup = document.getElementById('confirmation-popup');
  overlay.style.display = 'flex';
  popup.innerHTML = `
    <p>${message}</p>
    <button id="confirm-yes" style="background-color: var(--accent-color); color: #fff;">Yes</button>
    <button id="confirm-no" style="background-color: var(--danger-color); color: #fff;">No</button>
  `;

  applyPopupDarkMode();

  const yesButton = popup.querySelector('#confirm-yes');
  const noButton = popup.querySelector('#confirm-no');

  yesButton.addEventListener('click', () => {
    overlay.style.display = 'none';
    if (onConfirm) onConfirm();
  });

  noButton.addEventListener('click', () => {
    overlay.style.display = 'none';
  });
}

export function showAlert(message) {
  const overlay = document.getElementById('alert-overlay');
  const popup = document.getElementById('alert-popup');
  overlay.style.display = 'flex';
  popup.innerHTML = `
    <p>${message}</p>
    <button id="alert-ok" style="background-color: var(--accent-color); color: #fff;">OK</button>
  `;

  applyPopupDarkMode();

  const okButton = popup.querySelector('#alert-ok');
  okButton.addEventListener('click', () => {
    overlay.style.display = 'none';
  });
}

export function showDownloadOptions() {
  const overlay = document.getElementById('confirmation-overlay');
  const popup = document.getElementById('confirmation-popup');
  overlay.style.display = 'flex';
  popup.innerHTML = `
    <p>Select download format:</p>
    <button id="download-pdf" style="background-color: var(--accent-color); color: #fff;">PDF</button>
    <button id="download-png" style="background-color: var(--accent-color); color: #fff;">PNG</button>
    <button id="download-csv" style="background-color: var(--accent-color); color: #fff;">CSV</button>
    <button id="cancel-download" style="background-color: var(--danger-color); color: #fff;">Cancel</button>
  `;

  applyPopupDarkMode();

  const pdfButton = popup.querySelector('#download-pdf');
  const pngButton = popup.querySelector('#download-png');
  const csvButton = popup.querySelector('#download-csv');
  const cancelButton = popup.querySelector('#cancel-download');

  pdfButton.addEventListener('click', () => {
    overlay.style.display = 'none';
    downloadWorkout('pdf');
  });

  pngButton.addEventListener('click', () => {
    overlay.style.display = 'none';
    downloadWorkout('png');
  });

  csvButton.addEventListener('click', () => {
    overlay.style.display = 'none';
    downloadWorkout('csv');
  });

  cancelButton.addEventListener('click', () => {
    overlay.style.display = 'none';
  });
}

export function showExerciseModal(exercise) {
  const modal = document.getElementById('exercise-modal');
  const modalContent = document.getElementById('modal-content');
  modal.style.display = 'flex';

  const nameInput = document.getElementById('modal-exercise-name');
  const setsInput = document.getElementById('modal-exercise-sets');
  const repsInput = document.getElementById('modal-exercise-reps');
  const restInput = document.getElementById('modal-exercise-rest');

  nameInput.value = exercise.dataset.name;
  setsInput.value = exercise.dataset.sets;
  repsInput.value = exercise.dataset.reps;
  restInput.value = exercise.dataset.rest;

  applyPopupDarkMode();

  const saveButton = document.getElementById('modal-save');
  const closeButton = document.getElementById('modal-close');

  // Remove existing event listeners to prevent duplicates
  const newSaveButton = saveButton.cloneNode(true);
  saveButton.parentNode.replaceChild(newSaveButton, saveButton);

  const newCloseButton = closeButton.cloneNode(true);
  closeButton.parentNode.replaceChild(newCloseButton, closeButton);

  newSaveButton.addEventListener('click', () => {
    // Update exercise data attributes
    exercise.dataset.name = nameInput.value;
    exercise.dataset.sets = setsInput.value;
    exercise.dataset.reps = repsInput.value;
    exercise.dataset.rest = restInput.value;

    // Update exercise name text
    const exerciseNameElement = exercise.querySelector('.exercise-name');
    exerciseNameElement.textContent = nameInput.value;

    // Save sections to persist changes
    saveSections();

    modal.style.display = 'none';

    // Update the exercise in the selected exercises table if it is selected
    if (exercise.classList.contains('selected')) {
      updateExerciseInTable(exercise);
    }
  });

  newCloseButton.addEventListener('click', () => {
    modal.style.display = 'none';
  });
}

export function showAddSectionPopup() {
  const overlay = document.getElementById('confirmation-overlay');
  const popup = document.getElementById('confirmation-popup');
  overlay.style.display = 'flex';
  popup.innerHTML = `
    <h2>Add New Section</h2>
    <label>
        Section Title:<br>
        <input type="text" id="new-section-title" style="width: 100%; padding: 5px;">
    </label><br><br>
    <button id="add-section-save" style="background-color: var(--accent-color); color: #fff;">Add Section</button>
    <button id="add-section-cancel" style="background-color: var(--danger-color); color: #fff;">Cancel</button>
  `;

  applyPopupDarkMode();

  const saveButton = popup.querySelector('#add-section-save');
  const cancelButton = popup.querySelector('#add-section-cancel');

  saveButton.addEventListener('click', () => {
    const title = document.getElementById('new-section-title').value;
    if (title.trim() === '') {
      showAlert('Section title cannot be empty.');
      return;
    }
    addSectionToDOM(title, []);
    saveSections();
    overlay.style.display = 'none';
  });

  cancelButton.addEventListener('click', () => {
    overlay.style.display = 'none';
  });
}

export function showAddExercisePopup(container) {
  const overlay = document.getElementById('confirmation-overlay');
  const popup = document.getElementById('confirmation-popup');
  overlay.style.display = 'flex';
  popup.innerHTML = `
    <h2>Add New Exercise</h2>
    <label>
        Name:<br>
        <input type="text" id="new-exercise-name" style="width: 100%; padding: 5px;">
    </label><br><br>
    <label>
        Sets:<br>
        <input type="text" id="new-exercise-sets" style="width: 100%; padding: 5px;">
    </label><br><br>
    <label>
        Reps:<br>
        <input type="text" id="new-exercise-reps" style="width: 100%; padding: 5px;">
    </label><br><br>
    <label>
        Rest:<br>
        <input type="text" id="new-exercise-rest" style="width: 100%; padding: 5px;">
    </label><br><br>
    <label>
        Note:<br>
        <input type="text" id="new-exercise-note" style="width: 100%; padding: 5px;">
    </label><br><br>
    <button id="add-exercise-save" style="background-color: var(--accent-color); color: #fff;">Add Exercise</button>
    <button id="add-exercise-cancel" style="background-color: var(--danger-color); color: #fff;">Cancel</button>
  `;

  applyPopupDarkMode();

  const saveButton = popup.querySelector('#add-exercise-save');
  const cancelButton = popup.querySelector('#add-exercise-cancel');

  saveButton.addEventListener('click', () => {
    const name = document.getElementById('new-exercise-name').value;
    const sets = document.getElementById('new-exercise-sets').value;
    const reps = document.getElementById('new-exercise-reps').value;
    const rest = document.getElementById('new-exercise-rest').value;
    const note = document.getElementById('new-exercise-note').value;

    if (name.trim() === '') {
      showAlert('Exercise name cannot be empty.');
      return;
    }

    const exerciseData = { name, sets, reps, rest, note };
    addExerciseToContainer(exerciseData, container);
    saveSections();
    overlay.style.display = 'none';
  });

  cancelButton.addEventListener('click', () => {
    overlay.style.display = 'none';
  });
}

export function showEditSectionPopup(sectionTitleElement, sectionElement) {
  const overlay = document.getElementById('confirmation-overlay');
  const popup = document.getElementById('confirmation-popup');
  overlay.style.display = 'flex';
  popup.innerHTML = `
    <h2>Edit Section</h2>
    <label>
        Section Title:<br>
        <input type="text" id="edit-section-title" style="width: 100%; padding: 5px;" value="${sectionTitleElement.textContent}">
    </label><br><br>
    <button id="edit-section-save" style="background-color: var(--accent-color); color: #fff;">Save</button>
    <button id="edit-section-delete" style="background-color: var(--danger-color); color: #fff;">Delete Section</button>
    <button id="edit-section-cancel" style="background-color: var(--warning-color); color: #fff;">Cancel</button>
  `;

  applyPopupDarkMode();

  const saveButton = popup.querySelector('#edit-section-save');
  const deleteButton = popup.querySelector('#edit-section-delete');
  const cancelButton = popup.querySelector('#edit-section-cancel');

  saveButton.addEventListener('click', () => {
    const newTitle = document.getElementById('edit-section-title').value;
    if (newTitle.trim() === '') {
      showAlert('Section title cannot be empty.');
      return;
    }
    sectionTitleElement.textContent = newTitle;
    saveSections();
    overlay.style.display = 'none';
  });

  deleteButton.addEventListener('click', () => {
    showConfirmation('Are you sure you want to delete this section?', () => {
      // Remove the section
      sectionElement.remove();

      // Remove any selected exercises that are in this section
      const exercisesInSection = sectionElement.querySelectorAll('.exercise');
      exercisesInSection.forEach((exercise) => {
        const name = exercise.dataset.name;

        // Remove from selectedExercises
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

        // Remove from table
        removeExerciseFromTable(name);
      });

      saveSections();
      overlay.style.display = 'none';
    });
  });

  cancelButton.addEventListener('click', () => {
    overlay.style.display = 'none';
  });
}

export function showProgressPopup() {
  const overlay = document.getElementById('confirmation-overlay');
  const popup = document.getElementById('confirmation-popup');
  const progressData = JSON.parse(localStorage.getItem('progressData')) || [];
  overlay.style.display = 'flex';

  if (progressData.length === 0) {
    popup.innerHTML = `
      <h2>Your Progress</h2>
      <p>No workouts completed yet.</p>
      <button id="close-progress" style="background-color: var(--danger-color); color: #fff;">Close</button>
    `;
  } else {
    popup.innerHTML = `
      <h2>Your Progress</h2>
      <div class="progress-container" style="max-height: 500px; overflow-y: auto; text-align: left; width: 100%;">
        ${progressData
          .map(
            (entry) => `
            <div style="margin-bottom: 15px;">
              <strong>Date:</strong> ${entry.date}<br>
              <table class="progress-table" style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th style="border-bottom: 1px solid #ccc; text-align: left;">Exercise</th>
                    <th style="border-bottom: 1px solid #ccc; text-align: left;">Note</th>
                  </tr>
                </thead>
                <tbody>
                  ${entry.exercises
                    .map(
                      (exercise) => `
                    <tr>
                      <td style="padding: 5px 0; border-bottom: 1px solid #eee;">${exercise.name}</td>
                      <td style="padding: 5px 0; border-bottom: 1px solid #eee;">${exercise.note || ''}</td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
          `
          )
          .join('')}
      </div>
      <button id="close-progress" style="background-color: var(--danger-color); color: #fff;">Close</button>
    `;
  }

  applyPopupDarkMode();

  const closeButton = popup.querySelector('#close-progress');

  closeButton.addEventListener('click', () => {
    overlay.style.display = 'none';
  });
}

/* -------------------- Helper Function for Popups -------------------- */

function applyPopupDarkMode() {
  const popups = [
    document.getElementById('confirmation-popup'),
    document.getElementById('alert-popup'),
    document.getElementById('modal-content'),
  ];
  popups.forEach((popup) => {
    toggleDarkModeClasses(
      [popup],
      document.body.classList.contains('dark-mode') ? 'add' : 'remove'
    );

    // Apply dark mode to tables in the progress popup
    if (popup.id === 'confirmation-popup') {
      const tables = popup.querySelectorAll('.progress-table');
      tables.forEach((table) => {
        toggleDarkModeClasses([table], document.body.classList.contains('dark-mode') ? 'add' : 'remove');
        table.querySelectorAll('th, td').forEach((cell) => {
          toggleDarkModeClasses([cell], document.body.classList.contains('dark-mode') ? 'add' : 'remove');
        });
      });
    }
  });
}
