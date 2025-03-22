import { query } from './db.js';

export default async function handler(req, res) {
  try {
    // Definir cabeçalhos CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    // Responder ao método preflight OPTIONS
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Apenas permitir POST para login
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Método não permitido' });
    }

    const { emailOrUsername, password } = req.body;
    
    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: 'Email/usuário e senha são obrigatórios' });
    }
    
    console.log(`Tentativa de login para: ${emailOrUsername}`);
    
    // Primeiro, verificar login hardcoded para desenvolvimento e migração
    // Isso deve ser removido em produção ou protegido adequadamente
    const isValidHardcodedLogin = 
      (emailOrUsername.toLowerCase() === 'paullo.celullar2020@gmail.com' || 
       emailOrUsername.toLowerCase() === 'paulocell') && 
      password === 'paulocell@admin';
    
    if (isValidHardcodedLogin) {
      console.log(`Login bem-sucedido para ${emailOrUsername} usando credenciais hardcoded`);
      
      // Retorna usuário padrão
      return res.status(200).json({
        id: '1',
        name: 'Paulo Cell',
        email: 'paullo.celullar2020@gmail.com',
        role: 'admin'
      });
    }
    
    // Se não for login hardcoded, tentar verificar no banco de dados
    try {
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
      
      // Aqui deve ir a verificação de senha real com bcrypt
      // Por enquanto, vamos aceitar qualquer senha para o usuário encontrado
      console.log(`Login bem-sucedido para ${emailOrUsername} via banco de dados`);
      
      return res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'user'
      });
    } catch (dbError) {
      console.error('Erro ao acessar banco de dados:', dbError);
      
      // Se falhar acesso ao banco, mas as credenciais hardcoded forem válidas
      if (isValidHardcodedLogin) {
        return res.status(200).json({
          id: '1',
          name: 'Paulo Cell',
          email: 'paullo.celullar2020@gmail.com',
          role: 'admin'
        });
      }
      
      // Se o banco falhar e não for login hardcoded
      return res.status(500).json({ message: 'Erro ao verificar credenciais no servidor' });
    }
  } catch (error) {
    console.error('Erro durante o login:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
} 