import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Los datos se consideran frescos durante 1 minuto
      // antes de hacer un refetch automático
      staleTime: 1000 * 60,
      // Si una query falla, reintenta máximo 1 vez
      // (el default es 3, demasiado para auth errors)
      retry: 1,
      // No refetchear al volver a poner el foco en la ventana
      // evita refetches inesperados al cambiar de pestaña
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})
