document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Fetch and display activities
  async function loadActivities() {
    const response = await fetch('/activities');
    const activities = await response.json();
    const container = document.getElementById('activities');
    container.innerHTML = '';
    Object.entries(activities).forEach(([name, info]) => {
        const div = document.createElement('div');
        div.className = 'activity';
        div.innerHTML = `
            <h3>${name}</h3>
            <p>${info.description}</p>
            <p><strong>Schedule:</strong> ${info.schedule}</p>
            <p><strong>Participants:</strong> ${info.participants.length}/${info.max_participants}</p>
            <input type="email" placeholder="Your email" id="email-${name}">
            <button onclick="signup('${name}')">Sign Up</button>
            <div id="msg-${name}" class="msg"></div>
        `;
        container.appendChild(div);
    });
}

// Sign up for an activity
async function signup(activityName) {
    const emailInput = document.getElementById(`email-${activityName}`);
    const msgDiv = document.getElementById(`msg-${activityName}`);
    const email = emailInput.value.trim();
    if (!email) {
        msgDiv.textContent = "Please enter your email.";
        msgDiv.style.color = "red";
        return;
    }
    try {
        const response = await fetch(`/activities/${encodeURIComponent(activityName)}/signup?email=${encodeURIComponent(email)}`, {
            method: 'POST'
        });
        const data = await response.json();
        if (response.ok) {
            msgDiv.textContent = data.message;
            msgDiv.style.color = "green";
            loadActivities();
        } else {
            msgDiv.textContent = data.detail || "Signup failed.";
            msgDiv.style.color = "red";
        }
    } catch (err) {
        msgDiv.textContent = "Network error.";
        msgDiv.style.color = "red";
    }
}

// Handle form submission
signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
  loadActivities();
});
