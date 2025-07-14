// game.js
// Script de démo pour la mise en page du jeu

document.addEventListener('DOMContentLoaded', () => {
  // Simuler les données du mode, map, joueurs, etc.
  const mode = {
    name: 'Gem Grab',
    img: 'https://via.placeholder.com/120x120?text=Gem+Grab'
  };
  const map = {
    name: 'Double Swoosh',
    img: 'https://via.placeholder.com/220x120?text=Double+Swoosh'
  };
  const joueurs = [
    { id: 1, img: 'https://via.placeholder.com/44x44?text=J1' },
    { id: 2, img: 'https://via.placeholder.com/44x44?text=J2' },
    { id: 3, img: 'https://via.placeholder.com/44x44?text=J3' },
    { id: 4, img: 'https://via.placeholder.com/44x44?text=J4' },
    { id: 5, img: 'https://via.placeholder.com/44x44?text=J5' },
    { id: 6, img: 'https://via.placeholder.com/44x44?text=J6' }
  ];
  // Simuler la liste des brawlers (remplacer par la vraie liste plus tard)
  const brawlers = Array.from({length: 30}, (_,i) => ({
    name: 'Brawler ' + (i+1),
    img: 'https://via.placeholder.com/44x44?text=B' + (i+1)
  }));

  // Affichage des images mode/map
  document.getElementById('mode-img').src = mode.img;
  document.getElementById('map-name').textContent = map.name;
  document.getElementById('map-img').src = map.img;

  // Affichage des bans (démo vide)
  const banBleu = document.getElementById('ban-bleu');
  const banRouge = document.getElementById('ban-rouge');
  banBleu.innerHTML = '';
  banRouge.innerHTML = '';

  // Affichage de la liste des brawlers (2 colonnes, scrollable)
  const brawlerList = document.getElementById('brawler-list');
  brawlerList.innerHTML = brawlers.map(b => `
    <button class="brawler-btn" data-name="${b.name}"><img src="${b.img}" alt="${b.name}" /></button>
  `).join('');

  // Sélection double-clic pour ban
  let selected = null;
  brawlerList.querySelectorAll('.brawler-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (selected === btn) {
        btn.classList.add('selected');
        document.getElementById('validate-btn').disabled = false;
      } else {
        brawlerList.querySelectorAll('.brawler-btn').forEach(b => b.classList.remove('selected'));
        selected = btn;
      }
    });
  });

  // Valider le ban (démo)
  document.getElementById('validate-btn').onclick = () => {
    if (selected) {
      // Ajoute l'image dans le rectangle bleu (exemple)
      banBleu.innerHTML += selected.innerHTML;
      selected.disabled = true;
      selected.classList.remove('selected');
      selected = null;
      document.getElementById('validate-btn').disabled = true;
    }
  };

  // --- PHASE DE PICK ---
  // Simuler l'ordre de pick (exemple : bleu, rouge, rouge, bleu, bleu, rouge)
  const pickOrder = [
    { team: 'bleu', joueur: 1 },
    { team: 'rouge', joueur: 1 },
    { team: 'rouge', joueur: 2 },
    { team: 'bleu', joueur: 2 },
    { team: 'bleu', joueur: 3 },
    { team: 'rouge', joueur: 3 }
  ];
  let currentPick = 0;
  let picks = { bleu: [], rouge: [] };
  let selectedPick = null;

  // Affichage dynamique de l'ordre de pick
  function renderPickPhase() {
    document.getElementById('timer').textContent = `À l'équipe ${pickOrder[currentPick].team.toUpperCase()} de choisir (Joueur ${pickOrder[currentPick].joueur})`;
    document.getElementById('validate-btn').disabled = true;
    // Affichage des brawlers restants
    brawlerList.innerHTML = brawlers
      .filter(b => !picks.bleu.includes(b) && !picks.rouge.includes(b))
      .map(b => `<button class="brawler-btn" data-name="${b.name}"><img src="${b.img}" alt="${b.name}" /></button>`).join('');
    // Sélection double-clic
    brawlerList.querySelectorAll('.brawler-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (selectedPick === btn) {
          btn.classList.add('selected');
          document.getElementById('validate-btn').disabled = false;
        } else {
          brawlerList.querySelectorAll('.brawler-btn').forEach(b => b.classList.remove('selected'));
          selectedPick = btn;
        }
      });
    });
  }

  // Valider le pick
  document.getElementById('validate-btn').onclick = () => {
    if (selectedPick) {
      const brawlerName = selectedPick.getAttribute('data-name');
      const team = pickOrder[currentPick].team;
      picks[team].push(brawlers.find(b => b.name === brawlerName));
      // Afficher dans le bon rectangle
      const pickRect = document.getElementById('pick-' + team);
      pickRect.innerHTML += `<img class="brawler-img" src="${selectedPick.querySelector('img').src}" alt="${brawlerName}" />`;
      selectedPick.disabled = true;
      selectedPick.classList.remove('selected');
      selectedPick = null;
      document.getElementById('validate-btn').disabled = true;
      currentPick++;
      if (currentPick < pickOrder.length) {
        renderPickPhase();
      } else {
        showEndPhase();
      }
    }
  };

  // Fin de partie
  function showEndPhase() {
    document.querySelector('.pick-zone').innerHTML = `
      <h2>Partie terminée !</h2>
      <button onclick="location.reload()">Recommencer</button>
      <button disabled>Envoyer le résultat sur Discord (à venir)</button>
    `;
  }

  // Lancer la phase de pick au chargement
  renderPickPhase();

  // Recommencer
  document.getElementById('restart-btn').onclick = () => {
    location.reload();
  };
});
