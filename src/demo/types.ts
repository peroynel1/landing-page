export type DemoScreenId =
  | 'home'
  | 'salesWindow'
  | 'sales'
  | 'quote'
  | 'catalog'
  | 'contacts';

export type StatusTone = 'good' | 'warn' | 'bad' | 'muted';

export type DemoData = {
  profile: {
    business_name: string;
    display_name: string;
    currency: string;
    vat_registered: boolean;
    vat_rate_percent: number;
    city: string;
    avatar: string;
  };
  products: Array<{
    id: string;
    name: string;
    image: string;
    price_cents?: number;
    cost_cents?: number;
    stock?: number;
    low_stock?: boolean;
    variations?: Array<{
      name: string;
      price_cents: number;
      cost_cents: number;
      stock: number;
      image: string;
    }>;
  }>;
  contacts: Array<{
    name: string;
    phone: string;
    address: string;
    ship: boolean;
  }>;
  quotes: Array<{
    number: string;
    status: string;
    contact: string;
  }>;
  status_labels: Record<string, string>;
  ui: {
    home: {
      greeting: string;
      period_label: string;
      date_range: string;
      metric: string;
      net_cashflow_cents: number;
      trend_label: string;
      income_cents: number;
      expenses_cents: number;
      awaiting_cents: number;
      completed_quotes: string;
      awaiting_payment_count: number;
      activity: Array<{
        title: string;
        sub: string;
        badge: string;
        tone: StatusTone;
      }>;
    };
    sales_window: {
      period_label: string;
      date_range: string;
      sold_units: number;
      paid_quotes: number;
      sold_cents: number;
      margin_cents: number;
      expenses_cents: number;
      net_profit_cents: number;
      group_label: string;
      products: Array<{
        name: string;
        units: number;
        sold_cents: number;
        margin_cents: number;
        bar: number;
      }>;
    };
    catalog_order: string[];
    catalog_skus: Record<string, string>;
    quotes_list: Array<{
      number: string;
      status: string;
      status_label: string;
      contact: string;
      total_cents: number;
      ship_meta: string;
    }>;
    quote_detail: {
      number: string;
      status_label: string;
      status_age: string;
      contact: string;
      phone: string;
      address: string;
      subtotal_cents: number;
      vat_cents: number;
      shipping_cents: number;
      total_cents: number;
      sent_caption: string;
    };
  };
};
