-- ============================================
-- Permitir a un usuario autenticado insertar/actualizar su propio perfil
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Permitir que el usuario autenticado inserte su propio perfil
CREATE POLICY IF NOT EXISTS "auth_insert_own_profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Permitir que el usuario autenticado actualice su propio perfil
CREATE POLICY IF NOT EXISTS "auth_update_own_profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Permitir que el usuario autenticado seleccione su propio perfil
CREATE POLICY IF NOT EXISTS "auth_select_own_profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);
