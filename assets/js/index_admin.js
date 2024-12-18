import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://ihesnrxpariqhpvfoigc.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloZXNucnhwYXJpcWhwdmZvaWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5OTg5NDQsImV4cCI6MjA0NzU3NDk0NH0.atL4kRHsAVoBSt4VXXKhFDBV4cnbaW6OJs6rdBc6fOg";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Function to delete a comment
// Function to delete a comment
// Function to delete a comment
async function deleteComment(commentId) {
  try {
    // Delete the comment from the 'Comments' table
    const { error } = await supabase
      .from("Comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      console.error("Error deleting comment:", error);
    } else {
      console.log("Comment deleted successfully!");

      // Remove the comment element from the DOM
      const commentElement = document.querySelector(`#comment-${commentId}`);
      if (commentElement) {
        commentElement.remove();
      }
    }
  } catch (err) {
    console.error("Unexpected error in deleteComment:", err);
  }
}
// Function to fetch and display news data
async function deleteNews(newsId) {
  try {
    // Delete the news post from the 'News' table
    const { error } = await supabase.from("News").delete().eq("id", newsId);

    if (error) {
      console.error("Error deleting news:", error);
    } else {
      console.log("News deleted successfully!");

      // Remove the news card element from the DOM
      const newsCardElement = document.querySelector(`#news-card-${newsId}`);
      if (newsCardElement) {
        newsCardElement.remove();
      }
    }
  } catch (err) {
    console.error("Unexpected error in deleteNews:", err);
  }
}

// Function to fetch and display news data
// Function to fetch and display news data
// Function to fetch and display news data
let newsData = []; // Global variable to store fetched news data

async function fetchNews() {
  try {
    const { data, error } = await supabase.from("News").select("*");
    console.log("Fetched news data:", data);

    if (error) {
      console.error("Error fetching news:", error);
      return;
    }

    if (!data || data.length === 0) {
      console.error("No news data found.");
      return;
    }

    // Save fetched data in a global variable and sort by id in descending order
    newsData = data.sort((a, b) => b.id - a.id);

    const newsContainer = document.getElementById("news-container");

    if (!newsContainer) {
      console.error("News container not found.");
      return;
    }

    // Clear the container before appending new cards
    newsContainer.innerHTML = "";

    // Loop through the sorted data to create and append cards
    for (const newsItem of newsData) {
      // Use newsData here instead of 'data'
      console.log("Processing news item:", newsItem);

      // Fetch reactions, comments, and favorites counts
      const { data: reactionsData } = await supabase
        .from("Reactions")
        .select("*")
        .eq("News_id", newsItem.id);
      const { data: commentsData } = await supabase
        .from("Comments")
        .select("*")
        .eq("News_id", newsItem.id);
      const { data: favoritesData } = await supabase
        .from("Favorites")
        .select("*")
        .eq("News_id", newsItem.id);

      const reactionCount = reactionsData ? reactionsData.length : 0;
      const commentCount = commentsData ? commentsData.length : 0;
      const favoriteCount = favoritesData ? favoritesData.length : 0;

      // Default fallback image
      const fallbackImage = "/assets/images/default-placeholder.png";

      // Fetch the users for the comments
      const commentsWithUserData = await Promise.all(
        commentsData.map(async (comment) => {
          const { data: userData } = await supabase
            .from("users")
            .select("f_name, l_name, profile_img")
            .eq("id", comment.user_id)
            .single(); // Assuming user_id is unique

          // If no user data is found, use fallback
          const user = userData || {
            f_name: "Unknown",
            l_name: "",
            profile_img: "/assets/images/Profile/profile pic 2.jpg",
          };

          return {
            ...comment,
            f_name: user.f_name,
            l_name: user.l_name,
            profile_img:
              user.profile_img || "/assets/images/Profile/profile pic 2.jpg",
          };
        })
      );

      const newsCard = `
        <div class="col-md-4 p-3" id="news-card-${newsItem.id}">
          <div class="card">
            <div class="container mt-2 position-relative">
              <!-- Profile Container and Content -->
              <div class="profile-container">
                <div class="profilepic">
                  <img src="/assets/images/Profile/Profile Pic.png" alt="Profile Picture" width="50px" />
                </div>
                <div class="profile-info text-start">
                  <p class="user_name mt-1">College of Computing and Information Sciences - Caraga State University</p>
                  <small class="date"><b>Posted: </b>${new Date(
                    newsItem.created_at
                  ).toLocaleDateString()}</small>
                </div>
              </div>

              <!-- Options Icon -->
              <div class="options-icon">
                <div class="dropdown">
                  <button class="btn btn-link p-0 text-dark" id="optionsMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fas fa-ellipsis-h"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="optionsMenuButton">
                    <li><div class="dropdown-item" data-bs-toggle="modal" data-bs-target="#editModal">Edit</div></li>
                    <li><a class="dropdown-item text-danger" data-bs-toggle="modal" data-bs-target="#deleteModal" href="javascript:void(0);" id="deleteNews" data-news-id="${
                      newsItem.id
                    }">Delete</a></li>
                  </ul>
                </div>
              </div>
              <!-- End Options Icon -->
            </div>

            <!-- Content (Images, Title, Description) -->
            <div class="container">
              <div class="row pt-2 pb-">
                <small class="text-secondary title p-2">${newsItem.title}</small>
              </div>
              <div class="row g-0">
  ${
    newsItem.img_1 && !newsItem.img_2
      ? `
        <!-- Render only img_1 if img_2 is absent -->
        <div class="col-12 p-1 text-center">
          <img src="${newsItem.img_1 || fallbackImage}" class="img-fluid w-100 h-100" alt="${newsItem.title}" />
        </div>
      `
      : newsItem.img_1 && newsItem.img_2
      ? `
        <!-- Render img_1 and img_2 if both exist -->
        <div class="col-8 p-1">
          <img src="${newsItem.img_1 || fallbackImage}" class="img-fluid w-100 h-100" alt="${newsItem.title}" />
        </div>
        <div class="col-4 p-1">
          <img src="${newsItem.img_2 || fallbackImage}" class="img-fluid w-100 h-100" alt="${newsItem.title}" />
        </div>
      `
      : `
        <!-- Fallback image if no images exist -->
        <div class="col-12 p-1 text-center">
          <img src="${fallbackImage}" class="img-fluid w-100 h-100" alt="Default Placeholder" />
        </div>
      `
  }
</div>

            </div>

            <div class="card-body text-secondary">
              <p class="card-text cardtext">
                <span class="preview-text">${newsItem.description.substring(
                  0,
                  235
                )}...</span>
                <span class="more-text" style="display: none">${
                  newsItem.description
                }</span>
                <button class="toggle-btn btn btn-link p-0">...See More</button>
              </p>
            </div>

           <!-- Toggle Button -->
            <div class="text-center my-3">
              <div class="toggle-interaction-div" style="cursor: pointer; background-color: #fd7e14; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block;">
                Show Interactions
              </div>
            </div>
            
            <div class="reaction-area row d-none">
              <div class="col-4 interaction">
                <div class="reaction-container text-center position-relative">
                  <h6>${reactionCount}</h6>
                  <span class="selected-reaction">Reactions</span>
                </div>
              </div>
              <div class="col-4 text-secondary interaction">
                <div class="interaction-item comment-toggle">
                  <h6>${commentCount}</h6>
                  <span>Comments</span>
                </div>
              </div>
              <div class="col-4 text-secondary interaction">
                <div class="interaction-item favorite-toggle">
                  <h6>${favoriteCount}</h6>
                  <span>Favorites</span>
                </div>
              </div>
                 <!-- Comments -->
              <div class="container">
                <div class="comments-container mt-4" style="margin-left: 15px; margin-right: 15px;">
                  <!-- Existing Comments -->
                  ${commentsWithUserData
                    .map(
                      (comment) => `
                    <div class="d-flex align-items-start m-2 pb-2 comment position-relative" id="comment-${comment.id}">
                      <img
                        src="${comment.profile_img}"
                        alt="Profile Picture"
                        class="profile-pic"
                      />
                      <div class="ms-2">
                        <b class="user_name">${comment.f_name} ${comment.l_name}</b>
                        <p class="comment-text">${comment.comment_text}</p>
                      </div>
                      <button class="delete-button position-absolute top-0 end-0 p-2" style="background: transparent; border: none; color: red; cursor: pointer; font-size: 12px;" data-bs-toggle="modal" data-bs-target="#deleteModal" data-comment-id="${comment.id}">
                        Delete
                      </button>

                    </div>
                  `
                    )
                    .join("")}
                </div>
              </div>
              <!--End Comments -->
            </div>
       <!-- End Toggle Button -->
        </div>
      </div>
    `;

      newsContainer.innerHTML += newsCard;
    }

    // Add event listeners for delete comment buttons
    document.querySelectorAll(".delete-button").forEach((btn) => {
      btn.addEventListener("click", function () {
        const commentId = this.getAttribute("data-comment-id");
        deleteComment(commentId);
      });
    });

    // Add event listeners for delete news buttons
    document.querySelectorAll("#deleteNews").forEach((btn) => {
      btn.addEventListener("click", function () {
        const newsId = this.getAttribute("data-news-id");
        deleteNews(newsId);
      });
    });
  } catch (error) {
    console.error("Error fetching news:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded triggered");
  fetchNews();

  document.body.addEventListener("click", (event) => {
    if (event.target.classList.contains("toggle-interaction-div")) {
      const card = event.target.closest(".card");
      const reactionArea = card.querySelector(".reaction-area");

      if (reactionArea) {
        reactionArea.classList.toggle("d-none");
        if (reactionArea.classList.contains("d-none")) {
          event.target.textContent = "Show Interactions";
        } else {
          event.target.textContent = "Hide Interactions";
        }
      }
    }
  });
});

// Navbar
// Highlight active navigation link
document.addEventListener("DOMContentLoaded", function () {
  const navLinks = document.querySelectorAll("#bottomNavbar .nav-link");
  navLinks.forEach((link) => {
    // Check if the link matches the current URL
    if (link.href === window.location.href) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }

    // Add click event to highlight clicked link
    link.addEventListener("click", () => {
      navLinks.forEach((otherLink) => otherLink.classList.remove("active"));
      link.classList.add("active");
    });
  });
});

// MODAL FOR DELETE
let deleteItemId = null;
let deleteType = null; // Will be 'comment' or 'news'

// Show the delete modal when a delete button is clicked
document.querySelectorAll(".delete-button").forEach((btn) => {
  btn.addEventListener("click", function () {
    deleteItemId = this.getAttribute("data-comment-id"); // Get comment ID
    deleteType = "comment";
    // Open the modal
    new bootstrap.Modal(document.getElementById("deleteModal")).show();
  });
});

document.querySelectorAll("#deleteNews").forEach((btn) => {
  btn.addEventListener("click", function () {
    deleteItemId = this.getAttribute("data-news-id"); // Get news ID
    deleteType = "news";
    // Open the modal
    new bootstrap.Modal(document.getElementById("deleteModal")).show();
  });
});

// Confirm deletion from the modal
document
  .getElementById("confirmDeleteButton")
  .addEventListener("click", async () => {
    if (deleteType === "comment") {
      await deleteComment(deleteItemId); // Delete comment
    } else if (deleteType === "news") {
      await deleteNews(deleteItemId); // Delete news post
    }

    // Close the modal after deleting
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("deleteModal")
    );
    modal.hide();

    // Reset deleteItemId and deleteType
    deleteItemId = null;
    deleteType = null;
  });
// MODAL DELETE END

//
//
//
// SEARCH FUNCTION

// Search function to filter news items
function searchNews(query) {
  // Remove empty spaces and make it lowercase for case-insensitive search
  const searchQuery = query.toLowerCase().trim();

  // Filter newsData based on the search query (searching in title and description)
  const results = newsData.filter(
    (newsItem) =>
      newsItem.title.toLowerCase().includes(searchQuery) ||
      newsItem.description.toLowerCase().includes(searchQuery)
  );

  // Show matching results in dropdown
  displaySearchSuggestions(results);
}

// Function to display search suggestions in the dropdown
function displaySearchSuggestions(results) {
  const suggestionsContainer = document.getElementById("search-suggestions");
  suggestionsContainer.innerHTML = ""; // Clear previous suggestions

  if (results.length === 0) {
    suggestionsContainer.style.display = "none"; // Hide dropdown if no results
    return;
  }

  // Display each result in the dropdown
  results.forEach((newsItem) => {
    const suggestionItem = document.createElement("li");
    suggestionItem.classList.add("list-group-item");
    suggestionItem.textContent = newsItem.title;

    // When a suggestion is clicked, fetch and display the full news content in a modal
    suggestionItem.addEventListener("click", async () => {
      // Fetch the detailed content of the selected news item
      const { data: newsData, error } = await supabase
        .from("News")
        .select("*")
        .eq("id", newsItem.id)
        .single(); // Fetch a single item

      if (error) {
        console.error("Error fetching news data:", error);
        return;
      }

      // Populate modal with news details
      const modalContent = document.getElementById("modal-content");
      modalContent.innerHTML = `
      <h3>${newsItem.title}</h3>
      <div class="row g-0 my-3">
        ${
          newsItem.img_1 && !newsItem.img_2
            ? `<div class="col-12 p-1 text-center">
                <img src="${
                  newsItem.img_1 || "/assets/images/default-placeholder.png"
                }" class="img-fluid w-100 h-100" alt="News Image 1" />
              </div>`
            : newsItem.img_1 && newsItem.img_2
            ? `<div class="col-8 p-1">
                <img src="${
                  newsItem.img_1 || "/assets/images/default-placeholder.png"
                }" class="img-fluid w-100 h-100" alt="News Image 1" />
              </div>
              <div class="col-4 p-1">
                <img src="${
                  newsItem.img_2 || "/assets/images/default-placeholder.png"
                }" class="img-fluid w-100 h-100" alt="News Image 2" />
              </div>`
            : `<div class="col-12 p-1 text-center">
                <img src="/assets/images/default-placeholder.png" class="img-fluid w-100 h-100" alt="Default Placeholder" />
              </div>`
        }
      </div>
      <p>${newsItem.description}</p>
    
    `;
    

      // Show the modal
      const modal = new bootstrap.Modal(document.getElementById("newsModal"));
      modal.show();

      // Hide the suggestions dropdown after selection
      suggestionsContainer.style.display = "none";
    });

    suggestionsContainer.appendChild(suggestionItem);
  });

  // Show the suggestions dropdown
  suggestionsContainer.style.display = "block";
}

// Add event listener for search input
document.getElementById("search-input").addEventListener("input", function () {
  const query = this.value;
  searchNews(query); // Call the search function each time the user types
});

// Optionally, clear the suggestions when the input is focused out
document.getElementById("search-input").addEventListener("blur", () => {
  setTimeout(() => {
    // Timeout ensures the suggestion can be clicked
    document.getElementById("search-suggestions").style.display = "none";
  }, 200);
});
