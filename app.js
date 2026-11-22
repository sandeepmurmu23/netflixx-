/* NETFLIXX BYPASS - HOMEPAGE AND VIDEO PLAYER */

const DB = "netflixxBypassDB";
const STORE = "titles";

let db;
let uploaded = [];
let posterUrls = [];

/* =====================================================
   SAMPLE CONTENT
   Add or edit sample movie and series cards here.
   For normal uploads, use the Admin Panel instead.
===================================================== */

const samples = {
  Movies: [
    {
      title: "Big Buck Bunny",
      year: "Reference video",
      symbol: "▶",
      description: "A free sample animation video used to test the website player.",
      colors: ["#662333", "#171a36"],
      status: "WATCH DEMO",

      // REFERENCE VIDEO URL: Replace with a video URL you have permission to use.
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    },
    {
      title: "Crimson Horizon",
      year: "2026",
      symbol: "☄",
      description: "Sample entertainment listing.",
      colors: ["#662333", "#171a36"],
      status: "FEATURED"
    },
    {
      title: "Neon Pursuit",
      year: "2026",
      symbol: "⚡",
      description: "Sample entertainment listing.",
      colors: ["#70202b", "#171a36"],
      status: "FEATURED"
    },
    {
      title: "Deep Space",
      year: "2026",
      symbol: "✦",
      description: "Sample entertainment listing.",
      colors: ["#233c66", "#171a36"],
      status: "FEATURED"
    }
  ],

  Series: [
    {
      title: "Shadow Files",
      year: "2026",
      symbol: "◉",
      description: "Sample entertainment listing.",
      colors: ["#24404b", "#171a36"],
      status: "FEATURED"
    },
    {
      title: "The Campus",
      year: "2026",
      symbol: "✎",
      description: "Sample entertainment listing.",
      colors: ["#554027", "#171a36"],
      status: "FEATURED"
    }
  ],

  Others: [
    {
      title: "Laugh Out Loud",
      year: "2026",
      symbol: "☺",
      description: "Sample entertainment listing.",
      colors: ["#6a3c20", "#171a36"],
      status: "FEATURED"
    },
    {
      title: "Wild Planet",
      year: "2026",
      symbol: "♧",
      description: "Sample entertainment listing.",
      colors: ["#244b36", "#171a36"],
      status: "FEATURED"
    }
  ]
};


/* =====================================================
   DATABASE CONNECTION
   This connects the homepage to the Admin Panel.
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

    request.onerror = () => reject(request.error);
  });
}


function getAll() {
  return new Promise((resolve, reject) => {
    const request = db
      .transaction(STORE)
      .objectStore(STORE)
      .getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}


/* =====================================================
   CREATE MOVIE / SERIES CARDS
===================================================== */

function createCard(item, category) {
  const card = document.createElement("article");
  card.className = "card";

  const poster = document.createElement("div");
  poster.className = "poster";

  poster.style.setProperty(
    "--c1",
    item.colors?.[0] || "#70202b"
  );

  poster.style.setProperty(
    "--c2",
    item.colors?.[1] || "#171a36"
  );

  // Display uploaded poster image.
  if (item.posterBlob) {
    const imageUrl = URL.createObjectURL(item.posterBlob);

    posterUrls.push(imageUrl);

    poster.style.backgroundImage =
      `linear-gradient(0deg,#000d,transparent 70%),url("${imageUrl}")`;
  }

  const badge = document.createElement("span");
  badge.className = "poster-badge";
  badge.textContent = item.status || "NEW";

  const icon = document.createElement("span");
  icon.className = "poster-icon";
  icon.textContent = item.symbol || "▶";

  const title = document.createElement("span");
  title.className = "poster-title";
  title.textContent = item.title;

  poster.append(badge, icon, title);

  const info = document.createElement("div");
  info.className = "poster-info";

  const name = document.createElement("strong");
  name.textContent = item.title;

  const year = document.createElement("span");
  year.textContent = item.releaseDate || item.year || "";

  info.append(name, year);

  card.append(poster, info);

  // Clicking a card opens the video player.
  card.addEventListener("click", () => {
    openPlayer(item, category);
  });

  return card;
}


/* =====================================================
   VIDEO PLAYER
   Opens the selected movie or series video.
===================================================== */

function openPlayer(item, category) {
  const modal = document.getElementById("modal");
  const player = document.getElementById("player");

  stopPlayer();

  document.getElementById("modalTitle").textContent =
    item.title;

  document.getElementById("modalDesc").textContent =
    `${category} • ${item.releaseDate || item.year || ""} • ${item.description || ""}`;

  const message = document.getElementById("playerMessage");

  // Play a video uploaded through the Admin Panel.
  if (item.videoBlob) {
    player.dataset.objectUrl =
      URL.createObjectURL(item.videoBlob);

    player.src = player.dataset.objectUrl;

    message.textContent = "Press play to watch.";

  // Play the reference video from its URL.
  } else if (item.videoUrl) {
    player.src = item.videoUrl;

    message.textContent =
      "Reference video. An internet connection is required.";

  } else {
    message.textContent =
      "This sample card has no video. Upload a video from the Admin panel.";
  }

  modal.hidden = false;

  document.getElementById("closeModal").focus();
}


/* =====================================================
   STOP VIDEO AND RELEASE VIDEO MEMORY
===================================================== */

function stopPlayer() {
  const player = document.getElementById("player");

  player.pause();
  player.removeAttribute("src");
  player.load();

  if (player.dataset.objectUrl) {
    URL.revokeObjectURL(player.dataset.objectUrl);

    delete player.dataset.objectUrl;
  }
}


/* =====================================================
   FIXED VIDEO PLAYER CLOSE FUNCTION
   1. Close button (X)
   2. Click outside video player
   3. Press Escape key
===================================================== */

function closePlayer() {
  stopPlayer();

  document.getElementById("modal").hidden = true;
}


// Close button click.
document.getElementById("closeModal").addEventListener(
  "click",
  function(event) {
    event.preventDefault();
    event.stopPropagation();

    closePlayer();
  }
);


// Close when clicking the dark background.
document.getElementById("modal").addEventListener(
  "click",
  function(event) {
    if (event.target.id === "modal") {
      closePlayer();
    }
  }
);


// Clicking inside the player does not close it.
document.querySelector(".playerbox").addEventListener(
  "click",
  function(event) {
    event.stopPropagation();
  }
);


// Close player using Escape key.
document.addEventListener("keydown", function(event) {
  const modal = document.getElementById("modal");

  if (event.key === "Escape" && !modal.hidden) {
    closePlayer();
  }
});


/* =====================================================
   DISPLAY MOVIES, SERIES AND OTHERS
===================================================== */

function render() {

  // Clear old poster image URLs.
  posterUrls.forEach((url) => {
    URL.revokeObjectURL(url);
  });

  posterUrls = [];

  const query = document
    .getElementById("searchInput")
    .value
    .trim()
    .toLowerCase();

  let count = 0;

  const grids = {
    Movies: "movieGrid",
    Series: "seriesGrid",
    Others: "othersGrid"
  };

  Object.entries(grids).forEach(([category, gridId]) => {

    const grid = document.getElementById(gridId);

    grid.innerHTML = "";

    const items = [
      ...samples[category],

      ...uploaded.filter((item) => {
        return item.category === category;
      })
    ];

    items
      .filter((item) => {
        const searchableText =
          `${item.title} ${item.description || ""} ${category}`;

        return !query ||
          searchableText.toLowerCase().includes(query);
      })
      .forEach((item) => {
        grid.append(createCard(item, category));
        count++;
      });

  });

  document.getElementById("empty").hidden = count > 0;
}


/* =====================================================
   START WEBSITE
   Load uploaded content from browser database.
===================================================== */

(async function init() {

  try {
    await openDB();

    uploaded = await getAll();

  } catch (error) {
    console.error(
      "Could not open local title storage:",
      error
    );
  }

  render();

})();


/* =====================================================
   SEARCH AND MOBILE MENU
===================================================== */

document.getElementById("searchInput").addEventListener(
  "input",
  render
);

document.getElementById("searchButton").addEventListener(
  "click",
  render
);

document.getElementById("menuToggle").addEventListener(
  "click",
  function() {
    document
      .getElementById("mainNav")
      .classList.toggle("open");
  }
);