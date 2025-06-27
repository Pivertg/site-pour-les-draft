// api/room.js

let rooms = global.rooms || (global.rooms = {});

export default function handler(req, res) {
  if (req.method === 'POST') {
    // Créer une room
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    rooms[code] = { players: [] };
    res.status(200).json({ code });
  } else if (req.method === 'GET') {
    // Obtenir l’état d’une room
    const { code } = req.query;
    if (rooms[code]) {
      res.status(200).json(rooms[code]);
    } else {
      res.status(404).json({ error: 'Room not found' });
    }
  } else {
    res.status(405).end();
  }
}