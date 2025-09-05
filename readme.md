# Desafio prático - Gerenciador de tarefas

É uma API para um sistema Gerenciador de tarefas, onde os usuários podem criar contas, autenticar-se e gerenciar tarefas. As tarefas podem ser atribuídas a membros do time, categorizadas por status e prioridade, e acompanhadas.

## Tecnologias e Recursos

- **Backend Node.js:**
  - Framework: Express.js
  - Banco de dados: PostgreSQL
  - ORM: Prisma
- **Testes:**
  - Framework de testes: Jest
- **Deploy:**
  - Deploy do backend em **Render**.
- **Outros:**
  - Docker
  - TypeScript
  - Validação com Zod
  - JWT

## Funcionalidades da aplicação

**Autenticação e Autorização:**

- Deve ser possível criar uma conta e iniciar uma sessão.
- JWT para autenticação.
- Níveis de acesso:
  - **Administrador**: gerencia usuários e equipes.
  - **Membro**: gerencia tarefas atribuídas.

**Gerenciamento de Times:**

- Apenas o usuário admin pode criar e editar times.
- Apenas o usuário admin pode adicionar ou remover membros do time.

**Tarefas:**

- CRUD de tarefas (criar, ler, atualizar, deletar).
- Status: "Pendente", "Em progresso", "Concluído".
- Prioridade: "Alta", "Média", "Baixa".
- Atribuição de tarefas para membros específicos.

**Usuário Admin:**

- Visualizar e gerenciar todas as tarefas, usuários e times.

**Member:**

- Visualiza tarefas do time
- Pode editar apenas suas tarefas

## Exemplo de estrutura para o banco de dados

---

### **1. Tabela: `users`**

Armazena informações dos usuários do sistema.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | INTEGER | Unique identifier (PK). |
| `name` | VARCHAR(100) | User's name. |
| `email` | VARCHAR(150) | User's email (unique). |
| `password` | VARCHAR(255) | User's hashed password. |
| `role` | ENUM('admin', 'member') | User's access level. |
| `created_at` | TIMESTAMP | Creation date and time. |
| `updated_at` | TIMESTAMP | Last update date and time. |

---

### **2. Tabela: `teams`**

Representa os times/equipes de trabalho.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | INTEGER | Unique identifier (PK). |
| `name` | VARCHAR(100) | Team's name. |
| `description` | TEXT | Optional description of the team. |
| `created_at` | TIMESTAMP | Creation date and time. |
| `updated_at` | TIMESTAMP | Last update date and time. |

---

### **3. Tabela: `team_members`**

Relaciona usuários com times.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | INTEGER | Unique identifier (PK). |
| `user_id` | INTEGER | Reference to the user (`users.id`). |
| `team_id` | INTEGER | Reference to the team (`teams.id`). |
| `created_at` | TIMESTAMP | Creation date and time. |

**Relacionamento:**

- `user_id` → FK para `users.id`
- `team_id` → FK para `teams.id`

---

### **4. Tabela: `tasks`**

Armazena as tarefas criadas no sistema.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | INTEGER | Unique identifier (PK). |
| `title` | VARCHAR(200) | Task's title. |
| `description` | TEXT | Optional detailed description of the task. |
| `status` | ENUM('pending', 'in_progress', 'completed') | Task's status. |
| `priority` | ENUM('high', 'medium', 'low') | Task's priority. |
| `assigned_to` | INTEGER | Reference to the user assigned to the task (`users.id`). |
| `team_id` | INTEGER | Reference to the team the task belongs to (`teams.id`). |
| `created_at` | TIMESTAMP | Creation date and time. |
| `updated_at` | TIMESTAMP | Last update date and time. |

**Relacionamento:**

- `assigned_to` → FK para `users.id`
- `team_id` → FK para `teams.id`

---

### **5. Tabela: `task_history` (opcional)**

Armazena mudanças de status e atualizações das tarefas.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | INTEGER | Unique identifier (PK). |
| `task_id` | INTEGER | Reference to the task (`tasks.id`). |
| `changed_by` | INTEGER | Reference to the user who made the change (`users.id`). |
| `old_status` | ENUM | Previous status of the task. |
| `new_status` | ENUM | New status of the task. |
| `changed_at` | TIMESTAMP | Date and time of the change. |

**Relacionamento:**

- `task_id` → FK para `tasks.id`
- `changed_by` → FK para `users.id`

---

### **Relacionamentos Resumidos:**

1. **`users` → `teams` via `team_members`.**
2. **`users` → `tasks` via `assigned_to`.**
3. **`teams` → `tasks` via `team_id`.**
4. **`tasks` → `task_history` via `task_id`.**

## Execução do projeto

Use o comando `npm install` ou `npm i` para instalar os pacotes de dependência do projeto.

No projeto, usamos o docker para executar o banco de dados PostgreSQL em um contêiner, entre os arquivos está o docker-compose.yml. Execute o comando `docker-compose up -d` para criar e iniciar todos os serviços definidos no arquivo e rodar o container no modo detached (em segundo plano).

Configure o arquivo .env com as informações do seu banco de dados. Ex: "postgresql://postgres:postgres@localhost:5432/task_manager_db?schema=public"

Use o comando `npx prisma migrate dev` para aplicar as migrations ou `npx prisma migrate dev --name <migration_name>` para gerar arquivos de migração SQL com base nos modelos do schema.prisma.

Use o comando `npm run dev` para executar o projeto em ambiente local.
O comando `npx prisma studio` te possibilitará explorar e editar dados no projeto Prisma.

## Informações extras

O arquivo insomnia_routes.json pode ser usado na ferramenta [Insomnia](https://insomnia.rest/) para testes e interação com a API.

Use o comando `npx prisma generate` sempre que fizer alterações no seu esquema Prisma (por exemplo, adicionando novos modelos, campos ou relacionamentos) para atualizar o Prisma Client gerado e mantê-lo sincronizado com seu banco de dados.
