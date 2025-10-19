import React from 'react';

/**
 * ErrorBoundary (lógica pura)
 * - Captura errores de render/ciclo de vida en hijos y muestra un fallback provisto por el consumidor.
 * - Permite forzar el fallback con errorFlag (para errores asíncronos controlados por el padre).
 * - Se "resetea" (sale del fallback) cuando cambia resetKey.
 * - No define estilos ni UI: el fallback lo aporta el consumidor (puede ser tu Alert actual).
 */
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Fallback a renderizar cuando hay error. Puede ser función para recibir el error capturado. */
  fallback: React.ReactNode | ((error?: unknown) => React.ReactNode);
  /** Marca externa para activar fallback ante errores asíncronos controlados por el padre. */
  errorFlag?: boolean;
  /** Cambia este valor para "resetear" el estado de error y reintentar renderizar los hijos. */
  resetKey?: unknown;
  /** Hook opcional para loguear/telemetría del error capturado. */
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  resetKey?: unknown;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      resetKey: props.resetKey
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  static getDerivedStateFromProps(
    props: Readonly<ErrorBoundaryProps>,
    state: Readonly<ErrorBoundaryState>
  ): Partial<ErrorBoundaryState> | null {
    if (props.resetKey !== state.resetKey) {
      return { hasError: false, error: undefined, resetKey: props.resetKey };
    }
    return null;
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // No renderiza UI aquí; permite al consumidor manejar logs/telemetría si lo desea.
    if (this.props.onError) {
      this.props.onError(error, info);
    }
  }

  render(): React.ReactNode {
    const { children, fallback, errorFlag } = this.props;
    const { hasError, error } = this.state;

    if (hasError || errorFlag) {
      const node = typeof fallback === 'function' ? (fallback as (e?: unknown) => React.ReactNode)(error) : fallback;
      return <>{node}</>;
    }

    return children;
  }
}

export default ErrorBoundary;
