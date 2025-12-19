export interface IFooterItems {
    title: string;
    items: {
      title: string;
      link: string;
      isExternal?: boolean;
    }[]
  }