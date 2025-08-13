-- Inserir usuário de teste diretamente na tabela auth.users
-- Nota: Este é um método para testes apenas, em produção use a API do Supabase

-- Primeiro, vamos inserir o usuário na tabela auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'lauroroger@cupcode.com.br',
  crypt('Temp#Cupcode2025', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Também vamos inserir na tabela auth.identities para consistência
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users WHERE email = 'lauroroger@cupcode.com.br'),
  'lauroroger@cupcode.com.br',
  format('{"sub":"%s","email":"%s"}', 
    (SELECT id FROM auth.users WHERE email = 'lauroroger@cupcode.com.br'), 
    'lauroroger@cupcode.com.br')::jsonb,
  'email',
  NOW(),
  NOW(),
  NOW()
);