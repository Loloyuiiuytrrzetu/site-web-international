// Menu mobile (burger)
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
burger.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
});
// Fermer le menu après un clic sur un lien
nav.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => {
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', false);
  })
);
// Année automatique dans le pied de page
document.getElementById('year').textContent = new Date().getFullYear();
