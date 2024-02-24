const { last, shuffle, split } = _

const TARGET_DELAY = 1000
const NEXT_STIMULUS_DELAY = 3000

const FIRST_IMAGES_PATH = "first_part_images"
const IMAGE_NAMES = [
  "1-BF_peur.webp",
  "2-BF_joie.webp",
  "3-WM_colere.webp",
  "4-BF_tristesse.webp",
  "5-BM_peur.webp",
  "6-WF_neutre.webp",
  "7-BM_neutre.webp",
  "8-BM_tristesse.webp",
  "9-HF_colere.webp",
  "10-HF_colere.webp",
  "11-BM_colere.webp",
  "12-HM_colere.webp",
  "13-BF_colere.webp",
  "14-HF_peur.webp",
  "15-HF_tristesse.webp",
  "16-HM_peur.webp",
  "17-WF_neutre.webp",
  "18-WM_neutre.webp",
  "19-WM_tristesse.webp",
  "20-HF_neutre.webp",
  "21-HF_peur.webp",
  "22-WM_joie.webp",
  "23-WM_colere.webp",
  "24-HF_joie.webp",
  "25-WM_peur.webp",
  "26-WM_tristesse.webp",
  "27-HM_tristesse.webp",
  "28-WF_colere.webp",
  "29-WF_tristesse.webp",
  "30-WF_peur.webp",
  "31-WM_joie.webp",
  "32-WM_colere.webp",
  "33-HF_neutre.webp",
  "34-WF_peur.webp",
  "35-WF_colere.webp",
  "36-WM_peur.webp",
  "37-WM_peur.webp",
  "38-HF_tristesse.webp",
  "39-WF_joie.webp",
  "40-HM_neutre.webp",
  "41-HF_joie.webp",
  "42-WM_tristesse.webp",
  "43-WF_joie.webp",
  "44-WM_neutre.webp",
  "45-WF_tristesse.webp",
  "46-WM_joie.webp",
  "47-HM_joie.webp",
  "48-WM_neutre.webp",
  "49-BM_joie.webp",
  "50-BF_neutre.webp",
]

const SECOND_IMAGES_PATH = "second_part_images"
const SHUFFLED_IMAGE_PAIRS = [
  // ["111_ukraine.jpg", "111_autre.png"],
  // ["222_autre.jpg", "222_ukraine.jpg"],
  ["1_autre.png", "1_ukraine.webp"],
  ["2_autre.png", "2_ukraine.png"],
  ["3_autre.jpg", "3_ukraine.jpg"],
  ["4_autre.webp", "4_ukraine.png"],
  ["5_autre.png", "5_ukraine.png"],
  ["6_autre.png", "6_ukraine.png"],
  ["7_autre.png", "7_ukraine.png"],
].map(shuffle)

document.getElementById("first_part_image_container").innerHTML = IMAGE_NAMES.map(
  (url) => `<img src="${FIRST_IMAGES_PATH + "/" + url}" style="display: none"/>`
).join("")

document.getElementById("second_part_container").innerHTML = SHUFFLED_IMAGE_PAIRS.map(
  (pair, index) =>
    `<span id="image_pair_${index}" style="display: none">
    <img src="${SECOND_IMAGES_PATH + "/" + pair[0]}" onclick="chooseImage('${pair[0]}', ${index})" />
    <img src="${SECOND_IMAGES_PATH + "/" + pair[1]}" onclick="chooseImage('${pair[1]}', ${index})" />
    </span>
    `
).join("")

let areImagesLoaded = false
Promise.all(
  Array.from(document.images)
    .filter((img) => !img.complete)
    .map(
      (img) =>
        new Promise((resolve) => {
          img.onload = img.onerror = resolve
        })
    )
).then(() => {
  areImagesLoaded = true
})
function haveImagesFinishedLoading() {
  return areImagesLoaded
}

const firstPartImageContainer = document.getElementById("first_part_image_container")
const emotionChoiceContainer = document.getElementById("emotion_choice_container")
const analogConfidenceScale = document.getElementById("analog_confidence_scale")
const firstPartTarget = document.getElementById("first_part_target")
const secondPartContainer = document.getElementById("second_part_container")
const finishDialog = document.getElementById("finish_dialog")

let results = []

function startExperiment() {
  window.onbeforeunload = function () {
    return "Data will be lost if you leave the page, are you sure?"
  }
  const elem = document.body
  if (elem.requestFullscreen) {
    elem.requestFullscreen()
  } else if (elem.webkitRequestFullscreen) {
    /* Safari */
    elem.webkitRequestFullscreen()
  } else if (elem.msRequestFullscreen) {
    /* IE11 */
    elem.msRequestFullscreen()
  }
  document.getElementById("first_part_container").style.display = "flex"
  showNextEmotion()
}

function showTargetThenAnalogScale() {
  firstPartImageContainer.style.display = "none"
  emotionChoiceContainer.style.display = "none"
  for (const img of firstPartImageContainer.children) {
    img.style.display = "none"
  }

  firstPartTarget.style.display = "flex"
  setTimeout(() => {
    firstPartTarget.style.display = "none"
    analogConfidenceScale.style.display = "flex"
  }, TARGET_DELAY)
}

function showNextEmotion() {
  analogConfidenceScale.style.display = "none"
  saveToLocalStorage()
  if (getCurrentStep() === IMAGE_NAMES.length) {
    finishFirstPart()
    return
  }
  setTimeout(() => {
    firstPartImageContainer.style.display = "flex"
    emotionChoiceContainer.style.display = "flex"
    firstPartImageContainer.children[getCurrentStep()].style.display = "flex"
    results = [
      ...results,
      {
        imageDisplayTimestamp: window.performance.now(),
        imageName: IMAGE_NAMES[getCurrentStep()],
        experimentPart: 1,
      },
    ]
  }, NEXT_STIMULUS_DELAY)
}

function saveToLocalStorage() {
  localStorage.setItem(new Date().toISOString(), JSON.stringify(results))
}

function chooseEmotion(emotion) {
  last(results).chosenEmotion = emotion
  last(results).wasEmotionCorrectlyIdentified = IMAGE_NAMES[getCurrentStep() - 1].includes(emotion)
}

function chooseConfidence(elementId) {
  last(results).choiceTimestamp = window.performance.now()
  const confidenceLevel = last(split(elementId, "_"))
  last(results).confidenceLevel = confidenceLevel
}

function getCurrentStep() {
  return results.length
}

function finishFirstPart() {
  const firstPartContainer = document.getElementById("first_part_container")
  firstPartContainer.style.display = "none"
  const continueDialog = document.getElementById("continue_dialog")
  continueDialog.showModal()
}

function continueExperiment() {
  second_part_container.style.display = "flex"
  showNextStimuli()
}

function showNextStimuli() {
  if (results.filter((result) => result.chosenEthnicity).length === SHUFFLED_IMAGE_PAIRS.length) {
    finishDialog.showModal()
    return
  }
  for (span of document.getElementById("second_part_container").children) {
    span.style.display = "none"
  }
  setTimeout(() => {
    const spanToDisplay = document.getElementById(
      `image_pair_${results.filter((result) => result.chosenEthnicity).length}`
    )
    spanToDisplay.style.display = "flex"
    results = [...results, { imageDisplayTimestamp: window.performance.now(), experimentPart: 2 }]
  }, NEXT_STIMULUS_DELAY)
}

function chooseImage(name, step) {
  last(results).chosenEthnicity = name.includes("ukraine") ? "ukraine" : "autre"
  last(results).choiceTimestamp = window.performance.now()
  saveToLocalStorage()
  showNextStimuli()
}

function displayResults() {
  secondPartContainer.style.display = "none"

  delete window.onbeforeunload
  document.exitFullscreen()
  subjectId = document.getElementsByName("subject_id")[0].value || "missing_subject_id"

  const responsesToDownload = formatResponses(subjectId)

  document.getElementById("responses").value = responsesToDownload

  document.getElementById("results_container").style.display = "flex"

  let downloadElement = document.createElement("a")
  downloadElement.setAttribute("href", "data:attachment/csv" + "," + encodeURI(responsesToDownload))

  downloadElement.setAttribute("download", "responses_" + subjectId + ".csv")

  downloadElement.style.display = "none"
  document.body.appendChild(downloadElement)

  setTimeout(() => {
    downloadElement.click()
  }, 1000)
}

function formatResponses(subjectId) {
  return `subject_id, one_based_experiment_part_index, one_based_stimulus_index, displayed_image_name, stimulus_display_timestamp, choice_timestamp, ms_choice_duration, chosen_emotion, was_emotion_correctly_identified, 1_100_confidence_level, chosen_ethnicity
${results
  .map(
    (line, index) =>
      `${subjectId}, ${line.experimentPart}, ${index + 1}, ${line.imageName || ""}, ${line.imageDisplayTimestamp}, ${
        line.choiceTimestamp
      }, ${line.choiceTimestamp - line.imageDisplayTimestamp}, ${line.chosenEmotion || ""}, ${
        line.wasEmotionCorrectlyIdentified != undefined ? line.wasEmotionCorrectlyIdentified : ""
      }, ${line.confidenceLevel || ""}, ${line.chosenEthnicity || ""}\n`
  )
  .join("")}`
}
