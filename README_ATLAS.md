# Atlas de Dermatologia do Genital Masculino - Backend

## Estrutura Criada

### Models
- **Chapter**: 58 capítulos fixos do atlas
- **Publication**: Publicações médicas com imagens
- **ActionLog**: Log de ações dos usuários
- **Image**: Imagens das publicações (atualizado)

### Relacionamentos
- Chapter 1:N Publication
- User 1:N Publication (autor)
- User 1:N Publication (aprovador)
- Publication 1:N Image
- User 1:N ActionLog

### Rotas Principais

#### Chapters
- `GET /api/v2/chapters` - Listar capítulos
- `GET /api/v2/chapters/:id` - Capítulo específico

#### Publications
- `POST /api/v2/publications/upload` - Upload com imagens
- `GET /api/v2/publications` - Listar publicações
- `GET /api/v2/publications/:id` - Publicação específica
- `PUT /api/v2/publications/approve/:id` - Aprovar/rejeitar (admin)
- `DELETE /api/v2/publications/:id` - Deletar publicação

#### Images
- `GET /api/v2/images/:id` - Visualizar imagem
- `DELETE /api/v2/images/:id` - Deletar imagem

### Middleware
- **roleMiddleware**: Controle de acesso por perfil
- **logMiddleware**: Log automático de ações

### Segurança
- JWT para autenticação
- Controle de roles (user/adm)
- Logs de auditoria
- Validação de uploads

### Próximos Passos
1. Executar `node scripts/sync-db.js` para criar tabelas
2. Executar `node scripts/seed-chapters.js` para inserir capítulos
3. Configurar upload de imagens no frontend
4. Implementar integração com Digital Ocean Spaces