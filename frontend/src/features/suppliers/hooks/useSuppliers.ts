import { useQuery } from '@tanstack/react-query';
import { qk } from '@/shared/api/query-keys';
import { suppliersApi } from '../api/suppliers.api';

export function useSuppliers() {
  return useQuery({ queryKey: qk.suppliers.list(), queryFn: suppliersApi.list });
}
