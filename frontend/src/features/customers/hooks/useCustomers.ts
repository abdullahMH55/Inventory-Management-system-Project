import { useQuery } from '@tanstack/react-query';
import { qk } from '@/shared/api/query-keys';
import { customersApi } from '../api/customers.api';

export function useCustomers() {
  return useQuery({ queryKey: qk.customers.list(), queryFn: customersApi.list });
}
