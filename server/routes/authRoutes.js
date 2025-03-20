import express from 'express';
import { query } from '../db.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Rota para verificar sessão atual
router.get('/check-session', async (req, res) => {
  try {
    // Verificar se o usuário tem uma sessão ativa
    // Isso dependerá de como você está gerenciando sessões (cookies, JWT, etc.)
    // Por enquanto, vamos simular uma verificação básica
    
    // Aqui você deve implementar a lógica real de verificação de sessão
    // baseada no seu sistema de autenticação (cookies, tokens, etc.)
    
    // Exemplo: verificar cookie de sessão ou token JWT
    const userId = req.session?.userId; // Supondo que você use express-session
    
    if (!userId) {
      return res.status(401).json({ message: 'Nenhuma sessão ativa' });
    }
    
    // Buscar dados do usuário no banco de dados
    const users = await query('SELECT id, name, email, role FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }
    
    // Retornar dados do usuário
    res.status(200).json(users[0]);
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota de login
router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    
    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: 'Email/usuário e senha são obrigatórios' });
    }
    
    console.log(`Tentativa de login para: ${emailOrUsername}`);
    
    // Buscar usuário pelo email ou nome de usuário
    const users = await query(
      'SELECT * FROM users WHERE email = ? OR name = ? LIMIT 1',
      [emailOrUsername.toLowerCase(), emailOrUsername.toLowerCase()]
    );
    
    if (users.length === 0) {
      console.log(`Usuário não encontrado: ${emailOrUsername}`);
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    const user = users[0];
    
    // Para fins de desenvolvimento e migração, permitir login com credenciais hardcoded
    // Isso deve ser removido em produção
    const isValidHardcodedLogin = 
      (emailOrUsername.toLowerCase() === 'paullo.celullar2020@gmail.com' || 
       emailOrUsername.toLowerCase() === 'paulocell') && 
      password === 'paulocell@admin';
    
    // Verificar se o usuário tem uma senha hash no banco de dados
    // Se não tiver, verificar com as credenciais hardcoded
    if (!user.password_hash && isValidHardcodedLogin) {
      // Usuário autenticado com credenciais hardcoded
      console.log(`Login bem-sucedido para ${emailOrUsername} usando credenciais hardcoded`);
      
      // Criar uma sessão para o usuário
      if (req.session) {
        req.session.userId = user.id;
        req.session.userRole = user.role;
      }
      
      return res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    }
    
    // Se o usuário tem uma senha hash, verificar com bcrypt
    if (user.password_hash) {
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      
      if (!passwordMatch) {
        console.log(`Senha incorreta para ${emailOrUsername}`);
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }
    } else if (!isValidHardcodedLogin) {
      // Se não tem senha hash e não é login hardcoded válido
      console.log(`Credenciais inválidas para ${emailOrUsername}`);
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    // Usuário autenticado
    console.log(`Login bem-sucedido para ${emailOrUsername}`);
    
    // Criar uma sessão para o usuário
    if (req.session) {
      req.session.userId = user.id;
      req.session.userRole = user.role;
    }
    
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Erro durante o login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota de logout
router.post('/logout', (req, res) => {
  try {
    // Destruir a sessão do usuário
    // Isso dependerá de como você está gerenciando sessões
    
    // Se estiver usando express-session:
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          console.error('Erro ao destruir sessão:', err);
          return res.status(500).json({ message: 'Erro ao encerrar sessão' });
        }
        
        // Limpar o cookie de sessão
        res.clearCookie('connect.sid'); // Nome padrão do cookie do express-session
        
        res.status(200).json({ message: 'Logout realizado com sucesso' });
      });
    } else {
      res.status(200).json({ message: 'Nenhuma sessão para encerrar' });
    }
  } catch (error) {
    console.error('Erro durante o logout:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;