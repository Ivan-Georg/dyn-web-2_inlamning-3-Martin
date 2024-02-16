const BASE_URL = "https://localhost:7090/";
//const FILMS_URL = BASE_URL + "api/Films"

const ENDPOINTS = {
    REGISTER: `${BASE_URL}register`,
    REFRESH: `${BASE_URL}refresh`,
    LOGIN: `${BASE_URL}login`,
    FILMS: `${BASE_URL}api/films`,
    DELETE: `${BASE_URL}api/films/`,
    DELETEREVIEW: `${BASE_URL}api/reviews/`,
    REVIEWS: `${BASE_URL}api/Reviews`,
    REVIEWS_USER: `${BASE_URL}api/reviews/user`,
};

const LOGIN_DATA = { loggedIn: false };

function displayError(error) {
    console.error(error);
}

/** REGISTER */

document.getElementById("add-new-member-button").addEventListener("click", async () => {
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    try {
        await register(email, password);
        await login(email, password); // Automatisk inloggning efter registrering
    } catch (error) {
        displayError(error);
    }
});

document.getElementById("register-button").addEventListener("click", function () {
    document.getElementById("register-section").style.display = "block";
});

async function register(email, password) {
    const response = await fetch(ENDPOINTS.REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error("Error registering user");
    }
}

/** REGISTER */

/** LOGIN */

async function refreshLoginData() {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
        document.getElementById("login-section").style.display = "block";
        return;
    }

    const response = await fetch(ENDPOINTS.REFRESH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
    });

    saveAuthResponse(response);
}

refreshLoginData();

async function saveAuthResponse(response) {
    if (!response.ok) {
        document.getElementById("login-section").style.display = "block";
        localStorage.removeItem("refreshToken");
        throw new Error("Login failed");
    }

    const data = await response.json();

    LOGIN_DATA.loggedIn = true;
    LOGIN_DATA.accessToken = data.accessToken;
    LOGIN_DATA.refreshToken = data.refreshToken;
    LOGIN_DATA.expires = Date.now() + data.expiresIn * 10000;
    LOGIN_DATA.authHeader = `Bearer ${LOGIN_DATA.accessToken}`;
    hideLoginSection();
    displayFilmSection();
    localStorage.setItem("refreshToken", data.refreshToken);
}

document.getElementById("login-button").addEventListener("click", async () => {
    try {
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        await login(email, password);
    } catch (error) {
        displayError(error);
    }
});

async function login(email, password) {
    const response = await fetch(ENDPOINTS.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    await saveAuthResponse(response);
}

function hideLoginSection() {
    document.getElementById("login-section").style.display = "none";
}

/** /LOGIN */

/** FILMS */

async function displayFilmSection() {
    document.getElementById("film-section").style.display = "block";
    await updateFilms();
}

async function updateFilms() {
    try {
        const films = await fetchFilms();
        displayFilms(films);
    } catch (error) {
        displayError(error);
    }
}

async function fetchFilms() {
    const response = await fetch(ENDPOINTS.FILMS, {
        headers: { Authorization: LOGIN_DATA.accessToken },
    });

    if (!response.ok) {
        throw new Error("Error fetching films");
    }

    return await response.json();
}

/** ADD FILM*/
document.getElementById("add-film-button").addEventListener("click", async () => {
    const Title = document.getElementById("film-title").value;
    const ReleaseYear = document.getElementById("film-releaseYear").value;
    const Genre = document.getElementById("film-genre").value;

    try {
        await addFilm(Title, ReleaseYear, Genre);
        await updateFilms();
    } catch (error) {
        displayError(error);
    }
});

async function addFilm(Title, ReleaseYear, Genre) {
    const response = await fetch(ENDPOINTS.FILMS, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: LOGIN_DATA.authHeader,
        },
        body: JSON.stringify({ Title, ReleaseYear, Genre }),
    });

    if (!response.ok) {
        throw new Error("Error adding film");
    }
}

/** DISPLAY AND HIDE */

document.getElementById("create-film-button").addEventListener("click", function () {
    document.getElementById("add-film-section").style.display = "block";
    this.style.display = "none";
});

document.getElementById("close-film-button").addEventListener("click", function () {
    document.getElementById("add-film-section").style.display = "none";
    document.getElementById("create-film-button").style.display = "block";
});

document.getElementById("create-review-button").addEventListener("click", function () {
    document.getElementById("create-review-button").style.display = "none";
    document.getElementById("add-review-form").style.display = "block";
    document.getElementById("close-review-form-button").style.display = "block";
});

document.getElementById("edit-film-button").addEventListener("click", function () {
    document.getElementById("reviewsec").style.display = "none";
    this.style.display = "none"; // Gömmer knappen "edit film"
    document.getElementById("update-film-form").style.display = "block";
});

function displayFilms(films) {
    const filmGrid = document.getElementById("film-grid");

    filmGrid.innerHTML = "";
    for (const film of films) {
        const filmCard = document.createElement("div");
        filmCard.classList.add("film-card");
        filmCard.innerHTML = `
        <h3>${film.title}</h3>
        <p>Release year: ${film.releaseYear}</p>
        <p>Film ID: ${film.filmId}</p> 
        <p> <b>Reviews</b> </p>`;

        filmCard.addEventListener("click", () => {
            openModal(film);
        });

        filmGrid.appendChild(filmCard);
    }
}

// Hämta modalelementet och knapp för stängning
const closeButton = document.querySelector(".close-button");
const modal = document.getElementById("film-modal"); // Flytta deklarationen utanför funktionen

//Funktion för att öppna modalfönstret med filminformation
async function openModal(film) {
    const modalTitle = document.getElementById("modal-title");
    const modalDescription = document.getElementById("modal-description");
    const filmTitleInput = document.getElementById("film-title-modal");
    const filmReleaseYearInput = document.getElementById("film-releaseYear-modal");
    const filmGenreInput = document.getElementById("film-genre-modal");
    const modalFilmId = document.getElementById("modal-film-id");

    modalFilmId.innerText = film.filmId;
    modalTitle.innerText = film.title;
    modalDescription.innerText = `Release year ${film.releaseYear}, Film ID: ${film.filmId}`;
    filmTitleInput.value = film.title;
    filmReleaseYearInput.value = film.releaseYear;
    filmGenreInput.value = film.genre;

    const modalReviewList = document.getElementById("modal-review-list");
    modalReviewList.innerHTML = ""; // Rensa tidigare recensioner

    film.reviews.forEach((review) => {
        const listItem = document.createElement("li");
        const deleteReviewButton = document.createElement("button");
        deleteReviewButton.innerText = "Delete review";

        const ReviewId = review.reviewId;
        deleteReviewButton.addEventListener("click", async () => {
            try {
                await deleteReview(ReviewId);
                closeModal();
                await updateReviews();
            } catch (error) {
                displayError(error);
            }
        });
        listItem.innerText = `${review.reviewId} Comment: ${review.comment} Rating: ${review.rating}`;

        listItem.appendChild(deleteReviewButton);
        modalReviewList.appendChild(listItem);
    });

    // Function to handle click event on update film button in modal
    document.getElementById("update-film-button").addEventListener("click", async () => {
        const filmId = document.getElementById("modal-film-id").innerHTML;
        const title = document.getElementById("film-title-modal").value;
        const releaseYear = document.getElementById("film-releaseYear-modal").value;
        const genre = document.getElementById("film-genre-modal").value;

        try {
            await updateFilm(filmId, title, releaseYear, genre);
            await updateFilms(); // Refresh films after update
            document.getElementById("update-film-form").style.display = "none";
            document.getElementById("reviewsec").style.display = "block";
            document.getElementById("edit-film-button").style.display = "block";
        } catch (error) {
            displayError(error);
        }
    });

    document.getElementById("add-review-button").addEventListener("click", async () => {
        const filmId = film.filmId;
        const comment = document.getElementById("review-comment").value;
        const rating = document.getElementById("review-rating").value;

        try {
            await addReview(comment, rating, filmId);
            await updateReviews();
        } catch (error) {
            displayError(error);
        }
    });

    document.getElementById("delete-film-button").addEventListener("click", async () => {
        const filmId = film.filmId;
        try {
            await deleteFilm(filmId);
            closeModal();
            await updateFilms();
        } catch (error) {
            displayError(error);
        }
    });
    // Visa modalfönstret
    modal.style.display = "block";
    hideFilmGrid();
}

// Funktion för att stänga modalfönstret
function closeModal() {
    const modal = document.getElementById("film-modal");
    modal.style.display = "none";
    displayFilmGrid();
}

// Lyssna på klick på stängknappen
closeButton.addEventListener("click", closeModal);

function hideFilmGrid() {
    document.getElementById("film-grid").style.display = "none";
}

async function displayFilmGrid() {
    document.getElementById("film-grid").style.display = "grid";
}

async function updateFilm(filmId, title, releaseYear, genre) {
    console.log({ filmId, title, releaseYear, genre });
    const response = await fetch(`${ENDPOINTS.FILMS}/${filmId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: LOGIN_DATA.authHeader,
        },
        body: JSON.stringify({ Title: title, ReleaseYear: releaseYear, Genre: genre }),
    });

    if (!response.ok) {
        throw new Error("Error updating film");
    }
}

async function deleteFilm(filmId) {
    try {
        const response = await fetch(`${ENDPOINTS.DELETE}${filmId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: LOGIN_DATA.authHeader,
            },
        });

        if (!response.ok) {
            throw new Error("Error deleting film");
        }
    } catch (error) {
        displayError(error);
    }
}

/** REVIEWS */
async function deleteReview(ReviewId) {
    try {
        console.log({ ReviewId });
        const response = await fetch(`${ENDPOINTS.DELETEREVIEW}${ReviewId}`, {
            method: "DELETE",
            headers: {
                Authorization: LOGIN_DATA.authHeader,
            },
        });

        if (!response.ok) {
            throw new Error("Error deleting review");
        }
    } catch (error) {
        displayError(error);
    }
}
async function addReview(comment, rating, filmId) {
    const response = await fetch(ENDPOINTS.REVIEWS, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: LOGIN_DATA.authHeader,
        },
        body: JSON.stringify({ comment, rating, filmId }),
    });

    if (!response.ok) {
        throw new Error("Error adding review");
    }
}

async function updateReviews() {
    try {
        const reviews = await fetchReviews();
        displayReviews(reviews);
    } catch (error) {
        displayError(error);
    }
}

async function fetchReviews() {
    const response = await fetch(ENDPOINTS.REVIEWS, {
        headers: {
            Authorization: LOGIN_DATA.accessToken,
        },
    });

    if (!response.ok) {
        throw new Error("Error fetching reviews");
    }

    return await response.json();
}

function displayReviews(reviews) {
    const reviewList = document.getElementById("review-list");

    reviewList.innerHTML = "";

    for (const review of reviews) {
        reviewList.innerHTML += `<li>${review.comment}</li><li>${review.rating}</li><li>${review.film}`;
    }
}

async function getReview(comment, filmId) {
    const response = await fetch(ENDPOINTS.REVIEWS, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: LOGIN_DATA.authHeader,
        },
        body: JSON.stringify({ comment, filmId }),
    });
    if (!response.ok) {
        throw new Error("Error adding review");
    }
}
/** /REVIEWS */

/** LOGOUT */

document.getElementById("logout-button").addEventListener("click", () => {
    localStorage.removeItem("refreshToken");
    location.reload();
});
