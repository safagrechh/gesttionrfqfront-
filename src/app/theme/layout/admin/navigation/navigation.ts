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
    title: 'Overview',
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
      },
      {
        id: 'chat',
        title: 'Chat',
        type: 'item',
        url: '/chat',
        icon: 'feather icon-message-circle',
        classes: 'nav-item'
      }
    ]
  },
  {
    id: 'rfq-manage',
    title: 'RFQs',
    type: 'group',
    icon: 'icon-ui',
    children: [
      {
        id: 'create-rfq',
        title: 'New RFQ',
        type: 'item',
        url: '/rfq-manage/create-rfq',
        icon: 'feather icon-file-plus',
        classes: 'nav-item'
      },
      {
        id: 'get-rfqs',
        title: 'All RFQs',
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
    title: 'Users',
    type: 'group',
    icon: 'icon-users',
    children: [
      {
        id: 'manage-user',
        title: 'Manage Users',
        type: 'item',
        icon: 'feather icon-user-plus',
        url: '/user-manage',
        classes: 'nav-item'
      },
      {

            id: 'client-manage',
            title: 'Clients',
            type: 'item',
            url: '/client-manage',
            icon: 'feather icon-user-plus',
            classes: 'nav-item'
          }
         ,
      {
        id: 'material-leaders',
        title: 'Material/Test Leaders',
        type: 'item',
        url: '/worker-manage/material-leaders',
        icon: 'feather icon-users',
        classes: 'nav-item'
      },
      {
        id: 'market-segment',
        title: 'Market Segments',
        type: 'item',
        url: '/worker-manage/market-segment',
        icon: 'feather icon-grid',
        classes: 'nav-item'
      }
      ,
      {
        id: 'reclamation-manage',
        title: 'Reclamations',
        type: 'item',
        url: '/reclamation-manage',
        icon: 'feather icon-alert-triangle',
        classes: 'nav-item'
      }

    ]
  },
  {
    id: 'rapport-manage',
    title: 'Reports',
    type: 'group',
    icon: 'icon-ui',
    children: [
      {
        id: 'generate-report',
        title: 'Generate Reports',
        type: 'item',
        icon: 'feather icon-file-plus',
        url: '/report-manage/generer-rapport',
        classes: 'nav-item'
      },
      {
        id: 'reclame',
        title: 'Reclame',
        type: 'item',
        icon: 'feather icon-alert-triangle',
        classes: 'nav-item'
      }
    ]
  },
  {
    id: 'historique-manage',
    title: 'History',
    type: 'group',
    icon: 'icon-ui',
    children: [
      {
        id: 'historique-actions',
        title: 'Audit Log',
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
