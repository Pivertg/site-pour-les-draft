// api/join.js

let rooms = global.rooms || (global.rooms = {});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { code, player } = req.body;
    if (rooms[code]) {
      rooms[code].players.push(player);
      res.status(200).json({ ok: true });
    } else {
      res.status(404).json({ error: 'Room not found' });
    }
  } else {
    res.status(405).end();
  }
}