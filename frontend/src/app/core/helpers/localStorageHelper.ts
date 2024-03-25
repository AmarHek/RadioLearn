const uuidStorageKey = "UUID";
const surveyStorageKey = "survey";
const resetKey = "reset";

/**
 * Returns the UUID stored in local storage. If there is no UUID, a new UUID will be generated, stored in local
 * storage and returned.
 */
export function getUUID(): string {
  const currentUUID = localStorage.getItem(uuidStorageKey);
  if (currentUUID == null) {
    const newUUID = generateUUID();
    localStorage.setItem(uuidStorageKey, newUUID);
    console.log("Generated new UUID: " + newUUID);
    return newUUID;
  } else {
    console.log("Found existing UUID: " + currentUUID);
    return currentUUID;
  }
}

/**
 * Returns a randomly generated alphanumeric UUID of format xxxx-xxxx-xxxx-xxxx
 */
export function generateUUID(): string {
  const validChars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const uuidTemplate = "xxxx-xxxx-xxxx-xxxx";
  let UUID = "";
  for (let i = 0; i < uuidTemplate.length; i++) {
    if (uuidTemplate[i] === "x") {
      UUID += validChars.charAt(Math.floor(Math.random() * validChars.length));
    } else {
      UUID += "-";
    }
  }
  return UUID;
}

/**
 * Returns -1 if the survey link has been clicked once, or a positive integer for the amount of materials that have
 * been completed.
 */
export function getSurveyStatus(): number {
  const surveyStatus = localStorage.getItem(surveyStorageKey);
  if (surveyStatus == null) {
    const newSurveyStatus = String(0);
    localStorage.setItem(surveyStatus, newSurveyStatus);
    return Number(newSurveyStatus);
  }
  return Number(surveyStatus);
}


/**
 * Increases the survey counter to denote that an additional material has been worked on. (After a certain amount of
 * materials, the survey will be shown) If the survey status is set to -1, this means the survey has already been
 * shown, so the counter will not change.
 */
export function increaseSurveyCounter() {
  const surveyStatus = getSurveyStatus();
  if (surveyStatus === -1) {
    return;
  }
  localStorage.setItem(surveyStorageKey, String(surveyStatus + 1));
}

/**
 * Sets survey counter to -1 to denote that the survey has been clicked, so the survey dialog won't be shown again.
 */
export function surveyLinkClicked() {
  localStorage.setItem(surveyStorageKey, String(-1));
}

/**
 * Returns the reset counter from local storage, which denotes how many times a user has completed all materials and
 * chose to reset the progress to get new materials. (E.g. reset counter == 2 means every material has been completed
 * twice. If no value can be found in local storage, it will be initialized with zero.
 */
export function getResetCounter() {
  const resetCounter = localStorage.getItem(resetKey);
  if (resetCounter == null) {
    const newResetCounter = String(0);
    localStorage.setItem(resetCounter, newResetCounter);
    return Number(newResetCounter);
  }
  return Number(resetCounter);
}

/**
 * Increases the reset counter by one to denote that the student has completed all the materials, and can now re-do
 * materials that have already been worked on. (GetUnusedMaterials returns any unused materials with the current
 * reset counter)
 */
export function increaseResetCounter() {
  const resetCounter = getResetCounter();
  localStorage.setItem(resetKey, String(resetCounter + 1));
}

