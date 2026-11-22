/*
 * NETFLIXX BYPASS - ADMIN PANEL
 *
 * ================================================================
 * >>> MAIN UPLOAD / ADD CONTENT AREA <<<
 *
 * To add a movie, series episode or other video:
 * Open admin.html in your browser and use the upload form.
 *
 * title       = Movie / Series name
 * category    = Movies, Series or Others
 * releaseDate = Release date
 * description = Title description
 * poster      = Poster image file
 * video       = Video file
 *
 * The submit section below saves everything into IndexedDB.
 * ================================================================
 */

const DB = "netflixxBypassDB";
const STORE = "titles";

let db;

const form = document.getElementById("uploadForm");
const message = document.getElementById("message");


/* =====================================================
   DATABASE CONNECTION
===================================================== */

function openDB() {
  return new Promise((resolve, reject) => {

    const request = indexedDB.open(DB, 1);

    request.onupgradeneeded = () => {

      if (!request.result.objectStoreNames.contains(STORE)) {

        request.result.createObjectStore(STORE, {
          keyPath: "id"
        });

      }

    };

    request.onsuccess = () => {
      db = request.result;
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };

  });
}


/* =====================================================
   GET ALL PUBLISHED MOVIES
===================================================== */

function getAll() {
  return new Promise((resolve, reject) => {

    const request = db
      .transaction(STORE)
      .objectStore(STORE)
      .getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      reject(request.error);
    };

  });
}


/* =====================================================
   SAVE MOVIE / SERIES TO DATABASE
===================================================== */

function saveTitle(item) {
  return new Promise((resolve, reject) => {

    const transaction = db.transaction(
      STORE,
      "readwrite"
    );

    transaction.objectStore(STORE).put(item);

    transaction.oncomplete = resolve;

    transaction.onerror = () => {
      reject(transaction.error);
    };

  });
}


/* =====================================================
   DELETE MOVIE / SERIES
===================================================== */

function deleteTitle(id) {
  return new Promise((resolve, reject) => {

    const transaction = db.transaction(
      STORE,
      "readwrite"
    );

    transaction.objectStore(STORE).delete(id);

    transaction.oncomplete = resolve;

    transaction.onerror = () => {
      reject(transaction.error);
    };

  });
}


/* =====================================================
   POSTER IMAGE PREVIEW
   Shows the selected poster before publishing.
===================================================== */

document.getElementById("poster").addEventListener(
  "change",
  (event) => {

    const file = event.target.files[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    const preview = document.getElementById("preview");

    preview.src = imageUrl;

    preview.onload = () => {
      URL.revokeObjectURL(imageUrl);
    };

    document.getElementById("previewWrap").hidden = false;

  }
);


/* =====================================================
   SHOW PUBLISHED MOVIES IN ADMIN PANEL
===================================================== */

async function refreshPublishedList() {

  const items = await getAll();

  document.getElementById("count").textContent =
    `${items.length} title${items.length === 1 ? "" : "s"}`;

  const list = document.getElementById("adminList");

  list.innerHTML = "";

  if (!items.length) {

    list.innerHTML =
      '<p class="hint-empty">No titles yet. Add your first title above.</p>';

    return;
  }

  items.sort((a, b) => b.createdAt - a.createdAt);

  items.forEach((item) => {

    const row = document.createElement("div");

    row.className = "admin-item";

    const image = document.createElement("img");

    const imageUrl = URL.createObjectURL(item.posterBlob);

    image.src = imageUrl;

    image.onload = () => {
      URL.revokeObjectURL(imageUrl);
    };

    const info = document.createElement("div");

    const name = document.createElement("strong");

    name.textContent = item.title;

    const meta = document.createElement("small");

    meta.textContent =
      `${item.category} · ${item.releaseDate || "Date not set"}`;

    info.append(name, meta);

    const removeButton = document.createElement("button");

    removeButton.className = "delete";

    removeButton.type = "button";

    removeButton.textContent = "Delete";

    removeButton.addEventListener(
      "click",
      async () => {

        if (confirm(`Delete "${item.title}"?`)) {

          await deleteTitle(item.id);

          refreshPublishedList();

        }

      }
    );

    row.append(image, info, removeButton);

    list.append(row);

  });

}


/* ================================================================
   >>> UPLOAD / PUBLISH CODE STARTS HERE <<<

   THIS IS THE MOST IMPORTANT SECTION FOR UPLOADING CONTENT.

   When you select a movie or series in admin.html,
   this code reads the selected files and saves them.

   You normally do not need to edit this code to upload content.
================================================================ */

form.addEventListener("submit", async (event) => {

  event.preventDefault();

  message.className = "";

  message.textContent = "";


  // --------------------------------------------------
  // STEP 1: READ MOVIE / SERIES DETAILS
  // --------------------------------------------------

  const title = document
    .getElementById("title")
    .value
    .trim();

  const category = document
    .getElementById("category")
    .value;

  const releaseDate = document
    .getElementById("releaseDate")
    .value;

  const description = document
    .getElementById("description")
    .value
    .trim();


  // --------------------------------------------------
  // STEP 2: SELECT POSTER AND VIDEO FILES
  //
  // >>> UPLOAD POSTER IMAGE HERE <<<
  // >>> UPLOAD VIDEO FILE HERE <<<
  // --------------------------------------------------

  const posterFile = document
    .getElementById("poster")
    .files[0];

  const videoFile = document
    .getElementById("video")
    .files[0];


  // --------------------------------------------------
  // STEP 3: VALIDATE REQUIRED INFORMATION
  // --------------------------------------------------

  if (!title || !description || !posterFile || !videoFile) {

    message.textContent =
      "Please complete all required fields.";

    message.className = "error";

    return;
  }


  if (
    !posterFile.type.startsWith("image/") ||
    !videoFile.type.startsWith("video/")
  ) {

    message.textContent =
      "Choose a valid image poster and video file.";

    message.className = "error";

    return;
  }


  // Demo upload size limit: 500 MB.
  if (videoFile.size > 500 * 1024 * 1024) {

    message.textContent =
      "This demo accepts videos up to 500 MB. Browser storage may have a lower limit.";

    message.className = "error";

    return;
  }


  // --------------------------------------------------
  // STEP 4: SAVE MOVIE / SERIES
  // --------------------------------------------------

  const publishButton =
    document.getElementById("publish");

  publishButton.disabled = true;

  publishButton.textContent = "Publishing...";


  try {

    // =================================================
    // >>> SAVE POINT: MOVIE AND VIDEO DATA <<<
    //
    // posterBlob = Uploaded poster image
    // videoBlob  = Uploaded movie / series video
    //
    // This is where all the selected content is saved.
    // =================================================

    await saveTitle({

      id: crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now()),

      title: title,

      category: category,

      releaseDate: releaseDate,

      description: description,

      posterBlob: posterFile,

      videoBlob: videoFile,

      status: "NEW",

      createdAt: Date.now()

    });


    // --------------------------------------------------
    // STEP 5: CLEAR FORM AFTER SUCCESSFUL PUBLISH
    // --------------------------------------------------

    form.reset();

    document.getElementById("previewWrap").hidden = true;

    message.textContent =
      "Published! Your title is now available on the homepage in this browser.";


    // Update the admin published list.
    await refreshPublishedList();


  } catch (error) {

    console.error("Publish failed:", error);

    message.textContent =
      "Could not save. Check available browser storage.";

    message.className = "error";

  } finally {

    publishButton.disabled = false;

    publishButton.textContent = "Publish title";

  }

});

// >>> UPLOAD / PUBLISH CODE ENDS HERE <<<


/* =====================================================
   START ADMIN PANEL
===================================================== */

(async function initAdmin() {

  try {

    await openDB();

    await refreshPublishedList();

  } catch (error) {

    console.error(error);

    message.textContent =
      "Storage unavailable. Please run this website using VS Code Live Server.";

    message.className = "error";

  }

})();