/**
 * Benefícios de cartão de crédito por bandeira/nível
 * Baseado em programas típicos: Visa, Mastercard, Elo
 */

export interface CardBenefit {
  label: string;
  extra_months: number;
  price_protection_days: number;
  purchase_protection_days: number;
  perks: string[];
}

export function getCardBenefits(cardBrand: string | null | undefined): CardBenefit | null {
  const brand = (cardBrand || '').toLowerCase().trim();
  if (!brand) return null;

  const benefits: CardBenefit = {
    label: brand,
    extra_months: 0,
    price_protection_days: 0,
    purchase_protection_days: 0,
    perks: [],
  };

  if (brand.includes('black') || brand.includes('infinite') || brand.includes('world')) {
    benefits.extra_months = 12;
    benefits.price_protection_days = 60;
    benefits.purchase_protection_days = 90;
    benefits.perks = [
      'Garantia estendida +12 meses',
      'Proteção de compra (90 dias)',
      'Proteção de preço (60 dias)',
    ];
  } else if (brand.includes('platinum') || brand.includes('signature')) {
    benefits.extra_months = 6;
    benefits.price_protection_days = 60;
    benefits.purchase_protection_days = 90;
    benefits.perks = [
      'Garantia estendida +6 meses',
      'Proteção de compra (90 dias)',
      'Proteção de preço (60 dias)',
    ];
  } else if (brand.includes('gold') || brand.includes('internacional')) {
    benefits.extra_months = 3;
    benefits.price_protection_days = 0;
    benefits.purchase_protection_days = 90;
    benefits.perks = ['Garantia estendida +3 meses'];
  } else if (brand.includes('visa') || brand.includes('master') || brand.includes('elo')) {
    benefits.perks = ['Verifique os benefícios com sua operadora'];
  }

  return benefits.perks.length > 0 ? benefits : null;
}

export function getPriceProtectionExpiry(
  purchaseDate: string,
  priceProtectionDays: number
): Date | null {
  if (priceProtectionDays <= 0) return null;
  const purchase = new Date(purchaseDate);
  const expiry = new Date(purchase);
  expiry.setDate(expiry.getDate() + priceProtectionDays);
  return expiry;
}

export function isPriceProtectionActive(
  purchaseDate: string,
  priceProtectionDays: number
): boolean {
  const expiry = getPriceProtectionExpiry(purchaseDate, priceProtectionDays);
  if (!expiry) return false;
  return new Date() <= expiry;
}

export function getDaysRemainingPriceProtection(
  purchaseDate: string,
  priceProtectionDays: number
): number {
  const expiry = getPriceProtectionExpiry(purchaseDate, priceProtectionDays);
  if (!expiry) return 0;
  const now = new Date();
  const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}
