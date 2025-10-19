// assets
import { IconFiles } from '@tabler/icons-react';

// constant
const icons = {
  IconFiles
};

// ==============================|| PAGES MENU ITEMS ||============================== //

const pages = {
  id: 'pages',
  title: 'Pages',
  caption: 'Pages Caption',
  icon: icons.IconFiles,
  type: 'group',
  children: [
    {
      id: 'sample-page',
      title: 'Sample Page',
      type: 'item',
      url: '/sample-page',
      icon: icons.IconFiles,
      breadcrumbs: false
    }
  ]
};

export default pages;
