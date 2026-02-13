/**
 * Representa una categoría de artículo desde el backend
 */
export interface CategoriaArticulo {
  id_categoria: string;
  nombre_categoria: string;
}

/**
 * Payload para crear una categoría de artículo
 * - id_categoria: string de máximo 2 caracteres (no vacío)
 * - nombre_categoria: string de 2-24 caracteres
 */
export interface CreateCategoriaArticuloPayload {
  id_categoria: string;
  nombre_categoria: string;
}

/**
 * Payload para actualizar una categoría de artículo
 * Solo se puede actualizar el nombre (el ID es inmutable)
 */
export interface UpdateCategoriaArticuloPayload {
  nombre_categoria: string;
}
