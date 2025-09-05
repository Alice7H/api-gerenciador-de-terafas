# Testes da Aplicação

## 1. Autenticação e Autorização

Cenários de Teste

- Criar conta com dados válidos
- Criar admin com chave "admin_hash"
- Criar conta com o mesmo e-mail -> acesso negado
- Login com credenciais válidas
- Login com credenciais inválidas
- Sessão expirada
- Diferenciação de permissões

Resultado Esperado

- JWT válido é gerado no login.
- Administrador acessa rotas restritas.
- Membro tem acesso limitado.

## 2. Gerenciamento de Times

Cenários de Teste

- Admin cria time
- Admin edita time
- Admin adiciona membros
- Admin remove membros
- Member tenta criar/editar time -> acesso negado
- Member tenta adicionar/remover membro no time -> acesso negado

Resultado Esperado

Apenas administradores podem gerenciar times e membros.

## 3. Tarefas (CRUD + Atribuições)

Cenários de Teste

- Admin cria tarefa
- Admin lista tarefas
- Admin atualiza tarefa
- Admin exclui tarefa
- Admin / Membro altera status (Pendente, Em progresso, Concluído)
- Admin / Membro define prioridade (Alta, Média, Baixa)
- Admin atribui tarefa a membro
- Membro tenta atribuir tarefa a outro usuário -> acesso negado
- Membro cria tarefa para sí mesmo
- Membro lista as próprias tarefas
- Membro atualiza as próprias tarefas

Resultado Esperado

CRUD funcionando corretamente.
Apenas administradores podem atribuir tarefas a outros membros e podem excluir tarefas.
Membros podem gerenciar suas tarefas (criar, listar e atualizar)

## 4. Usuário Admin

Cenários de Teste

- Visualizar todas as tarefas
- Gerenciar usuários
- Criar/editar/remover times
- Atribuir tarefas a qualquer membro

Resultado Esperado

Admin tem acesso irrestrito a gestão de usuários, times e tarefas.

## 5. Usuário Member

Cenários de Teste

- Visualizar tarefas do time
- Editar apenas suas tarefas
- Editar tarefas de outros membros -> acesso negado
- Criar/editar times ou gerenciar usuários -> acesso negado

Resultado Esperado

Membro restrito a suas próprias tarefas.
Sem acesso a gerenciamento global.
