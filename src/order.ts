import './order.css';
import { PUBLIC_ORDER_FUNCTION_URL, PUBLIC_SUPABASE_ANON_KEY } from './config';

type PublicVariation = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  lowStock: boolean;
};

type PublicProduct = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  lowStock: boolean;
  variations: PublicVariation[];
};

type PublicFee = {
  id: string;
  name: string;
  priceCents: number;
  variations: { id: string; name: string; priceCents: number }[];
};

type Catalog = {
  businessName: string;
  products: PublicProduct[];
  packaging: PublicFee[];
  shipping: PublicFee[];
};

const foundRoot = document.getElementById('order-root');
if (!foundRoot) {
  throw new Error('order-root missing');
}
const root = foundRoot;

function tokenFromLocation(): string {
  const params = new URLSearchParams(window.location.search);
  return (params.get('t') ?? params.get('token') ?? '').trim();
}

function moneyFromCents(cents: number): string {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(cents / 100);
}

function headers(): HeadersInit {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (PUBLIC_SUPABASE_ANON_KEY) {
    h.apikey = PUBLIC_SUPABASE_ANON_KEY;
    h.Authorization = `Bearer ${PUBLIC_SUPABASE_ANON_KEY}`;
  }
  return h;
}

function renderNotFound(): void {
  root.innerHTML = `
    <div class="order-error">
      <h1>Order form not found</h1>
      <p>This link is invalid or has been replaced. Ask the business for a new one.</p>
    </div>`;
}

function renderThanks(businessName: string): void {
  const who = businessName.trim() || 'the business';
  root.innerHTML = `
    <div class="order-thanks">
      <h1>Order sent</h1>
      <p>Thanks — ${who} will be in touch with a quote.</p>
    </div>`;
}

function feeSelect(id: string, label: string, options: PublicFee[]): string {
  if (options.length === 0) return '';
  const items = options
    .map((opt) => {
      if (opt.variations.length === 0) {
        return `<option value="${opt.id}">${opt.name} — ${moneyFromCents(opt.priceCents)}</option>`;
      }
      return opt.variations
        .map(
          (v) =>
            `<option value="${opt.id}:${v.id}">${opt.name} · ${v.name} — ${moneyFromCents(v.priceCents)}</option>`
        )
        .join('');
    })
    .join('');
  return `<label>${label}<select id="${id}"><option value="">None</option>${items}</select></label>`;
}

function parseFee(value: string): { optionId: string | null; variationId: string | null } {
  if (!value) return { optionId: null, variationId: null };
  const [optionId, variationId] = value.split(':');
  return { optionId: optionId || null, variationId: variationId || null };
}

async function loadCatalog(token: string): Promise<Catalog | null> {
  const url = `${PUBLIC_ORDER_FUNCTION_URL}?token=${encodeURIComponent(token)}`;
  const res = await fetch(url, { headers: headers() });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Could not load this order form.');
  return (await res.json()) as Catalog;
}

function renderForm(token: string, catalog: Catalog): void {
  const qty = new Map<string, number>();
  const variationChoice = new Map<string, string>();

  const productHtml = catalog.products
    .map((product) => {
      const img = product.imageUrl
        ? `<img src="${product.imageUrl}" alt="">`
        : `<div style="width:64px;height:64px;border-radius:10px;background:#e8e4da"></div>`;
      const variationBlock =
        product.variations.length > 0
          ? `<select data-product="${product.id}" class="order-variation">
              ${product.variations
                .map(
                  (v) =>
                    `<option value="${v.id}">${v.name} — ${moneyFromCents(v.priceCents)}${v.lowStock ? ' (low stock)' : ''}</option>`
                )
                .join('')}
            </select>`
          : `<p class="order-price">${moneyFromCents(product.priceCents)}</p>`;
      const warn =
        product.lowStock || product.variations.some((v) => v.lowStock)
          ? `<p class="order-warn">Low stock — you can still order.</p>`
          : '';
      return `<article class="order-product" data-id="${product.id}">
        ${img}
        <div>
          <h2>${product.name}</h2>
          ${product.description ? `<p class="order-price">${product.description}</p>` : ''}
          ${variationBlock}
          ${warn}
          <div class="order-qty">
            <button type="button" data-dec="${product.id}" aria-label="Fewer">−</button>
            <span data-qty="${product.id}">0</span>
            <button type="button" data-inc="${product.id}" aria-label="More">+</button>
          </div>
        </div>
      </article>`;
    })
    .join('');

  const who = catalog.businessName.trim() || 'this business';
  root.innerHTML = `
    <h1 class="order-title">Order from ${who}</h1>
    <p class="order-lead">Choose what you need. Submit sends a draft quote — nothing is charged and stock is not taken yet.</p>
    <form id="order-form">
      <div>${productHtml || '<p class="order-status">This catalog has nothing to order right now.</p>'}</div>
      <div class="order-fields">
        <label>Your name<input id="order-name" name="name" required autocomplete="name"></label>
        <label>Phone<input id="order-phone" name="phone" required inputmode="tel" autocomplete="tel"></label>
        <label>Address<textarea id="order-address" name="address" rows="2" autocomplete="street-address"></textarea></label>
        ${feeSelect('order-packaging', 'Packaging (optional)', catalog.packaging)}
        ${feeSelect('order-shipping', 'Shipping (optional)', catalog.shipping)}
        <button class="order-submit" type="submit">Send order</button>
        <p id="order-form-error" class="order-status" hidden></p>
      </div>
    </form>`;

  const form = document.getElementById('order-form') as HTMLFormElement;
  const errorEl = document.getElementById('order-form-error') as HTMLParagraphElement;

  const paintQty = (productId: string) => {
    const label = root.querySelector(`[data-qty="${productId}"]`);
    if (label) label.textContent = String(qty.get(productId) ?? 0);
  };

  root.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const inc = target.getAttribute('data-inc');
    const dec = target.getAttribute('data-dec');
    if (inc) {
      qty.set(inc, (qty.get(inc) ?? 0) + 1);
      paintQty(inc);
    }
    if (dec) {
      qty.set(dec, Math.max(0, (qty.get(dec) ?? 0) - 1));
      paintQty(dec);
    }
  });

  root.addEventListener('change', (event) => {
    const target = event.target as HTMLSelectElement;
    if (target.classList.contains('order-variation')) {
      variationChoice.set(target.dataset.product ?? '', target.value);
    }
  });

  for (const product of catalog.products) {
    if (product.variations[0]) variationChoice.set(product.id, product.variations[0].id);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const lines = catalog.products
      .map((product) => {
        const quantity = qty.get(product.id) ?? 0;
        if (quantity <= 0) return null;
        return {
          productId: product.id,
          variationId: product.variations.length > 0 ? variationChoice.get(product.id) ?? product.variations[0]?.id : null,
          quantity,
        };
      })
      .filter((line): line is NonNullable<typeof line> => line != null);

    const name = (document.getElementById('order-name') as HTMLInputElement).value.trim();
    const phone = (document.getElementById('order-phone') as HTMLInputElement).value.trim();
    const address = (document.getElementById('order-address') as HTMLTextAreaElement).value.trim();
    const packaging = parseFee((document.getElementById('order-packaging') as HTMLSelectElement | null)?.value ?? '');
    const shipping = parseFee((document.getElementById('order-shipping') as HTMLSelectElement | null)?.value ?? '');

    errorEl.hidden = true;
    const submit = form.querySelector('.order-submit') as HTMLButtonElement;
    submit.disabled = true;
    try {
      const res = await fetch(PUBLIC_ORDER_FUNCTION_URL, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          token,
          name,
          phone,
          address,
          lines,
          packagingOptionId: packaging.optionId,
          packagingVariationId: packaging.variationId,
          shippingOptionId: shipping.optionId,
          shippingVariationId: shipping.variationId,
        }),
      });
      if (res.status === 404) {
        renderNotFound();
        return;
      }
      if (res.status === 429) {
        errorEl.hidden = false;
        errorEl.textContent = 'Too many orders just now. Please wait a minute and try again.';
        return;
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        errorEl.hidden = false;
        errorEl.textContent =
          body.error === 'lines_required'
            ? 'Add at least one item.'
            : 'Could not send this order. Check your details and try again.';
        return;
      }
      renderThanks(catalog.businessName);
    } catch {
      errorEl.hidden = false;
      errorEl.textContent = 'Could not send this order. Check your connection and try again.';
    } finally {
      submit.disabled = false;
    }
  });
}

async function main(): Promise<void> {
  const token = tokenFromLocation();
  if (!token) {
    renderNotFound();
    return;
  }
  try {
    const catalog = await loadCatalog(token);
    if (!catalog) {
      renderNotFound();
      return;
    }
    renderForm(token, catalog);
  } catch (error) {
    root.innerHTML = `<p class="order-error">${error instanceof Error ? error.message : 'Could not load this order form.'}</p>`;
  }
}

void main();
