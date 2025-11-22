-- complete_admin_setup.sql
-- Arquivo único com os passos comuns para preparar um usuário como administrador (superadmin)
-- Execute este arquivo no SQL Editor do Supabase (https://app.supabase.com) no seu projeto.
-- OBS: este script modifica dados de autenticação (roles) e cria uma tabela de admins. Faça backup se necessário.

-- CONFIGURAÇÃO
-- Edite os valores abaixo diretamente, se quiser aplicar a outro usuário
-- USER_ID: 9767c450-4581-48c9-8681-1c3520c0dd11
-- USER_EMAIL: pedro+test@gmail.com

BEGIN;

-- 1) extensões (se necessário)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2) cria tabela admin_users para controlar papéis administrativos sem mexer diretamente em auth.users
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users (user_id);

-- 3) habilita RLS na tabela de admins
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Política exemplo: permitir gerenciamento apenas pelo contexto service_role (Admin API / SQL editor)
-- Quando você executar este script pelo SQL Editor do painel, o SQL roda com privilégios administrativos.
DROP POLICY IF EXISTS "allow_admin_manage" ON admin_users;
CREATE POLICY "allow_admin_manage" ON admin_users
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 4) opcional: insere o usuário como superadmin na tabela admin_users
-- Substitua :USER_ID se necessário. Se já existir, ignore.
INSERT INTO admin_users (user_id, role)
SELECT '9767c450-4581-48c9-8681-1c3520c0dd11', 'superadmin'
WHERE NOT EXISTS (
  SELECT 1 FROM admin_users WHERE user_id = '9767c450-4581-48c9-8681-1c3520c0dd11'
);

-- 5) (removido) Atualização direta de auth.users.role
-- Optamos por usar apenas a tabela admin_users como fonte de verdade para privilégios.
-- Caso precise mesmo atualizar auth.users.role, adicione manualmente um UPDATE aqui.

-- 6) garantir que o e-mail está confirmado (útil para testes de login)
-- Observação: confirmed_at é uma coluna gerada no Supabase e não pode ser atualizada diretamente.
-- Atualize apenas email_confirmed_at (e phone_confirmed_at se aplicável).
UPDATE auth.users
SET email_confirmed_at = now()
WHERE id = '9767c450-4581-48c9-8681-1c3520c0dd11';

COMMIT;

-- 7) Observações / próximos passos
-- - Este script NÃO altera a senha do usuário. Para alterar a senha use a Admin REST API com a service_role key
--   (veja scripts/set_user_password.sh e scripts/set_user_password.ps1 no repositório para exemplos).
-- - Revise as políticas RLS do seu projeto antes de mover para produção. Você pode querer criar políticas
--   mais específicas (por exemplo permitir leitura para usuários autenticados, mas escrita apenas por service_role).
-- - Se preferir remover a atualização direta de auth.users.role, delete ou comente o bloco marcado como opcional.
