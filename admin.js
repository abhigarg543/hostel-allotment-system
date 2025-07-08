document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('applicationList');

  // Loop through localStorage to find student applications
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('user_') || key.startsWith('user_id_')) {
      const user = JSON.parse(localStorage.getItem(key));
      if (user.application && !user.status) {
        const div = document.createElement('div');
        div.className = 'application-card';
        div.innerHTML = `
          <p><strong>Name:</strong> ${user.name || 'N/A'}</p>
          <p><strong>Roll No:</strong> ${user.rollNo || 'N/A'}</p>
          <p><strong>Email/ID:</strong> ${user.email || user.id}</p>
          <button onclick="updateStatus('${key}', 'Accepted')">✅ Accept</button>
          <button onclick="updateStatus('${key}', 'Rejected')">❌ Reject</button>
          <hr>
        `;
        list.appendChild(div);
      }
    }
  }
});

function updateStatus(key, status) {
  const user = JSON.parse(localStorage.getItem(key));
  user.status = status;
  localStorage.setItem(key, JSON.stringify(user));
  alert(`Student has been ${status}`);
  location.reload();
}
