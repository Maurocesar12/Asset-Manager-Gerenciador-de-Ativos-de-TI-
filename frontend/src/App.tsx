import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import { 
  Container, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Button, Dialog, DialogTitle, 
  DialogContent, TextField, DialogActions, IconButton 
} from '@mui/material';

// Ícones
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'; // <--- Novo ícone: Lápis

interface Asset {
  id?: number;
  hostname: string;
  type: string;
  ip_address: string;
  cpu: string;
  ram: string;
}

function App() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [open, setOpen] = useState(false);
  
  // Estado para saber se estamos editando alguém (guarda o ID)
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<Asset>({
    hostname: '', type: '', ip_address: '', cpu: '', ram: ''
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await axios.get('http://localhost:3001/assets');
      setAssets(response.data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  // Função para limpar e fechar tudo
  const handleClose = () => {
    setOpen(false);
    setEditingId(null); // Para de editar
    setFormData({ hostname: '', type: '', ip_address: '', cpu: '', ram: '' }); // Limpa o form
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // --- NOVA FUNÇÃO: Preparar Edição ---
  const handleEdit = (asset: Asset) => {
    setFormData(asset); // Preenche o formulário com os dados da linha
    setEditingId(asset.id || null); // Marca que estamos editando este ID
    setOpen(true); // Abre a janela
  };

  // --- (Cria ou Atualiza) ---
  const handleSave = async () => {
    try {
      if (editingId) {
        // Se tem ID, é ATUALIZAÇÃO (PUT)
        await axios.put(`http://localhost:3001/assets/${editingId}`, formData);
      } else {
        // Se não tem ID, é CRIAÇÃO (POST)
        await axios.post('http://localhost:3001/assets', formData);
      }
      
      fetchAssets(); // Atualiza a tabela
      handleClose(); // Fecha a janela
    } catch (error) {
      alert("Erro ao salvar!");
      console.error(error);
    }
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    const confirmDelete = window.confirm("Tem certeza que deseja excluir este equipamento?");
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:3001/assets/${id}`);
        fetchAssets();
      } catch (error) {
        console.error("Erro ao deletar:", error);
        alert("Erro ao deletar o equipamento.");
      }
    }
  };

  return (
      <>
      <div className="app-header">
        <Typography variant="h4" component="h1" className="app-title">
          📦 Gerenciador de Ativos
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpen}>
          Novo Equipamento
        </Button>
      </div>
      
      <Container maxWidth="lg" className="app-container">
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead className="table-head">
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Hostname</strong></TableCell>
              <TableCell><strong>Tipo</strong></TableCell>
              <TableCell><strong>IP</strong></TableCell>
              <TableCell><strong>CPU</strong></TableCell>
              <TableCell><strong>RAM</strong></TableCell>
              <TableCell align="center"><strong>Ações</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.id} hover>
                <TableCell>{asset.id}</TableCell>
                <TableCell>{asset.hostname}</TableCell>
                <TableCell>{asset.type}</TableCell>
                <TableCell>{asset.ip_address}</TableCell>
                <TableCell>{asset.cpu}</TableCell>
                <TableCell>{asset.ram}</TableCell>
                
                <TableCell align="center">
                  {/* Botão EDITAR (Azul) */}
                  <IconButton color="primary" onClick={() => handleEdit(asset)} style={{ marginRight: '10px' }}>
                    <EditIcon />
                  </IconButton>

                  {/* Botão DELETAR (Vermelho) */}
                  <IconButton color="error" onClick={() => handleDelete(asset.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>

              </TableRow>
            ))}
            {assets.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">Nenhum equipamento cadastrado.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Janela Modal (Serve para Criar e Editar) */}
      <Dialog open={open} onClose={handleClose}>
        {/* O título muda dinamicamente */}
        <DialogTitle>{editingId ? "Editar Equipamento" : "Novo Equipamento"}</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" name="hostname" label="Hostname" fullWidth variant="outlined" value={formData.hostname} onChange={handleChange} />
          <TextField margin="dense" name="type" label="Tipo" fullWidth variant="outlined" value={formData.type} onChange={handleChange} />
          <TextField margin="dense" name="ip_address" label="IP" fullWidth variant="outlined" value={formData.ip_address} onChange={handleChange} />
          <TextField margin="dense" name="cpu" label="CPU" fullWidth variant="outlined" value={formData.cpu} onChange={handleChange} />
          <TextField margin="dense" name="ram" label="RAM" fullWidth variant="outlined" value={formData.ram} onChange={handleChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Cancelar</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {editingId ? "Salvar Alterações" : "Cadastrar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
    </>
  );
}

export default App;