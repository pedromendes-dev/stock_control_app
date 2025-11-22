-- SQL para criar tabela de administradores e política RLS
-- Atenção: execute este script no SQL Editor do Supabase (app.supabase.com) ou em um contexto com permissões adequadas.

-- Cria tabela para mapear usuários do auth para papéis administrativos
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users (user_id);

-- Habilita RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Política de exemplo: apenas o contexto service_role (Admin API / SQL editor) pode inserir/atualizar/remover.
-- OBS: Não inclua barras invertidas (\) ao redor de identificadores — isso causa erro de sintaxe.
CREATE POLICY "allow_admin_manage" ON admin_users
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Nota:
-- 1) O SQL Editor do painel Supabase executa com privilégios de administrador, por isso você pode rodar
--    este script diretamente lá. Após executar, insira registros em admin_users para promover usuários.
-- 2) Para inserir um admin (exemplo):
--    INSERT INTO admin_users (user_id, role) VALUES ('9767c450-4581-48c9-8681-1c3520c0dd11', 'superadmin');
-- 3) Se preferir políticas mais permissivas (por exemplo permitir leitura para 'authenticated'), ajustaremos conforme necessário.
