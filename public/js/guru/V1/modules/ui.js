
export function showTab(tabName) {
  document.querySelectorAll('.tab-section').forEach(el => el.classList.add('hidden'));
  document.getElementById(`tab-${tabName}`).classList.remove('hidden');

  document.querySelectorAll('aside button').forEach(btn => btn.classList.remove('bg-gray-200'));
  document.getElementById(`nav-${tabName}`).classList.add('bg-gray-200');
}