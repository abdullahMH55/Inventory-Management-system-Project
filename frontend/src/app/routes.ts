export const ROUTES = {
  dashboard: '/',
  login: '/login',
  register: '/register',
  products: '/products',
  categories: '/categories',
  sales: '/sales',
  salesNew: '/sales/new',
  saleEdit: (id: number | string) => `/sales/${id}/edit`,
  purchases: '/purchases',
  customers: '/customers',
  suppliers: '/suppliers',
} as const;
