// app.js
// Gère l'interface du jeu (création de room, choix, etc.)

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');

  // Affiche la page d'accueil même si l'utilisateur n'est pas connecté
  fetch('/api/me.php')
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(user => {
      showHome();
    })
    .catch(() => {
      showHome();
    });

  function showHome() {
    app.innerHTML = `
      <h1>Bienvenue sur le jeu !</h1>
      <button id="create-room">Créer une room</button>
      <button id="join-room">Rejoindre une room</button>
    `;
    document.getElementById('create-room').onclick = () => {
      // Vérifie la connexion avant d'autoriser
      fetch('/api/me.php')
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(() => showRoomOptions())
        .catch(() => window.location.href = 'login.html');
    };
    document.getElementById('join-room').onclick = () => {
      fetch('/api/me.php')
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(() => showJoinRoomForm())
        .catch(() => window.location.href = 'login.html');
    };
  // Formulaire pour rejoindre une room
  function showJoinRoomForm() {
    app.innerHTML = `
      <h2>Rejoindre une room</h2>
      <form id="join-form">
        <label for="join-code">Code de la room :</label><br>
        <input id="join-code" maxlength="6" style="text-transform:uppercase;letter-spacing:2px;font-size:1.2em;" required autofocus><br><br>
        <label for="player-name">Pseudo :</label><br>
        <input id="player-name" maxlength="16" placeholder="Votre pseudo" required><br><br>
        <button type="submit">Rejoindre</button>
        <button type="button" onclick="location.reload()">Annuler</button>
      </form>
      <div id="join-error" style="color:red;margin-top:10px;"></div>
    `;
    document.getElementById('join-form').onsubmit = async (e) => {
      e.preventDefault();
      const code = document.getElementById('join-code').value.trim().toUpperCase();
      const player = document.getElementById('player-name').value.trim();
      if (!code || !player) return;
      try {
        const res = await fetch('/api/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, player })
        });
        const data = await res.json();
        if (data.ok) {
          // Redirige vers la page d'attente de la room (même page que le créateur)
          showRoomCodePage(code, null, null, player);
        } else {
          document.getElementById('join-error').textContent = data.error || 'Erreur lors de la connexion à la room.';
        }
      } catch (e) {
        document.getElementById('join-error').textContent = 'Erreur réseau.';
      }
    };
  }
  }

  // Choix du nombre de joueurs et du timer
  function showRoomOptions() {
    app.innerHTML = `
      <h2>Voulez-vous jouer à 2 ou à 6 ?</h2>
      <button id="players-2">2 joueurs</button>
      <button id="players-6">6 joueurs</button>
      <div id="timer-section" style="display:none; margin-top:20px;"></div>
    `;
    document.getElementById('players-2').onclick = () => showTimer(2);
    document.getElementById('players-6').onclick = () => showTimer(6);
  }

  // Choix du timer
  function showTimer(players) {
    const timerSection = document.getElementById('timer-section');
    timerSection.style.display = 'block';
    timerSection.innerHTML = `
      <h3>Choisissez le timer :</h3>
      <button class="timer-btn" data-timer="1">1x</button>
      <button class="timer-btn" data-timer="1.5">1,5x</button>
      <button class="timer-btn" data-timer="2">2x</button>
    `;
    let timer = null;
    document.querySelectorAll('.timer-btn').forEach(btn => {
      btn.onclick = (e) => {
        timer = btn.getAttribute('data-timer');
        showPseudoInput();
      };
    });

    function showPseudoInput() {
      timerSection.innerHTML = `
        <h3>Votre pseudo :</h3>
        <input id="creator-pseudo" maxlength="16" placeholder="Votre pseudo" style="font-size:1.1em;" required autofocus>
        <br><br>
        <button id="play-btn">Créer la room</button>
      `;
      document.getElementById('play-btn').onclick = async () => {
        const pseudo = document.getElementById('creator-pseudo').value.trim();
        if (!pseudo) return;
        try {
          const res = await fetch('/api/room', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ player: pseudo })
          });
          const data = await res.json();
          if (data.code) {
            showRoomCodePage(data.code, players, timer, pseudo);
          } else {
            showRoomCodePage('(erreur)', players, timer, pseudo);
          }
        } catch (e) {
          showRoomCodePage('(erreur réseau)', players, timer, pseudo);
        }
      };
    }

    // Nouvelle page dédiée pour afficher le code de la room
    function showRoomCodePage(code, players, timer) {
      // Si players ou timer ne sont pas fournis (cas du join), on va les chercher via l'API
      let currentPlayers = 1;
      let totalPlayers = players;
      let timerValue = timer;
      let intervalId;
      let pseudo = arguments[3] || null;
      async function fetchRoomInfo() {
        try {
          const res = await fetch(`/api/room?code=${code}`);
          const data = await res.json();
          if (data && data.players) {
            currentPlayers = data.players.length;
            if (!totalPlayers) totalPlayers = data.players.length > 2 ? 6 : 2; // fallback
          }
        } catch (e) {}
      }
      function render() {
        app.innerHTML = `
          <h2>Room ${pseudo ? 'trouvée' : 'créée'} !</h2>
          <p>Code de la room :</p>
          <div style="font-size:2em;font-weight:bold;letter-spacing:4px;margin:20px 0;" id="room-code">${code}</div>
          <button id="copy-code">Copier le code</button>
          <p style="margin-top:24px;">Joueurs connectés : <span id="player-count">${currentPlayers}</span> / ${totalPlayers || '?'}</p>
          <button id="go-to-mode" style="margin-top:24px;" disabled>Jouer ${currentPlayers}/${totalPlayers || '?'} </button>
          <button onclick="location.reload()" style="margin-top:8px;">Retour à l'accueil</button>
        `;
        document.getElementById('copy-code').onclick = () => {
          navigator.clipboard.writeText(code);
          document.getElementById('copy-code').textContent = 'Code copié !';
        };
        const playBtn = document.getElementById('go-to-mode');
        playBtn.textContent = `Jouer ${currentPlayers}/${totalPlayers || '?'}`;
        playBtn.disabled = currentPlayers < totalPlayers;
        if (currentPlayers >= totalPlayers) {
          playBtn.disabled = false;
        }
        playBtn.onclick = () => {
          window.location.href = 'game.html';
        };
      }
      async function pollPlayers() {
        await fetchRoomInfo();
        render();
      }
      // Première récupération
      pollPlayers();
      intervalId = setInterval(pollPlayers, 2000);
      window.addEventListener('beforeunload', () => clearInterval(intervalId));
    }
  }

  // Affichage du code de room (à améliorer plus tard)
  function showRoomCode(players, timer) {
    return function(code) {
      app.innerHTML = `
        <h2>Room créée !</h2>
        <p>Joueurs : ${players}</p>
        <p>Timer : ${timer}x</p>
        <p><strong>Code de la room : <span id="room-code">${code}</span></strong></p>
        <button id="go-to-mode">Commencer la partie</button>
        <button onclick="location.reload()">Retour à l'accueil</button>
      `;
      document.getElementById('go-to-mode').onclick = () => {
        window.location.href = 'game.html';
      };
    }
  }

  // Choix du mode de jeu
  function showModeSelection() {
    app.innerHTML = `
      <h2>Choisissez le mode de jeu</h2>
      <button class="mode-btn" data-mode="Gem Grab">Gem Grab</button>
      <button class="mode-btn" data-mode="Bounty">Bounty</button>
      <button class="mode-btn" data-mode="Brawl Ball">Brawl Ball</button>
      <button class="mode-btn" data-mode="Heist">Heist</button>
      <button class="mode-btn" data-mode="Hot Zone">Hot Zone</button>
      <button class="mode-btn" data-mode="Knockout">Knockout</button>
    `;
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.onclick = () => showRandomMap(btn.getAttribute('data-mode'));
    });
  }

  // Affichage d'une map aléatoire selon le mode
  function showRandomMap(mode) {
    const maps = {
      'Gem Grab': ['Double Swoosh', 'Hard Rock Mine', 'Last Stop', 'Undermine', 'Gem Fort'],
      'Bounty': ['Canal Grande', 'Hideout', 'Shooting Star', 'Snake Prairie', 'Layer Cake', 'Dry Season'],
      'Brawl Ball': ['Center Stage', 'Pinball Dreams', 'Penalty Kick', 'Triple Dribble'],
      'Heist': ['Bridge Too Far', 'Hot Potato', 'Kaboom Canyon', 'Safe Zone'],
      'Hot Zone': ['Dueling Beetles', 'Open Business', 'Parallel Plays', 'Ring Of Fire'],
      'Knockout': ["Belle's Rock", 'Flaring Phoenix', 'Goldarm Gulch', 'Out In The Open', 'New Horizons']
    };
    const mapList = maps[mode];
    const randomMap = mapList[Math.floor(Math.random() * mapList.length)];
    app.innerHTML = `
      <h2>Mode : ${mode}</h2>
      <h3>Map sélectionnée :</h3>
      <p style="font-size:1.3em;font-weight:bold;">${randomMap}</p>
      <button id="start-coin">Pile ou Face</button>
      <button onclick="location.reload()">Retour à l'accueil</button>
    `;
    document.getElementById('start-coin').onclick = () => showCoinFlip();
  }

  // Pile ou face pour déterminer l'équipe qui commence à pick
  function showCoinFlip() {
    const teams = ['Bleu', 'Rouge'];
    const winner = teams[Math.floor(Math.random() * 2)];
    app.innerHTML = `
      <h2>Pile ou Face</h2>
      <p>Qui commence à pick ?</p>
      <button id="flip-coin">Lancer</button>
      <div id="coin-result"></div>
    `;
    document.getElementById('flip-coin').onclick = () => {
      document.getElementById('coin-result').innerHTML = `<h3>${winner} commence !</h3><button id="to-ban">Phase de ban</button>`;
      document.getElementById('to-ban').onclick = () => showBanPhase(winner);
    };
  }

  // PHASE DE BAN (ajout du paramètre team qui commence)
  function showBanPhase(startTeam) {
    // Paramètres à ajuster selon le choix initial
    const players = window.lastPlayers || 2; // à stocker lors de la création de room
    const timerMulti = window.lastTimer || 1; // à stocker lors de la création de room
    const banCount = players === 2 ? 3 : 1;
    const baseTime = players === 2 ? 60 : 30;
    const banTime = Math.round(baseTime * timerMulti);
    let bans = [];
    let timer = banTime;
    let interval;

    // Liste des brawlers par rareté
    const brawlers = {
      'Initiale': ['Shelly'],
      'Rare': ['Nita', 'Colt', 'Bull', 'Brock', 'El Primo', 'Poco', 'Barley', 'Rosa'],
      'Super‑Rare': ['Jessie', 'Dynamike', 'Tick', '8‑Bit', 'Rico', 'Darryl', 'Penny', 'Carl', 'Jacky', 'Gus'],
      'Épique': ['Bo', 'Emz', 'Stu', 'Piper', 'Pam', 'Frank', 'Bibi', 'Bea', 'Nani', 'Edgar', 'Griff', 'Grom', 'Bonnie', 'Gale', 'Colette', 'Belle', 'Ash', 'Lola', 'Sam', 'Mandy', 'Maisie', 'Hank', 'Pearl', 'Larry & Lawrie', 'Angelo', 'Berry', 'Shade', 'Meeple', 'Trunk (bientôt)'],
      'Mythique': ['Mortis', 'Tara', 'Byron', 'Max', 'Mr. P', 'Sprout', 'Squeak', 'Lou', 'Ruffs', 'Buzz', 'Fang', 'Eve', 'Janet', 'Otis', 'Buster', 'Gray', 'R‑T', 'Willow', 'Doug', 'Chuck', 'Charlie', 'Mico', 'Melodie', 'Lily', 'Clancy', 'Moe', 'Juju', 'Ollie', 'Finx', 'Lumi', 'Jae‑Yong', 'Alli (prochaine)'],
      'Légendaire': ['Amber', 'Kenji', 'Leon', 'Crow', 'Spike', 'Sandy', 'Kit', 'Cordelius', 'Chester', 'Draco', 'Surge', 'Meg'],
      'Ultra Légendaire': ['Kaze']
    };

    function renderBrawlers() {
      let html = '';
      for (const rarete in brawlers) {
        html += `<h4>${rarete}</h4><div class="brawler-row">`;
        brawlers[rarete].forEach(b => {
          const isBanned = bans.includes(b);
          html += `<button class="brawler-btn" data-brawler="${b}" ${isBanned ? 'disabled style="opacity:0.5;"' : ''}>${b}</button>`;
        });
        html += '</div>';
      }
      return html;
    }

    app.innerHTML = `
      <h2>Phase de ban</h2>
      <p>Temps restant : <span id="ban-timer">${timer}</span> s</p>
      <p>Brawlers bannis : <span id="ban-count">0</span> / ${banCount}</p>
      <div id="brawler-list">${renderBrawlers()}</div>
      <button id="finish-ban" disabled>Valider mes bans</button>
    `;

    // Timer
    interval = setInterval(() => {
      timer--;
      document.getElementById('ban-timer').textContent = timer;
      if (timer <= 0) {
        clearInterval(interval);
        finishBan();
      }
    }, 1000);

    // Sélection des bans
    document.querySelectorAll('.brawler-btn').forEach(btn => {
      btn.onclick = () => {
        if (bans.length < banCount && !bans.includes(btn.getAttribute('data-brawler'))) {
          bans.push(btn.getAttribute('data-brawler'));
          document.getElementById('ban-count').textContent = bans.length;
          document.getElementById('brawler-list').innerHTML = renderBrawlers();
          document.querySelectorAll('.brawler-btn').forEach(btn2 => {
            btn2.onclick = btn.onclick;
          });
          document.getElementById('finish-ban').disabled = bans.length !== banCount;
        }
      };
    });

    document.getElementById('finish-ban').onclick = finishBan;

    // À la fin de la phase de ban, passer à la phase de pick
    function finishBan() {
      clearInterval(interval);
      app.innerHTML = `
        <h2>Bans terminés !</h2>
        <p>Brawlers bannis :</p>
        <ul>${bans.map(b => `<li>${b}</li>`).join('')}</ul>
        <button id="to-pick">Phase de pick</button>
      `;
      document.getElementById('to-pick').onclick = () => showPickPhase(startTeam);
    }
  }

  // Répartition aléatoire des joueurs dans les camps et phase de pick
  function showPickPhase(startTeam) {
    // Pour la démo, on simule les joueurs (à remplacer par la vraie logique multi plus tard)
    const players = window.lastPlayers || 2;
    let allPlayers = [];
    if (players === 2) {
      allPlayers = ['Joueur 1', 'Joueur 2'];
    } else {
      allPlayers = ['Joueur 1', 'Joueur 2', 'Joueur 3', 'Joueur 4', 'Joueur 5', 'Joueur 6'];
    }
    // Mélange aléatoire
    allPlayers = allPlayers.sort(() => Math.random() - 0.5);
    const teamA = allPlayers.slice(0, players/2);
    const teamB = allPlayers.slice(players/2);
    const bleu = startTeam === 'Bleu' ? teamA : teamB;
    const rouge = startTeam === 'Bleu' ? teamB : teamA;

    // Ordre de pick
    let pickOrder = [];
    if (players === 2) {
      pickOrder = [bleu[0], rouge[0]];
    } else {
      pickOrder = [bleu[0], rouge[0], rouge[1], bleu[1], bleu[2], rouge[2]];
    }
    let picks = {};
    let current = 0;

    // Liste des brawlers restants (à filtrer avec les bans si besoin)
    let brawlersLeft = [];
    for (const rarete in brawlers) {
      brawlersLeft = brawlersLeft.concat(brawlers[rarete]);
    }
    // Retirer les bannis (à stocker dans window.lastBans ou à passer en paramètre)
    // Pour la démo, on ne filtre pas

    function renderPick() {
      app.innerHTML = `
        <h2>Phase de pick</h2>
        <p>À ${pickOrder[current]} de choisir un brawler</p>
        <div id="pick-list">${brawlersLeft.map(b => `<button class="pick-btn" data-brawler="${b}">${b}</button>`).join('')}</div>
        <div id="pick-result"></div>
      `;
      document.querySelectorAll('.pick-btn').forEach(btn => {
        btn.onclick = () => {
          const b = btn.getAttribute('data-brawler');
          picks[pickOrder[current]] = b;
          brawlersLeft = brawlersLeft.filter(x => x !== b);
          current++;
          if (current < pickOrder.length) {
            renderPick();
          } else {
            showPickResult();
          }
        };
      });
    }
    function showPickResult() {
      app.innerHTML = `
        <h2>Picks terminés !</h2>
        <ul>${pickOrder.map(p => `<li>${p} : ${picks[p]}</li>`).join('')}</ul>
        <button onclick="location.reload()">Retour à l'accueil</button>
      `;
    }
    renderPick();
  }

  showHome();
});
