
function openMenuModal() {
  const modal = document.getElementById('menuModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeMenuModal() {
  const modal = document.getElementById('menuModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function handleBackdrop(e) {
  if (e.target && e.target.id === 'menuModal') {
    closeMenuModal();
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeMenuModal();
  }
});

