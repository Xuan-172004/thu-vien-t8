export const customAntdTheme = {
  token: {
    colorPrimary: '#ea580c', // Warm Orange / Amber primary
    colorLink: '#ea580c',
    colorSuccess: '#16a34a',
    colorWarning: '#f59e0b',
    colorError: '#dc2626',
    colorInfo: '#0284c7',
    borderRadius: 10,
    borderRadiusLG: 14,
    borderRadiusSM: 6,
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 14,
    colorBgBase: '#ffffff',
    colorTextBase: '#1c1917',
    colorBorder: '#e7e5e4',
    controlHeight: 40,
  },
  components: {
    Button: {
      colorPrimary: '#ea580c',
      colorPrimaryHover: '#c2410c',
      colorPrimaryActive: '#9a3412',
      borderRadius: 8,
      fontWeight: 600,
      paddingInline: 20,
    },
    Input: {
      activeBorderColor: '#ea580c',
      hoverBorderColor: '#fb923c',
      borderRadius: 8,
    },
    Select: {
      colorPrimary: '#ea580c',
      colorPrimaryHover: '#fb923c',
      borderRadius: 8,
    },
    Badge: {
      colorError: '#ea580c',
    },
    Tag: {
      borderRadius: 6,
      fontSize: 12,
    },
    Tabs: {
      itemColor: '#78716c',
      itemSelectedColor: '#ea580c',
      itemHoverColor: '#ea580c',
      inkBarColor: '#ea580c',
    },
    Card: {
      borderRadiusLG: 16,
      paddingLG: 16,
    },
    Modal: {
      borderRadiusLG: 20,
    },
    Drawer: {
      borderRadiusLG: 20,
    }
  },
};
