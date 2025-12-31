/**
 * Representa una categoría de producto desde el backend
 */
export interface CategoriaProducto {
  id_categoria: string;
  nombre_categoria: string;
}

/**
 * Payload para crear una categoría de producto
 * - id_categoria: string de máximo 2 caracteres (no vacío)
 * - nombre_categoria: string de 2-24 caracteres
 */
export interface CreateCategoriaProductoPayload {
  id_categoria: string;
  nombre_categoria: string;
}

/**
 * Payload para actualizar una categoría de producto
 * Solo se puede actualizar el nombre (el ID es inmutable)
 */
export interface UpdateCategoriaProductoPayload {
  nombre_categoria: string;
}
