import { addMonths, differenceInDays, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const calculateExpirationDate = (purchaseDate: string, months: number) => {
  return addMonths(parseISO(purchaseDate), months);
};

export const getDaysRemaining = (expirationDate: Date) => {
  return differenceInDays(expirationDate, new Date());
};

export const formatDate = (date: Date | string) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
};
