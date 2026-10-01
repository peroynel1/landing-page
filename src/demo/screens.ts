import { zar, zarSigned } from './money.ts';
import type { DemoData, DemoScreenId } from './types.ts';

const IMG = '/demo/';

function imgSrc(path: string): string {
  if (!path) return '';
  if (path.startsWith('/')) return path;
  if (path.startsWith('images/')) return `${IMG}${path}`;
  return `${IMG}images/${path}`;
}

function feeCents(name: string | null | undefined, list: Array<{ name: string; price_cents: number }>) {
  if (!name) return 0;
  const f = list.find((x) => x.name === name);
  return f ? f.price_cents : 0;
}

function quoteTotals(q: DemoData['quotes'][number], data: DemoData) {
  const products = q.lines.reduce((s, l) => s + l.unit_cents * l.qty, 0);
  const pack = feeCents(q.packaging, data.packaging);
  const ship = feeCents(q.shipping, data.shipping);
  const sub = products + pack + ship;
  const vat = data.profile.vat_registered
    ? Math.round(sub * (data.profile.vat_rate_percent / 100))
    : 0;
  return { products, pack, ship, sub, vat, total: sub + vat };
}

function esc(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function statusBar(time = '12:40'): string {
  return `<div class="dm-status" aria-hidden="true">
    <span>${time}</span>
    <span class="dm-status-icons">5G · 100%</span>
  </div>`;
}

function tabBar(active: 'Home' | 'Sales' | 'Contacts' | 'Catalog'): string {
  const tabs: Array<{ id: typeof active; label: string; icon: string }> = [
    { id: 'Home', label: 'Home', icon: '⌂' },
    { id: 'Sales', label: 'Sales', icon: '▥' },
    { id: 'Contacts', label: 'Contacts', icon: '☺' },
    { id: 'Catalog', label: 'Catalog', icon: '▣' },
  ];
  return `<nav class="dm-tabs" aria-hidden="true">${tabs
    .map((t) => {
      const on = t.id === active;
      return `<span class="dm-tab${on ? ' on' : ''}"><span class="dm-tab-icon">${t.icon}</span>${
        on ? `<span class="dm-tab-label">${t.label}</span>` : ''
      }</span>`;
    })
    .join('')}</nav>`;
}

function chromeShell(opts: {
  title: string;
  activeTab: 'Home' | 'Sales' | 'Contacts' | 'Catalog';
  body: string;
  headerRight?: string;
  back?: string;
  time?: string;
}): string {
  const titleRow = opts.back
    ? `<div class="dm-title-row">
        <span class="dm-back">${esc(opts.back)}</span>
        <span class="dm-title-center">${esc(opts.title)}</span>
        <span class="dm-header-right">${opts.headerRight || ''}</span>
      </div>`
    : `<div class="dm-title-row">
        <h2 class="dm-title">${esc(opts.title)}</h2>
        <div class="dm-header-right">${opts.headerRight || ''}</div>
      </div>`;

  return `${statusBar(opts.time)}
    ${titleRow}
    <div class="dm-body">${opts.body}</div>
    ${tabBar(opts.activeTab)}`;
}

function productStock(p: DemoData['products'][number]): { count: number; low: boolean; label: string } {
  if (p.variations?.length) {
    const count = p.variations.reduce((s, v) => s + v.stock, 0);
    const low = count <= 10 || !!p.low_stock;
    return {
      count,
      low,
      label: `${p.variations.length} variations · ${count} in stock`,
    };
  }
  const count = p.stock ?? 0;
  const low = !!p.low_stock || count <= 10;
  return { count, low, label: `${count} in stock` };
}

function productPrice(p: DemoData['products'][number]): { retail: string; cost: string } {
  if (p.variations?.length) {
    const prices = p.variations.map((v) => v.price_cents);
    const costs = p.variations.map((v) => v.cost_cents);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const costMin = Math.min(...costs);
    return {
      retail: min === max ? zar(min) : `${zar(min)} – ${zar(max)}`,
      cost: `Cost ${zar(costMin)}`,
    };
  }
  return {
    retail: zar(p.price_cents || 0),
    cost: `Cost ${zar(p.cost_cents || 0)}`,
  };
}

function renderHome(data: DemoData): string {
  const h = data.ui.home;
  return `${statusBar('12:40')}
    <div class="dm-body">
      <div class="dm-greet">
        <div>
          <div class="dm-eyebrow">${esc(h.greeting)}</div>
          <div class="dm-display-name">${esc(data.profile.display_name)}</div>
        </div>
        <img class="dm-avatar" src="${imgSrc(data.profile.avatar)}" alt="" width="44" height="44" />
      </div>
      <div class="dm-pills">
        <span class="dm-pill">${esc(h.metric)} ▾</span>
        <span class="dm-pill">${esc(h.period_label)} ▾</span>
      </div>
      <div class="dm-date">${esc(h.date_range)}</div>
      <div class="dm-hero-amount">${zar(h.net_cashflow_cents)}</div>
      <div class="dm-trend">↑ ${esc(h.trend_label)}</div>
      <div class="dm-stat-row">
        <div><div class="dm-k">Income</div><div class="dm-v good">${zar(h.income_cents)}</div></div>
        <div><div class="dm-k">Expenses</div><div class="dm-v bad">${zar(h.expenses_cents)}</div></div>
        <div><div class="dm-k">Awaiting</div><div class="dm-v warn">${zar(h.awaiting_cents)}</div></div>
      </div>
      <div class="dm-two">
        <div class="dm-card">
          <div class="dm-k">Completed quotes</div>
          <div class="dm-big">${esc(h.completed_quotes)}</div>
          <div class="dm-foot good">Completed · ${esc(h.period_label)}</div>
        </div>
        <div class="dm-card">
          <div class="dm-k">Awaiting payment</div>
          <div class="dm-big">${h.awaiting_payment_count}</div>
          <div class="dm-foot warn">Pending</div>
        </div>
      </div>
      <div class="dm-section-label">Quick actions</div>
      <div class="dm-actions">
        <div class="dm-action"><span class="dm-action-ico">▥</span><span>Add expense</span></div>
        <div class="dm-action"><span class="dm-action-ico">▥</span><span>Sales window</span></div>
        <div class="dm-action"><span class="dm-action-ico">☰</span><span>Reports</span></div>
      </div>
      <div class="dm-section-label">Recent activity</div>
      <div class="dm-list">
        ${h.activity
          .map(
            (a) => `<div class="dm-row">
            <div class="dm-meta">
              <div class="dm-name">${esc(a.title)}</div>
              <div class="dm-sub">${esc(a.sub)}</div>
            </div>
            <span class="dm-badge ${a.tone}">${esc(a.badge)}</span>
          </div>`
          )
          .join('')}
      </div>
    </div>
    ${tabBar('Home')}`;
}

function renderSalesWindow(data: DemoData): string {
  const s = data.ui.sales_window;
  const body = `
    <div class="dm-card dm-summary">
      <div class="dm-k">Sold units</div>
      <div class="dm-hero-amount sm">${s.sold_units}</div>
      <div class="dm-sub">Products from ${s.paid_quotes} paid quotes</div>
      <div class="dm-summary-meta">
        <span>${esc(s.date_range)}</span>
        <span class="dm-pill sm">${esc(s.period_label)} ▾</span>
      </div>
      <div class="dm-grid-2">
        <div><div class="dm-k">Sold</div><div class="dm-v">${zar(s.sold_cents)}</div></div>
        <div><div class="dm-k">Margin</div><div class="dm-v">${zar(s.margin_cents)}</div></div>
        <div><div class="dm-k">Business expenses</div><div class="dm-v">${zarSigned(-s.expenses_cents)}</div></div>
        <div><div class="dm-k">Net profit</div><div class="dm-v good">${zar(s.net_profit_cents)}</div></div>
      </div>
    </div>
    <div class="dm-seg">
      <span class="on">Products</span><span>Packaging</span><span>Shipping</span>
    </div>
    <div class="dm-pills">
      <span class="dm-pill">Month ▾</span>
      <span class="dm-pill">Units sold ▾</span>
    </div>
    <div class="dm-card">
      <div class="dm-name">${esc(s.group_label)}</div>
      <div class="dm-sub">${s.paid_quotes} paid quotes · Net profit ${zar(s.net_profit_cents)} · After ${zar(s.expenses_cents)} expenses</div>
      <div class="dm-list tight">
        ${s.products
          .map(
            (p) => `<div class="dm-sold-row">
            <div class="dm-sold-top">
              <span class="dm-name">${esc(p.name)}</span>
              <span class="dm-units">${p.units}</span>
            </div>
            <div class="dm-sold-money">
              <span>Sold ${zar(p.sold_cents)}</span>
              <span>Margin ${zar(p.margin_cents)}</span>
            </div>
            <div class="dm-bar"><i style="width:${p.bar}%"></i></div>
          </div>`
          )
          .join('')}
      </div>
    </div>`;

  return chromeShell({
    title: 'Sales window',
    activeTab: 'Sales',
    back: '‹',
    body,
    time: '12:41',
  });
}

function renderSales(data: DemoData): string {
  const body = `
    <div class="dm-pills">
      <span class="dm-pill">All statuses ▾</span>
      <span class="dm-pill">Newest ▾</span>
    </div>
    <div class="dm-list">
      ${data.quotes
        .map((q) => {
          const t = quoteTotals(q, data);
          const tone =
            q.status === 'shipped'
              ? 'good'
              : q.status === 'pending' || q.status === 'to_pack'
                ? 'warn'
                : q.status === 'draft'
                  ? 'muted'
                  : 'good';
          return `<div class="dm-row card">
            <div class="dm-meta">
              <div class="dm-name">${esc(q.number)} · ${esc(q.contact)}</div>
              <div class="dm-sub"><span class="dm-badge ${tone}">${esc(
                data.status_labels[q.status] || q.status
              )}</span> ${esc(q.note || '')}</div>
            </div>
            <div class="dm-right">${zar(t.total)}</div>
          </div>`;
        })
        .join('')}
    </div>`;

  return chromeShell({
    title: 'Sales',
    activeTab: 'Sales',
    headerRight: '<span class="dm-add">+ Add</span>',
    body,
  });
}

function renderQuote(data: DemoData): string {
  const q =
    data.quotes.find((x) => x.number === data.ui.quote_number) ||
    data.quotes.find((x) => x.status === 'pending') ||
    data.quotes[0];
  const contact = data.contacts.find((c) => c.name === q.contact);
  const t = quoteTotals(q, data);
  const body = `
    <div class="dm-card accent-bad">
      <div class="dm-k">Quote status</div>
      <div class="dm-name">Pending (1 day)</div>
      <div class="dm-stack-btns">
        <button type="button" class="dm-outline good">To Pack</button>
        <button type="button" class="dm-outline warn">Revert to Draft</button>
        <button type="button" class="dm-outline bad">Cancel quote</button>
      </div>
    </div>
    <button type="button" class="dm-wide">Import order text</button>
    <div class="dm-section-label">Customer</div>
    <div class="dm-card row-between">
      <div>
        <div class="dm-name">${esc(q.contact)}</div>
        <div class="dm-sub">${esc(contact?.phone || '')}</div>
        <div class="dm-sub">${esc(contact?.address || '')}</div>
      </div>
      <span class="dm-chevron">›</span>
    </div>
    <div class="dm-totals">
      <div><span>Subtotal (excl. VAT)</span><span>${zar(t.sub)}</span></div>
      <div><span>VAT (${data.profile.vat_rate_percent}%)</span><span>${zar(t.vat)}</span></div>
      <div><span>Shipping</span><span>${zar(t.ship)}</span></div>
      <div class="grand"><span>Total</span><span>${zar(t.total)}</span></div>
    </div>
    <div class="dm-two-btns">
      <button type="button" class="dm-wide">Save</button>
      <button type="button" class="dm-wide">Send</button>
    </div>
    <button type="button" class="dm-wide outline">Send Reminder</button>
    <div class="dm-caption">Quote sent 0 days ago</div>`;

  return chromeShell({
    title: 'Sales',
    activeTab: 'Sales',
    back: '‹ Sales',
    headerRight: '<span class="dm-link">Duplicate</span> <span class="dm-link bad">Delete</span>',
    body,
  });
}

function renderCatalog(data: DemoData): string {
  const order = data.ui.catalog_order;
  const products = [...data.products].sort(
    (a, b) => order.indexOf(a.id) - order.indexOf(b.id)
  );
  const body = `
    <div class="dm-seg">
      <span class="on">Products</span><span>Packaging</span><span>Shipping</span>
    </div>
    <div class="dm-pills">
      <span class="dm-pill">Popular ▾</span>
      <span class="dm-pill on">List</span>
      <span class="dm-pill">Grid</span>
    </div>
    <div class="dm-section-label">Uncategorized · ${products.length}</div>
    <div class="dm-list">
      ${products
        .map((p) => {
          const stock = productStock(p);
          const price = productPrice(p);
          const sku = data.ui.catalog_skus[p.id] || p.id;
          const thumb = imgSrc(p.variations?.[0]?.image || p.image);
          return `<div class="dm-row card stock-${stock.low ? 'low' : 'ok'}">
            <img class="dm-thumb" src="${thumb}" alt="" width="52" height="52" />
            <div class="dm-meta">
              <div class="dm-name">${esc(p.name)}</div>
              <div class="dm-sub">${esc(sku)}</div>
              <div class="dm-stock ${stock.low ? 'low' : 'ok'}">${
                p.variations?.length
                  ? esc(stock.label)
                  : `<span>${stock.low ? 'Low stock' : 'In stock'}</span><span>${stock.count} in stock</span>`
              }</div>
            </div>
            <div class="dm-right">
              <div>${price.retail}</div>
              <div class="dm-sub">${
                p.variations?.length ? `${p.variations.length} variations` : price.cost
              }</div>
            </div>
          </div>`;
        })
        .join('')}
    </div>`;

  return chromeShell({
    title: 'Catalog',
    activeTab: 'Catalog',
    headerRight: '<span class="dm-add">+ Add</span>',
    body,
    time: '15:51',
  });
}

function renderContacts(data: DemoData): string {
  const openByContact = new Map<string, { status: string; label: string }>();
  for (const q of data.quotes) {
    if (q.status === 'shipped' || q.status === 'cancelled') continue;
    openByContact.set(q.contact, {
      status: q.status,
      label: data.status_labels[q.status] || q.status,
    });
  }
  const shipped = new Set(
    data.quotes.filter((q) => q.status === 'shipped').map((q) => q.contact)
  );

  const body = `
    <div class="dm-search-row">
      <span class="dm-search">Search contacts...</span>
      <span class="dm-pill">Newest ▾</span>
    </div>
    <div class="dm-list">
      ${data.contacts
        .map((c) => {
          const open = openByContact.get(c.name);
          const loc = c.ship ? 'Cape Town local' : 'Collection';
          // Prefer city-agnostic ship label like the screenshot for CT locals
          const locationLabel = c.ship
            ? c.address.includes('Cape Town') || c.address.includes('Stellenbosch')
              ? 'Cape Town local'
              : loc
            : 'Collection';
          const footer = open
            ? `<div class="dm-row-footer warn-bar">
                <span class="warn">${esc(open.label)}</span>
                <span>1 open quote</span>
              </div>`
            : shipped.has(c.name)
              ? `<div class="dm-row-footer"><span class="dm-sub">1 successful quote</span></div>`
              : '';
          return `<div class="dm-row card${open ? ' accent-warn' : ''}">
            <div class="dm-meta grow">
              <div class="dm-name">${esc(c.name)}</div>
              <div class="dm-sub">${esc(locationLabel)}</div>
              <div class="dm-sub">${esc(c.phone)}</div>
              ${footer}
            </div>
          </div>`;
        })
        .join('')}
    </div>`;

  return chromeShell({
    title: 'Contacts',
    activeTab: 'Contacts',
    headerRight: '<span class="dm-add">+ Add</span>',
    body,
  });
}

const RENDERERS: Record<DemoScreenId, (data: DemoData) => string> = {
  home: renderHome,
  salesWindow: renderSalesWindow,
  sales: renderSales,
  quote: renderQuote,
  catalog: renderCatalog,
  contacts: renderContacts,
};

export function renderDemoScreen(id: DemoScreenId, data: DemoData): string {
  return RENDERERS[id](data);
}

export const DEMO_SCREEN_IDS: DemoScreenId[] = [
  'home',
  'salesWindow',
  'sales',
  'quote',
  'catalog',
  'contacts',
];
