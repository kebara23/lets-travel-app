-- 1. TABLA DE NOTIFICACIONES
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id), -- Quién recibe la alerta
  title text NOT NULL,
  message text,
  type text, -- 'message', 'itinerary', 'alert', 'system'
  link text, -- A dónde te lleva al hacer click (ej: /itinerary)
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Seguridad
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own notifications" ON public.notifications
FOR ALL USING (auth.uid() = user_id);

-- 2. AUTOMATIZACIÓN 1: Notificar Nuevo Mensaje de Chat
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el mensaje NO es mío, me notifican
  -- (Lógica simplificada: Si hay recipient_id, notificarlo)
  IF NEW.recipient_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      NEW.recipient_id,
      'Nuevo Mensaje',
      left(NEW.content, 50) || '...',
      'message',
      CASE 
        WHEN (SELECT role FROM public.users WHERE id = NEW.recipient_id) = 'admin' THEN '/admin/messages'
        ELSE '/messages'
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_message_notification ON public.messages;
CREATE TRIGGER on_new_message_notification
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE PROCEDURE public.notify_new_message();

-- 3. AUTOMATIZACIÓN 2: Notificar Cambios en Itinerario
CREATE OR REPLACE FUNCTION public.notify_itinerary_change()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Averiguar de quién es el viaje
  SELECT user_id INTO target_user_id 
  FROM public.trips 
  WHERE id = NEW.trip_id;

  IF target_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      target_user_id,
      'Actualización de Viaje',
      'Se ha modificado tu itinerario: ' || NEW.title,
      'itinerary',
      '/itinerary'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_itinerary_change ON public.itinerary_items;
CREATE TRIGGER on_itinerary_change
AFTER INSERT OR UPDATE ON public.itinerary_items
FOR EACH ROW EXECUTE PROCEDURE public.notify_itinerary_change();

