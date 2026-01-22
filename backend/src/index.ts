import express from 'express';
import cors from 'cors';
import { pool } from './db.js';
import { json } from 'node:stream/consumers';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 1. ROTA DE LISTAR (GET) - Todos os equipamentos
  app.get('/assets', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM assets');
      res.status(200).json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao buscar equipamentos' });
    }
  });

// 2. ROTA DE ATUALIZAR (POST) - Atualizar por ID
  app.post('/assets', async (req: express.Request, res: express.Response) => {
    const { hostname, type, ip_address, cpu, ram } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO assets (hostname, type, ip_address, cpu, ram) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [hostname, type, ip_address, cpu, ram]
      );
      res.status(201).json(result.rows[0]);
    }catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao cadastrar equipamento' }); 
    }
  });

  // 3. ROTA DE ATUALIZAÇÃO (PUT) - Editar por ID
  app.put('/assets/:id', async (req, res) => {
    const { id } = req.params;
    const { hostname, type, ip_address, cpu, ram } = req.body;

    try {
      const result = await pool.query(
        'UPDATE assets SET hostname=$1, type=$2, ip_address=$3, cpu=$4, ram=$5 WHERE id=$6 RETURNING *',
        [hostname, type, ip_address, cpu, ram, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Equipamento não encontrado' });
      }
      
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao atualizar equipamento' });
    }
  });

  // 4. ROTA DE DELETAR (DELETE) - Apagar por ID
  app.delete('/assets/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('DELETE FROM assets WHERE id = $1 RETURNING *', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Equipamento não encontrado' });
    }


    res.json ({ message: 'Equipamento deletado com sucesso', asset: result.rows[0]});
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao deletar equipamento' });
    }
  });

  app.listen(PORT, () => {
  console.log(`-> Servidor rodando em http://localhost:${PORT}`);

});