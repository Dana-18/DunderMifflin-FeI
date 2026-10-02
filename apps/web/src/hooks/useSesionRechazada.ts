import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { SESION_RECHAZADA } from '../lib/api';
import { borrarSesion } from '../lib/sesion';

// Se monta una sola vez, en App. Cuando la API rechaza la sesión (token
// vencido o sin permiso), la borra y manda a la pantalla de ingreso.
//
// Está acá y no en lib/api.ts porque navegar y limpiar la caché necesitan
// hooks de React, y api.ts es una función común que no los puede usar.
export function useSesionRechazada() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    function alRechazar() {
      borrarSesion();
      // Los datos en caché eran de la sesión anterior: no tienen que quedar
      // a la vista de quien ingrese después.
      queryClient.clear();
      navigate('/ingresar', { replace: true, state: { sesionVencida: true } });
    }

    window.addEventListener(SESION_RECHAZADA, alRechazar);
    return () => window.removeEventListener(SESION_RECHAZADA, alRechazar);
  }, [navigate, queryClient]);
}
