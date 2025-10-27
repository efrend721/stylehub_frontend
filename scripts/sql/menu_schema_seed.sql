-- stylehub_db menu schema and seed (MySQL 8.0+)
-- Variant: WITHOUT parent_id; hierarchy via menus_items_children
-- Covers UI fields from src/menu-items: id_key, titulo, tipo, url, icono, caption,
-- external, target_blank, breadcrumbs, orden, estado.
-- Note: UI has two "Sample Page" under different groups with different icons.
-- To keep unique keys, we create two items: 'sample-page' and 'sample-page-chrome'.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

-- Drop in dependency order
DROP TABLE IF EXISTS roles_menu_items;
DROP TABLE IF EXISTS menus_items_children;
DROP TABLE IF EXISTS menus_items;

SET FOREIGN_KEY_CHECKS=1;

-- 1) Menus (no parent_id)
CREATE TABLE menus_items (
  id_menu_item        INT AUTO_INCREMENT PRIMARY KEY,
  id_key              VARCHAR(64)  NOT NULL,
  titulo              VARCHAR(128) NULL,
  tipo                ENUM('group','item','collapse') NOT NULL,
  url                 VARCHAR(255) NULL,
  icono               VARCHAR(64)  NULL,
  caption             VARCHAR(255) NULL,
  external            TINYINT(1)   NOT NULL DEFAULT 0,
  target_blank        TINYINT(1)   NOT NULL DEFAULT 0,
  breadcrumbs         TINYINT(1)   NOT NULL DEFAULT 1,
  orden               INT          NOT NULL DEFAULT 0,
  estado              TINYINT(1)   NOT NULL DEFAULT 1,
  fecha_creacion      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT chk_mi_tipo_url
    CHECK (
      (tipo IN ('group','collapse') AND url IS NULL)
      OR (tipo = 'item' AND url IS NOT NULL)
    ),

  UNIQUE KEY uq_mi_id_key (id_key),
  KEY idx_mi_tipo (tipo),
  KEY idx_mi_estado (estado),
  KEY idx_mi_orden (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2) Children relationships (parent -> child)
CREATE TABLE menus_items_children (
  id_menu_item INT NOT NULL,
  id_child     INT NOT NULL,
  orden        INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id_menu_item, id_child),
  CONSTRAINT fk_mic_parent FOREIGN KEY (id_menu_item) REFERENCES menus_items(id_menu_item) ON DELETE CASCADE,
  CONSTRAINT fk_mic_child  FOREIGN KEY (id_child)     REFERENCES menus_items(id_menu_item) ON DELETE CASCADE,
  UNIQUE KEY uq_mic_parent_orden (id_menu_item, orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3) Role visibility pivot
CREATE TABLE roles_menu_items (
  id_rol              TINYINT  NOT NULL,
  id_menu_item        INT      NOT NULL,
  estado              TINYINT(1) NOT NULL DEFAULT 1,
  fecha_creacion      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_rol, id_menu_item),
  CONSTRAINT fk_rmi_role FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON DELETE CASCADE,
  CONSTRAINT fk_rmi_item FOREIGN KEY (id_menu_item) REFERENCES menus_items(id_menu_item) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4) Seed mirroring UI (dashboard/pages/utilities/other)
SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE roles_menu_items;
TRUNCATE TABLE menus_items_children;
TRUNCATE TABLE menus_items;
SET FOREIGN_KEY_CHECKS=1;

-- Root groups (ordered)
INSERT INTO menus_items (id_key, titulo, tipo, caption, icono, orden, estado) VALUES
('dashboard',           'Dashboard',      'group', NULL,           NULL,         1, 1),
('pages',               'Pages',          'group', 'Pages Caption','IconFiles',  2, 1),
('utilities',           'Utilities',      'group', NULL,           NULL,         3, 1),
('sample-docs-roadmap', NULL,             'group', NULL,           NULL,         4, 1);

-- Items (leaves)
INSERT INTO menus_items (id_key, titulo, tipo, url, icono, breadcrumbs, orden, estado) VALUES
('dashboard-default',   'Dashboard',   'item', '/dashboard/default', 'IconDashboard', 0, 1, 1),
('sample-page',         'Sample Page', 'item', '/sample-page',       'IconFiles',     0, 1, 1),
('sample-page-chrome',  'Sample Page', 'item', '/sample-page',       'IconBrandChrome', 0, 1, 1),
('util-typography',     'Typography',  'item', '/typography',        'IconTypography',0, 1, 1),
('util-color',          'Color',       'item', '/color',             'IconPalette',   0, 2, 1),
('util-shadow',         'Shadow',      'item', '/shadow',            'IconShadow',    0, 3, 1),
('documentation',       'Documentation','item','https://codedthemes.gitbook.io/berry/','IconHelp',1, 2, 1);

-- Parent -> children ordering
-- dashboard -> dashboard-default
INSERT INTO menus_items_children (id_menu_item, id_child, orden)
SELECT p.id_menu_item, c.id_menu_item, 1
FROM menus_items p, menus_items c
WHERE p.id_key='dashboard' AND c.id_key='dashboard-default';

-- pages -> sample-page
INSERT INTO menus_items_children (id_menu_item, id_child, orden)
SELECT p.id_menu_item, c.id_menu_item, 1
FROM menus_items p, menus_items c
WHERE p.id_key='pages' AND c.id_key='sample-page';

-- utilities -> typography, color, shadow
INSERT INTO menus_items_children (id_menu_item, id_child, orden)
SELECT p.id_menu_item, c.id_menu_item, 1 FROM menus_items p, menus_items c
WHERE p.id_key='utilities' AND c.id_key='util-typography';

INSERT INTO menus_items_children (id_menu_item, id_child, orden)
SELECT p.id_menu_item, c.id_menu_item, 2 FROM menus_items p, menus_items c
WHERE p.id_key='utilities' AND c.id_key='util-color';

INSERT INTO menus_items_children (id_menu_item, id_child, orden)
SELECT p.id_menu_item, c.id_menu_item, 3 FROM menus_items p, menus_items c
WHERE p.id_key='utilities' AND c.id_key='util-shadow';

-- other (sample-docs-roadmap) -> sample-page-chrome, documentation
INSERT INTO menus_items_children (id_menu_item, id_child, orden)
SELECT p.id_menu_item, c.id_menu_item, 1
FROM menus_items p, menus_items c
WHERE p.id_key='sample-docs-roadmap' AND c.id_key='sample-page-chrome';

INSERT INTO menus_items_children (id_menu_item, id_child, orden)
SELECT p.id_menu_item, c.id_menu_item, 2
FROM menus_items p, menus_items c
WHERE p.id_key='sample-docs-roadmap' AND c.id_key='documentation';

-- 5) Example role visibility (assumes roles: 1=Super Admin, 4=Usuario)
-- Super Admin sees all
INSERT INTO roles_menu_items (id_rol, id_menu_item)
SELECT 1, id_menu_item FROM menus_items WHERE estado=1;

-- Basic user: dashboard + pages/sample-page (and their parent groups)
INSERT INTO roles_menu_items (id_rol, id_menu_item)
SELECT 4, id_menu_item FROM menus_items WHERE id_key IN ('dashboard','dashboard-default','pages','sample-page');

-- Optional: allow user to see "Other" section too
-- INSERT INTO roles_menu_items (id_rol, id_menu_item)
-- SELECT 4, id_menu_item FROM menus_items WHERE id_key IN ('sample-docs-roadmap','sample-page-chrome','documentation');

-- Done.