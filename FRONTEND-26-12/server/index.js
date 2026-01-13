const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { pool } = require('./db');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Helper: insert mensagem into DB
async function insertMensagem({ sala, idUsuarioEnviada, idUsuarioRecebida, mensagem, anexos }) {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.execute(
      `INSERT INTO tbmensagem (sala, idUsuarioEnviada, idUsuarioRecebida, mensagem, anexos, enviadoEm, criadoEm)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [sala, idUsuarioEnviada, idUsuarioRecebida, mensagem, anexos ? JSON.stringify(anexos) : null]
    );
    return result.insertId;
  } finally {
    conn.release();
  }
}

// Helper: fetch history for room
async function fetchHistory(sala, limit = 200) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT idMensagem as id, sala, idUsuarioEnviada as fromId, idUsuarioRecebida as toId, mensagem as text, anexos, enviadoEm as timestamp, recebidoEm, visualizadoEm, lido, entregue
       FROM tbmensagem WHERE sala = ? ORDER BY enviadoEm ASC LIMIT ?`,
      [sala, Number(limit)]
    );
    // parse anexos JSON
    return rows.map(r => ({ ...r, anexos: r.anexos ? JSON.parse(r.anexos) : null }));
  } finally {
    conn.release();
  }
}

// Helper: conversations for user
async function fetchConversations(userId) {
  const conn = await pool.getConnection();
  try {
    // select latest message per sala where user participates
    const [rows] = await conn.query(
      `SELECT m.sala, m.idUsuarioEnviada, m.idUsuarioRecebida, m.mensagem, m.enviadoEm
       FROM tbmensagem m
       INNER JOIN (
         SELECT sala, MAX(enviadoEm) as lastAt
         FROM tbmensagem
         WHERE idUsuarioEnviada = ? OR idUsuarioRecebida = ?
         GROUP BY sala
       ) t ON t.sala = m.sala AND t.lastAt = m.enviadoEm
       ORDER BY m.enviadoEm DESC`,
      [userId, userId]
    );

    // map to conversation summary
    const convs = rows.map(r => {
      // derive otherId by inspecting participants; room naming convention may vary, but we'll try parse
      let otherId = null;
      const parts = (r.sala || '').split('-');
      if (parts.length === 3 && parts[0] === 'chat') {
        const a = Number(parts[1]);
        const b = Number(parts[2]);
        otherId = (a === Number(userId)) ? b : a;
      }
      return {
        room: r.sala,
        otherId: otherId,
        lastMessage: r.mensagem,
        lastAt: r.enviadoEm,
        unread: 0
      };
    });
    return convs;
  } finally {
    conn.release();
  }
}

io.on('connection', (socket) => {
  console.log('client connected', socket.id);

  socket.on('identify', ({ userId }) => {
    socket.data.userId = userId;
    console.log('identified user', userId);
  });

  socket.on('join', async ({ room }) => {
    socket.join(room);
    console.log('joined room', room);
    // send history from DB
    try {
      const hist = await fetchHistory(room, 500);
      hist.forEach(m => socket.emit('message', m));
    } catch (err) {
      console.error('failed to load history for room', room, err);
    }
  });

  socket.on('leave', ({ room }) => {
    socket.leave(room);
    console.log('left room', room);
  });

  socket.on('message', async (msg) => {
    try {
      if (!msg || !msg.room) return;
      // insert into DB
      const id = await insertMensagem({
        sala: msg.room,
        idUsuarioEnviada: msg.fromId,
        idUsuarioRecebida: msg.toId,
        mensagem: msg.text,
        anexos: msg.anexos || null
      });
      const stored = {
        id,
        room: msg.room,
        fromId: msg.fromId,
        toId: msg.toId,
        text: msg.text,
        anexos: msg.anexos || null,
        timestamp: new Date().toISOString()
      };
      // broadcast to room
      io.to(msg.room).emit('message', stored);
    } catch (err) {
      console.error('failed to store/broadcast message', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('client disconnected', socket.id);
  });
});

// REST: post a message (useful for non-socket clients or to persist then emit)
app.post('/messages', async (req, res) => {
  try {
    const { sala, idUsuarioEnviada, idUsuarioRecebida, mensagem, anexos } = req.body;
    if (!sala || !idUsuarioEnviada || !idUsuarioRecebida || !mensagem) {
      return res.status(400).json({ error: 'sala, idUsuarioEnviada, idUsuarioRecebida and mensagem are required' });
    }
    const id = await insertMensagem({ sala, idUsuarioEnviada, idUsuarioRecebida, mensagem, anexos });
    const stored = {
      id,
      room: sala,
      fromId: idUsuarioEnviada,
      toId: idUsuarioRecebida,
      text: mensagem,
      anexos: anexos || null,
      timestamp: new Date().toISOString()
    };
    // emit via socket.io to room
    io.to(sala).emit('message', stored);
    res.json(stored);
  } catch (err) {
    console.error('POST /messages failed', err);
    res.status(500).json({ error: 'internal' });
  }
});

app.get('/history/:room', async (req, res) => {
  try {
    const room = req.params.room;
    const rows = await fetchHistory(room, 1000);
    res.json(rows);
  } catch (err) {
    console.error('GET /history failed', err);
    res.status(500).json({ error: 'internal' });
  }
});

// Return conversations for a given userId (buyer or seller)
app.get('/conversations/:userId', async (req, res) => {
  try {
    const uid = Number(req.params.userId);
    const convs = await fetchConversations(uid);
    res.json(convs);
  } catch (err) {
    console.error('GET /conversations failed', err);
    res.status(500).json({ error: 'internal' });
  }
});

const port = process.env.PORT || 3001;
server.listen(port, () => console.log('Chat server listening on', port));
