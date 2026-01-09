import { useEffect, useRef } from 'react';

/**
 * Hook personalizado para manejar el foco de manera accesible en diálogos y modales.
 * 
 * Características:
 * - Enfoca automáticamente el primer elemento interactivo cuando se abre el modal
 * - Almacena y restaura el foco previo al cerrar el modal
 * - Previene warnings de aria-hidden con elementos enfocados
 * 
 * @param isOpen - Estado de apertura del modal/diálogo
 * @param autoFocus - Si debe enfocar automáticamente al abrir (default: true)
 * @returns ref para asignar al primer elemento que debe recibir foco
 */
export function useFocusManagement<T extends HTMLElement>(
  isOpen: boolean,
  autoFocus: boolean = true
) {
  const elementRef = useRef<T>(null);
  const previouslyFocusedElement = useRef<Element | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Guardar el elemento que tenía el foco antes de abrir el modal
      previouslyFocusedElement.current = document.activeElement;

      if (autoFocus) {
        // Enfocar el primer elemento interactivo lo antes posible.
        // Un delay largo puede dejar el foco en el botón disparador mientras MUI aplica aria-hidden.
        const timer = setTimeout(() => {
          elementRef.current?.focus();
        }, 0);

        return () => clearTimeout(timer);
      }
    } else if (previouslyFocusedElement.current) {
      // Restaurar el foco al elemento que lo tenía antes del modal
      if (previouslyFocusedElement.current instanceof HTMLElement) {
        previouslyFocusedElement.current.focus();
      }
      previouslyFocusedElement.current = null;
    }
  }, [isOpen, autoFocus]);

  return elementRef;
}

/**
 * Hook para manejar el comportamiento inerte de contenido de fondo.
 * 
 * Aplica el atributo 'inert' al contenido principal cuando hay un modal abierto,
 * lo cual es una alternativa más robusta que aria-hidden para prevenir interacción
 * con elementos de fondo.
 * 
 * @param isModalOpen - Estado de apertura del modal
 * @param rootSelector - Selector del elemento raíz (default: '#root')
 */
export function useInertBackground(
  isModalOpen: boolean,
  rootSelector: string = '#root'
) {
  useEffect(() => {
    const rootElement = document.querySelector(rootSelector);
    
    if (rootElement) {
      if (isModalOpen) {
        // Hacer el contenido de fondo inerte cuando el modal está abierto
        rootElement.setAttribute('inert', '');
      } else {
        // Remover la propiedad inert cuando el modal se cierra
        rootElement.removeAttribute('inert');
      }
    }

    // Cleanup: siempre remover inert al desmontar
    return () => {
      if (rootElement) {
        rootElement.removeAttribute('inert');
      }
    };
  }, [isModalOpen, rootSelector]);
}