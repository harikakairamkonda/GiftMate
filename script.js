
/* =====================================================
   GiftMate - Complete Dashboard Script
   Features:
   1. Attractive gift images
   2. Load gifts from the API
   3. Search and category filters
   4. Gift recommendations
   5. Favourite gifts
===================================================== */

// -----------------------------------------------------
// 1. GIFT IMAGE COLLECTION
// -----------------------------------------------------

const giftImageGroups = {
    photo: [
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=800&q=85"
    ],
    mug: [
        "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=85"
    ],
    chocolate: [
        "https://images.unsplash.com/photo-1548907040-4d42bfc8e7d4?auto=format&fit=crop&w=800&q=85"
    ],
    book: [
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=85"
    ],
    plant: [
        "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=85"
    ],
    candle: [
        "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=85"
    ],
    teddy: [
        "https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=800&q=85"
    ],
    flowers: [
        "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=85"
    ],
    watch: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=85"
    ],
    headphones: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=85"
    ],
    perfume: [
        "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=85"
    ],
    bag: [
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=85"
    ],
    wallet: [
        "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=85"
    ],
    jewellery: [
        "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=800&q=85"
    ],
    frame: [
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=85"
    ],
    desk: [
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=85"
    ],
    art: [
        "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=85"
    ],
    greeting: [
        "https://images.unsplash.com/photo-1513883049090-d0b7439799bf?auto=format&fit=crop&w=800&q=85"
    ],
    giftbox: [
        "https://images.unsplash.com/photo-1549465220-1ea8c42e4cf9?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=800&q=85"
    ]
};

// -----------------------------------------------------
// 2. SELECT A SUITABLE IMAGE FOR EACH GIFT
// -----------------------------------------------------




function getGiftImage(gift) {
    // 1. Prefer the image uploaded by the admin.
    if (gift.image_path && String(gift.image_path).trim()) {
        return gift.image_path;
    }

    // 2. Use the existing image for known gift names.
    const giftImages = {
        "personalized photo frame":
            "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=85",
        "wireless earbuds":
            "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=800&q=85",
        "classic wristwatch":
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=85",
        "book lover's set":
            "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=85",
        "chocolate gift box":
            "https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=800&q=85",
        "scented candle set":
            "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=85",
        "custom name mug":
            "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=85",
        "skincare gift kit":
            "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=85",
        "bluetooth speaker":
            "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=85",
        "indoor plant":
            "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=85",
        "handmade greeting card":
            "https://images.unsplash.com/photo-1513883049090-d0b7439799bf?auto=format&fit=crop&w=800&q=85",
        "elegant handbag":
            "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=85",
        "coffee gift set":
            "https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=800&q=85",
        "desk organizer":
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=85",
        "personalized photo album":
            "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=800&q=85",
        "art and craft kit":
            "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=85",
        "soft teddy bear":
            "https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=800&q=85",
        "premium pen set":
            "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=85",
        "movie night treat box":
            "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=85",
        "personalized gift hamper":
            "https://images.unsplash.com/photo-1549465220-1ea8c42e4cf9?auto=format&fit=crop&w=800&q=85",
        "wireless charging stand":
            "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=85",
        "cooking experience":
            "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=85",
        "cute teddy bear":
            "https://images.unsplash.com/photo-1562040506-a9b32cb51b94?auto=format&fit=crop&w=800&q=85",
        "cute pink teddy bear":
            "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=85"
    };

    const giftName = String(gift.name || "").trim().toLowerCase();

    return giftImages[giftName] ||
        "https://images.unsplash.com/photo-1549465220-1ea8c42e4cf9?auto=format&fit=crop&w=800&q=85";
}




// -----------------------------------------------------
// 3. START THE DASHBOARD
// -----------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {
    const giftGrid = document.getElementById("giftGrid");
    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");
    const giftForm = document.getElementById("giftForm");
    const resultsTitle = document.getElementById("resultsTitle");
    const resultsMessage = document.getElementById("resultsMessage");
    const emptyState = document.getElementById("emptyState");
    const favoritesButton = document.getElementById("favoritesButton");
    const favoriteCount = document.getElementById("favoriteCount");
    const showAllButton = document.getElementById("showAllButton");
    const resetButton = document.getElementById("resetButton");
    const accountMessage = document.getElementById("accountMessage");

    if (!giftGrid) {
        console.error("GiftMate: giftGrid was not found.");
        return;
    }

    let allGifts = [];
    let currentGifts = [];
    let showFavoritesOnly = false;
    let recommendationMode = false;

    let favorites = new Set();

    try {
        const saved = JSON.parse(
            localStorage.getItem("giftmateFavorites") || "[]"
        );
        if (Array.isArray(saved)) {
            favorites = new Set(saved.map(String));
        }
    } catch (error) {
        console.warn("Could not read saved favourites.", error);
    }

    // -------------------------------------------------
    // 4. HELPER FUNCTIONS
    // -------------------------------------------------

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    function parseList(value) {
        if (Array.isArray(value)) {
            return value.map(String);
        }

        if (typeof value !== "string" || !value.trim()) {
            return [];
        }

        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                return parsed.map(String);
            }
        } catch (error) {
            // Treat a plain string as one value.
        }

        return [value];
    }

    function updateFavoriteCount() {
        favoriteCount.textContent = favorites.size;
        favoritesButton.setAttribute(
            "aria-pressed",
            String(showFavoritesOnly)
        );
    }

    function saveFavorites() {
        try {
            localStorage.setItem(
                "giftmateFavorites",
                JSON.stringify([...favorites])
            );
        } catch (error) {
            console.warn("Could not save favourites.", error);
        }

        updateFavoriteCount();
    }

    // -------------------------------------------------
    // 5. RENDER GIFT CARDS
    // -------------------------------------------------

    function renderGifts(gifts) {
        giftGrid.replaceChildren();
        emptyState.hidden = gifts.length !== 0;

        gifts.forEach(function (gift) {
            const card = document.createElement("article");
            card.className = "gift-card";

            const imageUrl = getGiftImage(gift);
            const isFavorite = favorites.has(String(gift.id));
            const price = Number(gift.price);

            card.innerHTML = `
                <div class="gift-art">
                    <img
                        class="gift-image"
                        src="${escapeHTML(imageUrl)}"
                        alt="${escapeHTML(gift.name)}"
                        loading="lazy"
                    >
                    <span class="gift-emoji" hidden>
                        ${escapeHTML(gift.emoji || "🎁")}
                    </span>
                </div>

                <div class="gift-info">
                    <span class="category-tag">
                        ${escapeHTML(gift.category || "Gifts")}
                    </span>

                    <h3>${escapeHTML(gift.name || "Gift idea")}</h3>

                    <p>${escapeHTML(
                        gift.description ||
                        "A thoughtful gift for someone special."
                    )}</p>

                    <div class="gift-bottom">
                        <span class="gift-price">
                            ₹${Number.isFinite(price)
                                ? price.toLocaleString("en-IN")
                                : "—"}
                        </span>

                        <button
                            type="button"
                            class="favorite-button ${isFavorite ? "active" : ""}"
                            data-favorite-id="${escapeHTML(gift.id)}"
                            aria-label="${isFavorite ? "Remove from" : "Add to"} favourites"
                            aria-pressed="${isFavorite}"
                        >${isFavorite ? "♥" : "♡"}</button>
                    </div>
                </div>
            `;

            const image = card.querySelector(".gift-image");
            const emoji = card.querySelector(".gift-emoji");
            const art = card.querySelector(".gift-art");

            image.addEventListener("error", function () {
                image.hidden = true;
                emoji.hidden = false;
                art.classList.add("gift-art-fallback");
            }, { once: true });

            giftGrid.appendChild(card);
        });

        if (gifts.length === 0) {
            resultsMessage.textContent =
                "No matching gifts found. Try changing your search or filters.";
        } else {
            resultsMessage.textContent =
                `${gifts.length} gift${gifts.length === 1 ? "" : "s"} available.`;
        }
    }

    // -------------------------------------------------
    // 6. SEARCH AND CATEGORY FILTERING
    // -------------------------------------------------

    function applyFilters() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const category = categoryFilter.value.toLowerCase();

        let gifts = [...currentGifts];

        if (showFavoritesOnly) {
            gifts = gifts.filter(gift =>
                favorites.has(String(gift.id))
            );
        }

        if (category !== "all") {
            gifts = gifts.filter(gift =>
                String(gift.category || "").toLowerCase() === category
            );
        }

        if (searchTerm) {
            gifts = gifts.filter(gift => {
                const text = [
                    gift.name,
                    gift.category,
                    gift.description
                ].join(" ").toLowerCase();

                return text.includes(searchTerm);
            });
        }

        renderGifts(gifts);
    }

    // -------------------------------------------------
    // 7. GIFT RECOMMENDATIONS
    // -------------------------------------------------

    function giftMatchesRecommendation(gift, preferences) {
        const price = Number(gift.price);
        const budget = Number(preferences.budget);

        if (!Number.isFinite(price) || price > budget) {
            return false;
        }

        const recipient = preferences.recipient.toLowerCase();
        const occasion = preferences.occasion.toLowerCase();
        const interest = preferences.interest.toLowerCase();

        const recipients = parseList(gift.recipients)
            .map(value => value.toLowerCase());

        const occasions = parseList(gift.occasions)
            .map(value => value.toLowerCase());

        const interests = parseList(gift.interests)
            .map(value => value.toLowerCase());

        const recipientMatch =
            recipient === "any" ||
            recipients.length === 0 ||
            recipients.some(value => value.includes(recipient));

        const occasionMatch =
            occasion === "any" ||
            occasions.length === 0 ||
            occasions.some(value => value.includes(occasion));

        const interestMatch =
            interest === "any" ||
            interests.length === 0 ||
            interests.some(value =>
                value.includes(interest) || interest.includes(value)
            ) ||
            String(gift.category || "").toLowerCase() === interest;

        return recipientMatch && occasionMatch && interestMatch;
    }

    giftForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const preferences = {
            recipient: document.getElementById("recipient").value,
            occasion: document.getElementById("occasion").value,
            budget: document.getElementById("budget").value,
            interest: document.getElementById("interest").value
        };

        currentGifts = allGifts.filter(gift =>
            giftMatchesRecommendation(gift, preferences)
        );

        showFavoritesOnly = false;
        recommendationMode = true;

        searchInput.value = "";
        categoryFilter.value = "all";
        resultsTitle.textContent = "Your Recommended Gifts";

        applyFilters();

        document.getElementById("results").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });

    // -------------------------------------------------
    // 8. FAVOURITES
    // -------------------------------------------------

    favoritesButton.addEventListener("click", function () {
        showFavoritesOnly = !showFavoritesOnly;

        resultsTitle.textContent = showFavoritesOnly
            ? "Your Favourite Gifts"
            : recommendationMode
                ? "Your Recommended Gifts"
                : "Popular Gift Ideas";

        applyFilters();

        document.getElementById("results").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });

    giftGrid.addEventListener("click", function (event) {
        const button = event.target.closest("[data-favorite-id]");

        if (!button) {
            return;
        }

        const id = String(button.dataset.favoriteId);

        if (favorites.has(id)) {
            favorites.delete(id);
        } else {
            favorites.add(id);
        }

        saveFavorites();
        applyFilters();
    });

    // -------------------------------------------------
    // 9. SHOW ALL AND RESET
    // -------------------------------------------------

    showAllButton.addEventListener("click", function () {
        currentGifts = [...allGifts];
        showFavoritesOnly = false;
        recommendationMode = false;

        searchInput.value = "";
        categoryFilter.value = "all";
        resultsTitle.textContent = "Popular Gift Ideas";

        applyFilters();
    });

    resetButton.addEventListener("click", function () {
        searchInput.value = "";
        categoryFilter.value = "all";
        showFavoritesOnly = false;

        if (recommendationMode) {
            currentGifts = [...allGifts];
            recommendationMode = false;
            resultsTitle.textContent = "Popular Gift Ideas";
        }

        applyFilters();
    });

    document.getElementById("resetButtonAlt")
        .addEventListener("click", function () {
            showAllButton.click();
        });

    searchInput.addEventListener("input", applyFilters);
    categoryFilter.addEventListener("change", applyFilters);

    // -------------------------------------------------
    // 10. LOAD GIFTS FROM YOUR EXISTING API
    // -------------------------------------------------

    async function loadGifts() {
        resultsMessage.textContent = "Loading gifts...";

        try {
            const response = await fetch("/api/gifts", {
                credentials: "same-origin"
            });

            const data = await response.json();

            if (!response.ok || data.success === false) {
                throw new Error(data.message || "Unable to load gifts.");
            }

            allGifts = Array.isArray(data) ? data : data.data;

            if (!Array.isArray(allGifts)) {
                throw new Error("Unexpected response from the gifts API.");
            }

            currentGifts = [...allGifts];
            updateFavoriteCount();
            renderGifts(currentGifts);

            resultsTitle.textContent = "Popular Gift Ideas";
            recommendationMode = false;
            showFavoritesOnly = false;
        } catch (error) {
            console.error("GiftMate loading error:", error);

            giftGrid.replaceChildren();
            emptyState.hidden = true;

            resultsMessage.textContent =
                "Unable to load gifts. Check your server and refresh the page.";
        }
    }

    // -------------------------------------------------
    // 11. INITIALIZE
    // -------------------------------------------------

    document.getElementById("currentYear").textContent =
        new Date().getFullYear();

    updateFavoriteCount();
    loadGifts();
});
