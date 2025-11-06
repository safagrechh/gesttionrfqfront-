export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;

  children?: NavigationItem[];
}
export const NavigationItems: NavigationItem[] = [

  {
    id: 'navigation',
    title: 'Navigation',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'item',
        url: '/dashboard',
        icon: 'feather icon-home',
        classes: 'nav-item'
      }
    ]
  },
  {
    id: 'rfq-manage',
    title: 'RFQ Management',
    type: 'group',
    icon: 'icon-ui',
    children: [
      {
        id: 'create-rfq',
        title: 'Create RFQ',
        type: 'item',
        url: '/rfq-manage/create-rfq',
        icon: 'feather icon-file-plus',
        classes: 'nav-item'
      },
      {
        id: 'get-rfqs',
        title: 'View RFQs',
        type: 'item',
        url: '/rfq-manage/get-rfqs',
        icon: 'feather icon-list',
        classes: 'nav-item'
      },
      {
        id: 'assigned-rfqs',
        title: 'Assigned RFQs',
        type: 'item',
        url: '/rfq-manage/assigned-rfqs',
        icon: 'feather icon-clipboard',
        classes: 'nav-item'
      }
    ]
  },
  {
    id: 'user-manage',
    title: 'User Management',
    type: 'group',
    icon: 'icon-users',
    children: [
      {
        id: 'user-form',
        title: 'Manage User',
        type: 'collapse',
        icon: 'feather icon-user-plus',
        children: [
          {
            id: 'create-user',
            title: 'Ajouter User',
            type: 'item',
            url: '/user-manage/user-form',

            classes: 'nav-item'
          },
          {
            id: 'get-users',
            title: 'Consulter users ',
            type: 'item',
            url: '/user-manage/get-users',

            classes: 'nav-item'
          }

        ]

      },
      {

            id: 'client-manage',
            title: 'Gestion des Clients',
            type: 'item',
            url: '/client-manage',
            icon: 'feather icon-user-plus',
            classes: 'nav-item'
          }
         ,
      {
        id: 'worker-form',
        title: 'Gestion des Workers',
        type: 'collapse',
        icon: 'feather icon-user-plus',
        children: [
          {
            id: 'create-Material-Leader',
            title: 'Material/Test Leaders',
            type: 'item',
            url: '/worker-manage/material-leaders',

            classes: 'nav-item'
          },
          {
            id: 'create-market-segment',
            title: 'Gestion des Market Segments',
            type: 'item',
            url: '/worker-manage/market-segment',

            classes: 'nav-item'
          }

        ]

      }

    ]
  },
  {
    id: 'rapport-manage',
    title: 'Rapport',
    type: 'group',
    icon: 'icon-ui',
    children: [
      {
        id: 'generate-report',
        title: 'Générer Rapport',
        type: 'item',
        icon: 'feather icon-file-plus',
        url: '/report-manage/generer-rapport',
        classes: 'nav-item'
      }
    ]
  },
  {
    id: 'historique-manage',
    title: 'Historique Management',
    type: 'group',
    icon: 'icon-ui',
    children: [
      {
        id: 'historique-actions',
        title: 'Historique Actions',
        type: 'item',
        icon: 'feather icon-file-plus',
        url: '/historique-manage/historique-actions',
        classes: 'nav-item'
      }
    ]
  },
  // {
  //   id: 'ui-element',
  //   title: 'UI ELEMENT',
  //   type: 'group',
  //   icon: 'icon-ui',
  //   children: [
  //     {
  //       id: 'basic',
  //       title: 'Component',
  //       type: 'collapse',
  //       icon: 'feather icon-box',
  //       children: [
  //         {
  //           id: 'button',
  //           title: 'Button',
  //           type: 'item',
  //           url: '/basic/button'
  //         },
  //         {
  //           id: 'badges',
  //           title: 'Badges',
  //           type: 'item',
  //           url: '/basic/badges'
  //         },
  //         {
  //           id: 'breadcrumb-pagination',
  //           title: 'Breadcrumb & Pagination',
  //           type: 'item',
  //           url: '/basic/breadcrumb-paging'
  //         },
  //         {
  //           id: 'collapse',
  //           title: 'Collapse',
  //           type: 'item',
  //           url: '/basic/collapse'
  //         },
  //         {
  //           id: 'tabs-pills',
  //           title: 'Tabs & Pills',
  //           type: 'item',
  //           url: '/basic/tabs-pills'
  //         },
  //         {
  //           id: 'typography',
  //           title: 'Typography',
  //           type: 'item',
  //           url: '/basic/typography'
  //         }
  //       ]
  //     }
  //   ]
  // },
  // {
  //   id: 'forms',
  //   title: 'Forms & Tables',
  //   type: 'group',
  //   icon: 'icon-group',
  //   children: [
  //     {
  //       id: 'forms-element',
  //       title: 'Form Elements',
  //       type: 'item',
  //       url: '/forms/basic',
  //       classes: 'nav-item',
  //       icon: 'feather icon-file-text'
  //     },
  //     {
  //       id: 'tables',
  //       title: 'Tables',
  //       type: 'item',
  //       url: '/tables/bootstrap',
  //       classes: 'nav-item',
  //       icon: 'feather icon-server'
  //     }
  //   ]
  // },
  // {
  //   id: 'chart-maps',
  //   title: 'Chart',
  //   type: 'group',
  //   icon: 'icon-charts',
  //   children: [
  //     {
  //       id: 'apexChart',
  //       title: 'ApexChart',
  //       type: 'item',
  //       url: 'apexchart',
  //       classes: 'nav-item',
  //       icon: 'feather icon-pie-chart'
  //     }
  //   ]
  // },
  // {
  //   id: 'pages',
  //   title: 'Pages',
  //   type: 'group',
  //   icon: 'icon-pages',
  //   children: [
  //     {
  //       id: 'auth',
  //       title: 'Authentication',
  //       type: 'collapse',
  //       icon: 'feather icon-lock',
  //       children: [
  //         // {
  //         //   id: 'signup',
  //         //   title: 'Sign up',
  //         //   type: 'item',
  //         //   url: '/auth/signup',
  //         //   target: true,
  //         //   breadcrumbs: false
  //         // },
  //         {
  //           id: 'signin',
  //           title: 'Sign in',
  //           type: 'item',
  //           url: '/auth/signin',
  //           target: true,
  //           breadcrumbs: false
  //         }
  //       ]
  //     //
  //      }

  //   ]
  // }

];
