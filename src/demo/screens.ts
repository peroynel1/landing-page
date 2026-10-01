import { zar, zarSigned } from './money.ts';
import type { DemoData, DemoScreenId, StatusTone } from './types.ts';

const IMG = '/demo/';

function imgSrc(path: string): string {
  if (!path) return '';
  if (path.startsWith('/')) return path;
  if (path.startsWith('images/')) return `${IMG}${path}`;
  return `${IMG}images/${path}`;
}

function esc(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function toneForStatus(status: string): StatusTone {
  switch (status) {
    case 'shipped':
      return 'good';
    case 'pending':
      return 'bad';
    case 'to_pack':
    case 'packed':
      return 'warn';
    default:
      return 'muted';
  }
}

/** Inline SVG icons matching app tab / chrome roles (stroke currentColor). */
const ICO = {
  home: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z"/></svg>`,
  sales: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 19V10M12 19V5M19 19v-7"/></svg>`,
  contacts: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M16 19v-1a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v1"/><circle cx="10" cy="8" r="3"/><path d="M20 19v-1a3 3 0 0 0-2.2-2.9M15.5 5.2a3 3 0 0 1 0 5.6"/></svg>`,
  catalog: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.3 7 12 12l8.7-5M12 22V12"/></svg>`,
  search: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="6"/><path d="m20 20-3.5-3.5"/></svg>`,
  sort: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 6v12M8 6l-2.5 2.5M8 6l2.5 2.5M16 18V6M16 18l-2.5-2.5M16 18l2.5-2.5"/></svg>`,
  filter: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6h16M7 12h10M10 18h4"/></svg>`,
  chevron: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m9 6 6 6-6 6"/></svg>`,
  back: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 6 9 12l6 6"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 17h2"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>`,
  list: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01"/></svg>`,
  grid: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/></svg>`,
  layers: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m12 4 8 4-8 4-8-4 8-4z"/><path d="m4 12 8 4 8-4M4 16l8 4 8-4"/></svg>`,
  folder: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>`,
  gear: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M4.2 6.2l1.4 1.4M18.4 16.4l1.4 1.4M3 12h2M19 12h2M4.2 17.8l1.4-1.4M18.4 7.6l1.4-1.4"/></svg>`,
  clipboard: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="7" y="5" width="10" height="15" rx="2"/><path d="M9 5V4h6v1"/><path d="M10 11h4M10 15h4"/></svg>`,
  wa: `<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 3a8.5 8.5 0 0 0-7.4 12.7L3.5 20.5l4.9-1.3A8.5 8.5 0 1 0 12 3zm4.7 12.1c-.2.6-1.2 1.1-1.7 1.2-.4.1-.9.2-2.9-.6-2.4-1-4-3.6-4.1-3.8-.1-.2-1-1.3-1-2.5s.6-1.8.9-2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.4.2.5.7 1.8.8 1.9.1.2.1.3 0 .5l-.3.5c-.1.2-.3.3-.1.6.1.3.6 1 .1.4 1.6.7 1.6.5 1.8.5.2 0 .3 0 .4-.1.1-.1.5-.6.6-.8.1-.2.3-.2.5-.1l1.4.7c.2.1.3.1.4.2.1.2.1.5-.1 1.1z"/></svg>`,
};

function statusBar(time = '12:40'): string {
  return `<div class="dm-status" aria-hidden="true"><span>${time}</span><span class="dm-status-right">5G · 100%</span></div>`;
}

function tabBar(active: 'Home' | 'Sales' | 'Contacts' | 'Catalog'): string {
  const tabs: Array<{ id: typeof active; label: string; icon: string }> = [
    { id: 'Home', label: 'Home', icon: ICO.home },
    { id: 'Sales', label: 'Sales', icon: ICO.sales },
    { id: 'Contacts', label: 'Contacts', icon: ICO.contacts },
    { id: 'Catalog', label: 'Catalog', icon: ICO.catalog },
  ];
  return `<nav class="dm-tabs" aria-hidden="true">${tabs
    .map((t) => {
      const on = t.id === active;
      return `<span class="dm-tab${on ? ' on' : ''}">${t.icon}${
        on ? `<span class="dm-tab-label">${t.label}</span>` : ''
      }</span>`;
    })
    .join('')}</nav>`;
}

function titleBar(opts: {
  title: string;
  right?: string;
  back?: boolean;
}): string {
  if (opts.back) {
    return `<div class="dm-title-row back">
      <span class="dm-icon-btn">${ICO.back}</span>
      <span class="dm-title-center">${esc(opts.title)}</span>
      <div class="dm-header-right">${opts.right || ''}</div>
    </div>`;
  }
  return `<div class="dm-title-row">
    <h2 class="dm-title">${esc(opts.title)}</h2>
    <div class="dm-header-right">${opts.right || ''}</div>
  </div>`;
}

function shell(opts: {
  activeTab: 'Home' | 'Sales' | 'Contacts' | 'Catalog';
  body: string;
  title?: string;
  right?: string;
  back?: boolean;
  time?: string;
  hideTitle?: boolean;
}): string {
  const head = opts.hideTitle
    ? ''
    : titleBar({ title: opts.title || '', right: opts.right, back: opts.back });
  return `${statusBar(opts.time)}${head}<div class="dm-scroll">${opts.body}</div>${tabBar(opts.activeTab)}`;
}

function locationLabel(c: DemoData['contacts'][number]): string {
  if (!c.ship) return 'Collection';
  if (c.address.includes('Cape Town') || c.address.includes('Stellenbosch')) {
    return 'Cape Town local';
  }
  return 'Courier';
}

function productStock(
  p: DemoData['products'][number],
  data: DemoData
): { tone: StatusTone; left: string; right: string } {
  const overlay = data.ui.catalog_stock?.[p.id];
  if (overlay) return overlay;
  if (p.variations?.length) {
    const count = p.variations.reduce((s, v) => s + v.stock, 0);
    const low = count <= 10 || !!p.low_stock;
    const out = count < 1;
    return {
      tone: out ? 'bad' : low ? 'warn' : 'good',
      left: out ? 'Out of stock' : low ? 'Low stock' : 'In stock',
      right: `${p.variations.length} variations · ${count} in stock`,
    };
  }
  const count = p.stock ?? 0;
  const low = !!p.low_stock || count <= 10;
  const out = count < 1;
  return {
    tone: out ? 'bad' : low ? 'warn' : 'good',
    left: out ? 'Out of stock' : low ? 'Low stock' : 'In stock',
    right: `${count} in stock`,
  };
}

function renderHome(data: DemoData): string {
  const h = data.ui.home;
  const body = `
    <div class="dm-greet">
      <div>
        <div class="dm-eyebrow">${esc(h.greeting)}</div>
        <div class="dm-display-name">${esc(data.profile.display_name)}</div>
      </div>
      <img class="dm-avatar" src="${imgSrc(data.profile.avatar)}" alt="" width="40" height="40" />
    </div>
    <div class="dm-pills">
      <button type="button" class="dm-pill">${esc(h.metric)} <span class="dm-caret">▾</span></button>
      <button type="button" class="dm-pill">${esc(h.period_label)} <span class="dm-caret">▾</span></button>
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
      <div class="dm-action"><span class="dm-action-ico">${ICO.clipboard}</span><span>Add expense</span></div>
      <div class="dm-action"><span class="dm-action-ico">${ICO.sales}</span><span>Sales window</span></div>
      <div class="dm-action"><span class="dm-action-ico">${ICO.list}</span><span>Reports</span></div>
    </div>
    <div class="dm-section-label">Recent activity</div>
    <div class="dm-activity">
      ${h.activity
        .map(
          (a) => `<div class="dm-activity-row">
          <span class="dm-activity-ico">${ICO.clipboard}</span>
          <div class="dm-meta">
            <div class="dm-name">${esc(a.title)}</div>
            <div class="dm-sub">${esc(a.sub)}</div>
          </div>
          <span class="dm-badge ${a.tone}">${esc(a.badge)}</span>
        </div>`
        )
        .join('')}
    </div>`;
  return shell({ activeTab: 'Home', body, hideTitle: true, time: '12:40' });
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
        <button type="button" class="dm-pill sm">${esc(s.period_label)} <span class="dm-caret">▾</span></button>
      </div>
      <div class="dm-grid-2">
        <div><div class="dm-k">Sold</div><div class="dm-v">${zar(s.sold_cents)}</div></div>
        <div><div class="dm-k">Margin</div><div class="dm-v">${zar(s.margin_cents)}</div></div>
        <div><div class="dm-k">Business expenses</div><div class="dm-v muted">${zarSigned(-s.expenses_cents)}</div></div>
        <div><div class="dm-k">Net profit</div><div class="dm-v good">${zar(s.net_profit_cents)}</div></div>
      </div>
    </div>
    <div class="dm-seg">
      <span class="on">Products</span><span>Packaging</span><span>Shipping</span>
    </div>
    <div class="dm-pills">
      <button type="button" class="dm-pill">${ICO.layers} Month <span class="dm-caret">▾</span></button>
      <button type="button" class="dm-pill">${ICO.sort} Units sold <span class="dm-caret">▾</span></button>
    </div>
    <div class="dm-card">
      <div class="dm-group-head">
        <span class="dm-name">${esc(s.group_label)}</span>
        <span class="dm-sub">${s.paid_quotes} paid quotes</span>
      </div>
      <div class="dm-group-sub">
        <span>Net profit ${zar(s.net_profit_cents)}</span>
        <span>After ${zar(s.expenses_cents)} expenses</span>
      </div>
      <div class="dm-section-label tight">Products</div>
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
    </div>`;
  return shell({
    activeTab: 'Sales',
    title: 'Sales window',
    back: true,
    body,
    time: '12:41',
  });
}

function renderSales(data: DemoData): string {
  const body = `
    <div class="dm-toolbar">
      <div class="dm-search">${ICO.search}<span>Search quotes...</span></div>
      <button type="button" class="dm-pill">${ICO.sort} Ship date <span class="dm-caret">▾</span></button>
      <button type="button" class="dm-icon-btn">${ICO.filter}</button>
    </div>
    <div class="dm-cards">
      ${data.ui.quotes_list
        .map((q) => {
          const tone = toneForStatus(q.status);
          return `<article class="dm-list-card tone-${tone}">
            <span class="dm-accent"></span>
            <div class="dm-list-body">
              <div class="dm-list-top">
                <span class="dm-muted-id">${esc(q.number)}</span>
                <span class="dm-price">${zar(q.total_cents)}</span>
              </div>
              <div class="dm-contact-name">${esc(q.contact)}</div>
            </div>
            <div class="dm-list-footer tone-${tone}">
              <span>${esc(q.status_label)}</span>
              <span>${esc(q.ship_meta)}</span>
            </div>
          </article>`;
        })
        .join('')}
    </div>`;
  return shell({
    activeTab: 'Sales',
    title: 'Quotes',
    right: `<button type="button" class="dm-icon-btn">${ICO.gear}</button><button type="button" class="dm-add">${ICO.plus} New quote</button>`,
    body,
  });
}

function renderQuote(data: DemoData): string {
  const q = data.ui.quote_detail;
  const body = `
    <div class="dm-card accent-bad pad-status">
      <div class="dm-k">Quote status</div>
      <div class="dm-status-line">
        <span class="dm-accent thin bad"></span>
        <span class="dm-name">${esc(q.status_label)}</span>
        <span class="dm-sub inline">${esc(q.status_age)}</span>
      </div>
      <div class="dm-stack-btns">
        <button type="button" class="dm-outline good">To Pack</button>
        <button type="button" class="dm-outline warn">Revert to Draft</button>
        <button type="button" class="dm-outline bad">Cancel quote</button>
      </div>
    </div>
    <button type="button" class="dm-wide">${ICO.clipboard} Import order text</button>
    <div class="dm-section-label">Customer</div>
    <div class="dm-card row-between">
      <div>
        <div class="dm-name lg">${esc(q.contact)}</div>
        <div class="dm-sub">${esc(q.phone)}</div>
        <div class="dm-sub">${esc(q.address)}</div>
      </div>
      ${ICO.chevron}
    </div>
    <div class="dm-money-lines">
      <div><span>Subtotal (excl. VAT)</span><span>${zar(q.subtotal_cents)}</span></div>
      <div><span>VAT (15%)</span><span>${zar(q.vat_cents)}</span></div>
      <div><span>Shipping</span><span>${zar(q.shipping_cents)}</span></div>
      <div class="grand"><span>Total</span><span>${zar(q.total_cents)}</span></div>
    </div>
    <div class="dm-two-btns">
      <button type="button" class="dm-wide">Save</button>
      <button type="button" class="dm-wide outline good">${ICO.wa} Send</button>
    </div>
    <button type="button" class="dm-wide outline">Send Reminder</button>
    <div class="dm-caption">${esc(q.sent_caption)}</div>`;
  return shell({
    activeTab: 'Sales',
    title: 'Sales',
    back: true,
    right: `<span class="dm-link">Duplicate</span><span class="dm-link bad">Delete</span>`,
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
    <div class="dm-toolbar">
      <button type="button" class="dm-pill">${ICO.sort} Popular <span class="dm-caret">▾</span></button>
      <button type="button" class="dm-icon-btn">${ICO.filter}</button>
      <div class="dm-view-toggle">
        <span class="on">${ICO.list} List</span>
        <span>${ICO.grid} Grid</span>
      </div>
    </div>
    <div class="dm-section-label">⌄ Uncategorized · ${products.length}</div>
    <div class="dm-cards">
      ${products
        .map((p) => {
          const stock = productStock(p, data);
          const thumb = imgSrc(p.variations?.[0]?.image || p.image);
          const sku = data.ui.catalog_skus[p.id] || p.id;
          const isVar = !!p.variations?.length;
          const price = isVar ? '' : zar(p.price_cents || 0);
          const cost = isVar ? '' : `Cost ${zar(p.cost_cents || 0)}`;
          return `<article class="dm-list-card tone-${stock.tone}">
            <span class="dm-accent"></span>
            <div class="dm-list-body product">
              <img class="dm-thumb" src="${thumb}" alt="" width="48" height="48" />
              <div class="dm-meta">
                <div class="dm-name">${esc(p.name)}</div>
                <div class="dm-sub">${esc(sku)}</div>
              </div>
              <div class="dm-right">
                ${
                  isVar
                    ? ''
                    : `<div class="dm-price">${price}</div><div class="dm-sub">${cost}</div>`
                }
              </div>
            </div>
            <div class="dm-list-footer tone-${stock.tone}">
              <span>${esc(stock.left)}</span>
              <span>${esc(stock.right)}</span>
            </div>
          </article>`;
        })
        .join('')}
    </div>`;
  return shell({
    activeTab: 'Catalog',
    title: 'Catalog',
    right: `<button type="button" class="dm-icon-btn">${ICO.folder}</button><button type="button" class="dm-icon-btn">${ICO.layers}</button><button type="button" class="dm-icon-btn">${ICO.gear}</button><button type="button" class="dm-add">${ICO.plus} Add</button>`,
    body,
    time: '15:51',
  });
}

function renderContacts(data: DemoData): string {
  const openByContact = new Map<string, { status: string; label: string }>();
  for (const q of data.quotes) {
    if (q.status === 'shipped' || q.status === 'cancelled' || q.status === 'draft') continue;
    openByContact.set(q.contact, {
      status: q.status,
      label: data.status_labels[q.status] || q.status,
    });
  }
  const shipped = new Set(
    data.quotes.filter((q) => q.status === 'shipped').map((q) => q.contact)
  );

  const body = `
    <div class="dm-toolbar">
      <div class="dm-search grow">${ICO.search}<span>Search contacts...</span></div>
      <button type="button" class="dm-pill">${ICO.sort} Newest</button>
      <button type="button" class="dm-icon-btn">${ICO.filter}</button>
    </div>
    <div class="dm-cards">
      ${data.contacts
        .map((c) => {
          const open = openByContact.get(c.name);
          const tone = open ? toneForStatus(open.status) : 'muted';
          const success = !open && shipped.has(c.name);
          return `<article class="dm-list-card${open ? ` tone-${tone}` : ''}">
            ${open ? '<span class="dm-accent"></span>' : ''}
            <div class="dm-list-body">
              <div class="dm-name">${esc(c.name)}</div>
              <div class="dm-sub">${esc(locationLabel(c))}</div>
              <div class="dm-sub">${esc(c.phone)}</div>
              ${
                success
                  ? '<div class="dm-sub strong">1 successful quote</div>'
                  : ''
              }
            </div>
            ${
              open
                ? `<div class="dm-list-footer tone-${tone}">
                <span>${esc(open.label)}</span>
                <span>1 open quote</span>
              </div>`
                : ''
            }
          </article>`;
        })
        .join('')}
    </div>`;
  return shell({
    activeTab: 'Contacts',
    title: 'Contacts',
    right: `<button type="button" class="dm-icon-btn">${ICO.phone}</button><button type="button" class="dm-add">${ICO.plus} Add</button>`,
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
