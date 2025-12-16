import { http } from '#/services/apiClient/http';

export interface MenuNode {
  id_menu_item: number;
  id_key: string;
  titulo: string;
  tipo: 'group' | 'collapse' | 'item';
  url?: string;
  icono?: string;
  caption?: string;
  external?: 0 | 1;
  target_blank?: 0 | 1;
  breadcrumbs?: 0 | 1;
  orden?: number;
  estado?: 0 | 1;
}

export interface MenuTreeNode extends MenuNode {
  children?: MenuTreeNode[];
}

export interface CreateGroupPayload {
  id_key: string;
  titulo: string;
  tipo: 'group' | 'collapse';
  icono?: string;
  caption?: string;
  orden?: number;
  estado?: 0 | 1;
}

export interface CreateItemPayload {
  id_key: string;
  titulo: string;
  tipo: 'item';
  url: string;
  icono?: string;
  caption?: string;
  external?: 0 | 1;
  target_blank?: 0 | 1;
  breadcrumbs?: 0 | 1;
  orden?: number;
  estado?: 0 | 1;
  parent_id?: number;
  child_order?: number;
}

export type UpdateNodePayload = Partial<Omit<MenuNode, 'id_menu_item' | 'tipo'>> & {
  // explicit fields allowed on update
  id_key?: string;
  titulo?: string;
  url?: string;
  icono?: string;
  caption?: string;
  external?: 0 | 1;
  target_blank?: 0 | 1;
  breadcrumbs?: 0 | 1;
  orden?: number;
  estado?: 0 | 1;
};

export interface EdgePayload {
  parent_id: number;
  child_id: number;
  orden?: number;
}

export interface DeleteOptions { hard?: boolean }

async function createGroup(body: CreateGroupPayload, token?: string): Promise<MenuNode> {
  return await http<MenuNode>('/menus/admin/groups', { method: 'POST', body, token });
}

async function createItem(body: CreateItemPayload, token?: string): Promise<MenuNode> {
  return await http<MenuNode>('/menus/admin/items', { method: 'POST', body, token });
}

async function updateNode(id: number, body: UpdateNodePayload, token?: string): Promise<MenuNode | null> {
  return await http<MenuNode | null>(`/menus/admin/${id}`, { method: 'PUT', body, token });
}

async function deleteNode(id: number, opts?: DeleteOptions, token?: string): Promise<{ deleted: boolean }> {
  const query = opts?.hard ? '?hard=true' : '';
  return await http<{ deleted: boolean }>(`/menus/admin/${id}${query}`, { method: 'DELETE', token });
}

async function addEdge(body: EdgePayload, token?: string): Promise<{ created: boolean }> {
  return await http<{ created: boolean }>(`/menus/admin/edges`, { method: 'POST', body, token });
}

async function removeEdge(body: EdgePayload, token?: string): Promise<{ deleted: boolean }> {
  return await http<{ deleted: boolean }>(`/menus/admin/edges`, { method: 'DELETE', body, token });
}

async function getTree(token?: string): Promise<MenuTreeNode[]> {
  return await http<MenuTreeNode[]>(`/menus/admin/tree`, { method: 'GET', token });
}

export const AdminMenusService = {
  createGroup,
  createItem,
  updateNode,
  deleteNode,
  addEdge,
  removeEdge,
  getTree
};
