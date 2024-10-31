// storage.js

import { addSectionToDOM } from './helpers.js';
import { adjustNotesVisibility } from './helpers.js';
import { addExerciseToTable } from './helpers.js';
import { toggleDarkModeClasses } from './helpers.js';

export let selectedExercises = JSON.parse(localStorage.getItem('selectedExercises')) || [];
export let completedExercises = JSON.parse(localStorage.getItem('completedExercises')) || [];
export let selectedExerciseOrder = JSON.parse(localStorage.getItem('selectedExerciseOrder')) || [];
export let progressData = JSON.parse(localStorage.getItem('progressData')) || [];

export const defaultSections = [
  {
    title: 'PUSH',
    exercises: [
      { name: 'Incline Barbell Bench Press', sets: '3-4', reps: '6-8', rest: '2-3' },
      { name: 'Standing Dumbbell Shoulder Press', sets: '3-4', reps: '10-15', rest: '2-3' },
      { name: 'Paused Flat Dumbbell Press', sets: '3-4', reps: '8-12', rest: '2-3' },
      { name: 'Lean-Away Dumbbell Lateral Raise', sets: '2-3 per arm', reps: '10-15', rest: '1 between arms' },
      { name: 'Seated Decline Cable Flies W/ Supination', sets: '2-3', reps: '10-15', rest: '1.5-2' },
      { name: 'Incline Dumbbell Overhead Extensions', sets: '2-3', reps: '10-15', rest: '1.5-2' },
    ],
  },
  {
    title: 'PULL',
    exercises: [
      { name: 'Pull-Ups OR Kneeling Lat Pulldowns', sets: '3-4', reps: '6-10 OR 10-15', rest: '2-2.5' },
      { name: 'Barbell Row', sets: '3-4', reps: '10-15', rest: '2-2.5' },
      { name: 'Reverse Grip Lat Pulldowns', sets: '3-4', reps: '8-12', rest: '2' },
      { name: 'Chest Supported Rear Delt Row', sets: '3-4', reps: '10-15', rest: '2' },
      { name: 'Narrow Grip Barbell Curl', sets: '2-3', reps: '8-12', rest: '1.5-2' },
      { name: 'Kneeling Face Pulls', sets: '2', reps: '10-15', rest: '1.5' },
      { name: 'Lying Face Pulls', sets: '2', reps: '10-15', rest: '1.5' },
    ],
  },
  {
    title: 'LEGS',
    exercises: [
      { name: 'Back Squats OR Front Squats', sets: '3-4', reps: '6-10', rest: '2-3' },
      { name: 'Barbell Hip Thrust', sets: '3-4', reps: '12-15', rest: '2-3' },
      { name: 'Split Squats (beginner) OR Bulgarian Split Squats (advanced)', sets: '4 each leg', reps: '8-12', rest: '1 min between each leg' },
      { name: 'Glute Ham Raise', sets: '3-4', reps: '10-15', rest: '2' },
    ],
  },
];

export function saveSections() {
  const sections = Array.from(document.querySelectorAll('.exercise-section')).map((section) => {
    const title = section.querySelector('.section-header h2').textContent;
    const exercises = Array.from(section.querySelectorAll('.exercise')).map((exercise) => {
      return {
        name: exercise.dataset.name,
        sets: exercise.dataset.sets,
        reps: exercise.dataset.reps,
        rest: exercise.dataset.rest,
        note: exercise.querySelector('.note').textContent,
      };
    });
    return { title, exercises };
  });
  localStorage.setItem('sectionData', JSON.stringify(sections));
}

export function loadSections(sectionsData) {
  // Clear existing sections
  document.querySelectorAll('.exercise-section').forEach((section) => section.remove());

  sectionsData.forEach((section) => addSectionToDOM(section.title, section.exercises));

  // Adjust notes visibility
  adjustNotesVisibility();

  // Load selected exercises into the table
  selectedExerciseOrder.forEach((exName) => {
    const exercise = document.querySelector(`.exercise[data-name="${exName}"]`);
    if (exercise && exercise.classList.contains('selected')) {
      addExerciseToTable(exercise);
    }
  });

  // Apply dark mode to selected exercises
  if (document.body.classList.contains('dark-mode')) {
    document.getElementById('selected-exercises').classList.add('dark-mode');
    document.querySelectorAll('#selected-exercises th').forEach((el) => el.classList.add('dark-mode'));
  } else {
    // Ensure that dark mode classes are removed when not in dark mode
    document.getElementById('selected-exercises').classList.remove('dark-mode');
    document.querySelectorAll('#selected-exercises th').forEach((el) => el.classList.remove('dark-mode'));
  }
}

export function saveProgress() {
  const date = new Date().toLocaleDateString();
  const exercisesWithNotes = completedExercises.map((exName) => {
    const exerciseElement = document.querySelector(`.exercise[data-name="${exName}"]`);
    const note = exerciseElement ? exerciseElement.querySelector('.note').textContent : '';
    return { name: exName, note };
  });

  const existingEntryIndex = progressData.findIndex((entry) => entry.date === date);

  if (existingEntryIndex !== -1) {
    // Merge exercises if an entry for today already exists
    progressData[existingEntryIndex].exercises = progressData[existingEntryIndex].exercises.concat(
      exercisesWithNotes
    );
  } else {
    const completedWorkout = {
      date,
      exercises: exercisesWithNotes,
    };
    progressData.push(completedWorkout);
  }
  localStorage.setItem('progressData', JSON.stringify(progressData));
}
