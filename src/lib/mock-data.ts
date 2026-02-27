/**
 * Dados mock centralizados para testes e apresentação.
 * Garantias com mix de status: ativas, vencendo, expiradas.
 * Algumas com card_brand para exibir benefícios na UI.
 */

/**
 * Garantias para apresentação: mix de status e categorias
 * - baseDate(n) = n dias atrás
 * - Para 12 meses vencendo em ~15 dias: compra há 345 dias
 * - Para 24 meses expirada: compra há 800 dias
 * - Para 24 meses ativa: compra há 180 dias
 */
export function buildMockWarranties(
  userId: string,
  baseDate: (daysAgo: number) => string
): Array<Record<string, unknown>> {
  return [
    {
      user_id: userId,
      name: 'Notebook Dell Inspiron 15 3000',
      category: 'Informática',
      purchase_date: baseDate(180),
      warranty_months: 24,
      store: 'Magazine Luiza',
      price: 3499.9,
      estimated_sale_value: 2899,
      notes: 'Compra Black Friday. Inclui mouse e mochila.',
      serial_number: 'DL123456789BR',
      total_saved: 0,
      invoice_url: null,
      folder: 'Pessoal',
      maintenance_frequency_months: 6,
      last_maintenance_date: baseDate(30),
      card_brand: 'Visa Platinum',
    },
    {
      user_id: userId,
      name: 'iPhone 14 Pro 128GB',
      category: 'Celulares',
      purchase_date: baseDate(350),
      warranty_months: 12,
      store: 'Apple Store',
      price: 7499,
      estimated_sale_value: 6499,
      notes: 'Apple Care+ até dez/2025.',
      serial_number: 'DNQP12ABC34',
      total_saved: 150,
      invoice_url: null,
      folder: 'Pessoal',
      maintenance_frequency_months: 12,
      last_maintenance_date: baseDate(90),
      card_brand: 'Mastercard Black',
    },
    {
      user_id: userId,
      name: 'Geladeira Brastemp Frost Free',
      category: 'Eletrodomésticos',
      purchase_date: baseDate(400),
      warranty_months: 36,
      store: 'Casas Bahia',
      price: 2899,
      estimated_sale_value: 2199,
      notes: 'Instalação incluída. Porta reversível.',
      serial_number: 'BRF2023123456',
      total_saved: 0,
      invoice_url: null,
      folder: 'Casa',
      maintenance_frequency_months: 12,
      last_maintenance_date: baseDate(180),
      card_brand: null,
    },
    {
      user_id: userId,
      name: 'Smart TV Samsung 55" QLED',
      category: 'TV e Vídeo',
      purchase_date: baseDate(335),
      warranty_months: 12,
      store: 'Americanas',
      price: 4299,
      estimated_sale_value: 3899,
      notes: 'Garantia estendida 2 anos na loja.',
      serial_number: 'SN55Q70T2024',
      total_saved: 0,
      invoice_url: null,
      folder: 'Pessoal',
      maintenance_frequency_months: 6,
      last_maintenance_date: baseDate(20),
      card_brand: null,
    },
    {
      user_id: userId,
      name: 'Furadeira Bosch GSB 21-2 RCT',
      category: 'Ferramentas',
      purchase_date: baseDate(30),
      warranty_months: 24,
      store: 'Leroy Merlin',
      price: 599.9,
      estimated_sale_value: 549.9,
      notes: 'Kit com maleta e acessórios.',
      serial_number: 'BOS2024XYZ789',
      total_saved: 0,
      invoice_url: null,
      folder: 'Oficina',
      maintenance_frequency_months: 24,
      last_maintenance_date: null,
      card_brand: 'Elo Gold',
    },
    {
      user_id: userId,
      name: 'Fone de Ouvido Sony WH-1000XM5',
      category: 'Eletrônicos',
      purchase_date: baseDate(420),
      warranty_months: 12,
      store: 'Amazon',
      price: 1999,
      estimated_sale_value: 1699,
      notes: '',
      serial_number: null,
      total_saved: 0,
      invoice_url: null,
      folder: 'Pessoal',
      maintenance_frequency_months: null,
      last_maintenance_date: null,
      card_brand: null,
    },
  ];
}
