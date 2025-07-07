document.addEventListener("DOMContentLoaded", () => {
  const listContainer = document.getElementById("applicationsList");

  let users = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("user_")) {
      let userData = JSON.parse(localStorage.getItem(key));
      if (userData.application) {
        users.push(userData);
      }
    }
  }

  if (users.length === 0) {
    listContainer.innerHTML = "<p>No applications found.</p>";
    return;
  }

  users.forEach((user, index) => {
    const status = user.status || "Pending";

    const div = document.createElement("div");
    div.className = "form-section";
    div.innerHTML = `
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Name:</strong> ${user.name}</p>
      <p><strong>Roll No:</strong> ${user.rollNo}</p>
      <p><strong>Department:</strong> ${user.personalInfo?.department}</p>
      <p><strong>Year:</strong> ${user.personalInfo?.yearOfStudy}</p>
      <p><strong>Status:</strong> <span id="status-${index}">${status}</span></p>
      <div style="margin-top:10px;">
        <button onclick="updateStatus('${user.email}', 'Approved', ${index})" class="btn-primary">Approve</button>
        <button onclick="updateStatus('${user.email}', 'Rejected', ${index})" class="logout-btn" style="margin-left:10px;">Reject</button>
      </div>
    `;
    listContainer.appendChild(div);
  });
});

function updateStatus(email, status, index) {
  let key = "user_" + email;
  let data = JSON.parse(localStorage.getItem(key));
  data.status = status;
  localStorage.setItem(key, JSON.stringify(data));
  document.getElementById(`status-${index}`).textContent = status;
  alert(`✅ Status updated to ${status}`);
}
