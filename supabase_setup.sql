-- Crear tabla de perfiles ligada a auth.users de Supabase
CREATE TABLE public.perfiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  nombre TEXT,
  rol TEXT CHECK (rol IN ('empleado', 'admin')) DEFAULT 'empleado'
);

-- Configurar RLS (Row Level Security) para perfiles
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver su propio perfil" ON public.perfiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins pueden ver todos los perfiles" ON public.perfiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin')
  );

-- Crear tabla de gastos
CREATE TABLE public.gastos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usuario_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE,
  monto NUMERIC(10, 2) NOT NULL,
  categoria TEXT NOT NULL,
  descripcion TEXT,
  metodo_pago TEXT NOT NULL,
  fecha_gasto DATE NOT NULL
);

-- Configurar RLS para gastos
ALTER TABLE public.gastos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Empleados pueden ver y crear sus propios gastos" ON public.gastos
  FOR ALL USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Admins pueden ver todos los gastos" ON public.gastos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "Admins pueden editar todos los gastos" ON public.gastos
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin')
  );
  
CREATE POLICY "Admins pueden eliminar todos los gastos" ON public.gastos
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin')
  );

-- Crear tabla de tareas
CREATE TABLE public.tareas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  admin_id UUID REFERENCES public.perfiles(id),
  empleado_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  estado TEXT CHECK (estado IN ('pendiente', 'completada')) DEFAULT 'pendiente'
);

-- Configurar RLS para tareas
ALTER TABLE public.tareas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Empleados ven y actualizan sus tareas asignadas" ON public.tareas
  FOR SELECT USING (auth.uid() = empleado_id);

CREATE POLICY "Empleados pueden actualizar estado de sus tareas" ON public.tareas
  FOR UPDATE USING (auth.uid() = empleado_id);

CREATE POLICY "Admins pueden manejar todas las tareas" ON public.tareas
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin')
  );

-- Trigger para crear perfil automáticamente al registrar usuario en Supabase Auth
CREATE OR REPLACE FUNCTION public.manejar_nuevo_usuario() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles (id, email, nombre, rol)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'nombre', COALESCE(new.raw_user_meta_data->>'rol', 'empleado'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.manejar_nuevo_usuario();
