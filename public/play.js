// play.js
// Logique multijoueur avec polling et actions partagées

document.addEventListener('DOMContentLoaded', () => {
  // Récupère le code de la room dans l'URL
  const params = new URLSearchParams(window.location.search);
  const roomCode = params.get('code');
  if (!roomCode) {
    alert('Code de room manquant.');
    window.location.href = 'lobby.html';
    return;
  }

  // Variables d'état
  let gameState = null;
  let pollingInterval = null;
  let userPseudo = null;

  // Récupère le pseudo de l'utilisateur connecté
  async function getUserPseudo() {
    try {
      const res = await fetch('/api/me.php');
      if (!res.ok) throw new Error();
      const user = await res.json();
      return user.pseudo;
    } catch {
      return null;
    }
  }

  // Polling pour récupérer l'état de la room
  async function pollGameState() {
    try {
      const res = await fetch(`/api/room.php?code=${roomCode}`);
      if (!res.ok) throw new Error();
      gameState = await res.json();
      renderGame();
    } catch {
      document.body.innerHTML = '<h2>Erreur de connexion à la room.</h2>';
      clearInterval(pollingInterval);
    }
  }

  // Rendu de la partie selon l'état partagé
  function renderGame() {
    // Affichage des infos de la room
    document.getElementById('map-name').textContent = gameState.map || 'Nom de la map';
    document.getElementById('mode-img').src = gameState.modeImg || 'https://via.placeholder.com/120x120?text=Mode';
    document.getElementById('map-img').src = gameState.mapImg || 'https://via.placeholder.com/220x120?text=Map';

    // Affichage des bans
    const banBleu = document.getElementById('ban-bleu');
    const banRouge = document.getElementById('ban-rouge');
    if (banBleu) banBleu.innerHTML = (gameState.bansBleu || []).map(b => `<img src="${b.img}" alt="${b.name}" />`).join('');
    if (banRouge) banRouge.innerHTML = (gameState.bansRouge || []).map(b => `<img src="${b.img}" alt="${b.name}" />`).join('');

    // Affichage des picks
    document.getElementById('pick-bleu').innerHTML = (gameState.picksBleu || []).map(b => `<img class="brawler-img" src="${b.img}" alt="${b.name}" />`).join('');
    document.getElementById('pick-rouge').innerHTML = (gameState.picksRouge || []).map(b => `<img class="brawler-img" src="${b.img}" alt="${b.name}" />`).join('');

    // Affichage de la phase courante
    const phase = gameState.phase || 'ban';
    if (phase === 'ban') {
      renderBanPhase();
    } else if (phase === 'pick') {
      renderPickPhase();
    } else if (phase === 'end') {
      showEndPhase();
    }
  }

  // Phase de ban partagée
  function renderBanPhase() {
    const brawlerList = document.getElementById('brawler-list');
    const brawlers = gameState.brawlers || [];
    // Affiche les brawlers non bannis
    brawlerList.innerHTML = brawlers.filter(b => !gameState.bansBleu?.some(x => x.name === b.name) && !gameState.bansRouge?.some(x => x.name === b.name))
      .map(b => `<button class="brawler-btn" data-name="${b.name}"><img src="${b.img}" alt="${b.name}" /></button>`).join('');
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
    document.getElementById('validate-btn').onclick = async () => {
      if (selected) {
        await sendAction('ban', selected.getAttribute('data-name'));
        document.getElementById('validate-btn').disabled = true;
      }
    };
    document.getElementById('timer').textContent = 'Phase de ban';
  }

  // Phase de pick partagée
  function renderPickPhase() {
    const brawlerList = document.getElementById('brawler-list');
    const brawlers = gameState.brawlers || [];
    // Affiche les brawlers non pick
    brawlerList.innerHTML = brawlers.filter(b => !gameState.picksBleu?.some(x => x.name === b.name) && !gameState.picksRouge?.some(x => x.name === b.name))
      .map(b => `<button class="brawler-btn" data-name="${b.name}"><img src="${b.img}" alt="${b.name}" /></button>`).join('');
    let selectedPick = null;
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
    document.getElementById('validate-btn').onclick = async () => {
      if (selectedPick) {
        await sendAction('pick', selectedPick.getAttribute('data-name'));
        document.getElementById('validate-btn').disabled = true;
      }
    };
    document.getElementById('timer').textContent = 'Phase de pick';
  }

  // Fin de partie partagée
  function showEndPhase() {
    document.querySelector('.pick-zone').innerHTML = `
      <h2>Partie terminée !</h2>
      <button onclick="location.reload()">Recommencer</button>
      <button disabled>Envoyer le résultat sur Discord (à venir)</button>
    `;
  }

  // Envoi d'une action au serveur
  async function sendAction(type, value) {
    await fetch('/api/game_action.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: roomCode, pseudo: userPseudo, type, value })
    });
    // Le polling va rafraîchir l'état
  }

  // Initialisation
  (async () => {
    userPseudo = await getUserPseudo();
    if (!userPseudo) {
      alert('Utilisateur non connecté.');
      window.location.href = 'index.html';
      return;
    }
    pollingInterval = setInterval(pollGameState, 2000);
    pollGameState();
  })();
});
