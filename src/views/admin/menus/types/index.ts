// Central shared types for Admin Menus

export interface MenuTreeNodeLocal {
  id_menu_item: number;
  id_key?: string;
  titulo: string;
  tipo: 'group' | 'collapse' | 'item';
  icono?: string | null;
  url?: string | null;
  parent_id?: number | null;
  orden?: number | null;
  children?: MenuTreeNodeLocal[];
}

export type IdKeyOption = { id_menu_item: number; id_key: string };
