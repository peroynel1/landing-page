import type { DemoData, DemoScreenId } from './types.ts';
import { DEMO_SCREEN_IDS, renderDemoScreen } from './screens.ts';

function isDemoScreen(value: string | null): value is DemoScreenId {
  return !!value && (DEMO_SCREEN_IDS as string[]).includes(value);
}

export async function mountDemoScreens(): Promise<void> {
  const nodes = document.querySelectorAll<HTMLElement>('[data-demo-screen]');
  if (!nodes.length) return;

  let data: DemoData;
  try {
    const res = await fetch('/demo/content.json');
    if (!res.ok) throw new Error(`demo content ${res.status}`);
    data = (await res.json()) as DemoData;
  } catch (err) {
    console.warn('Demo phone mocks: failed to load content', err);
    return;
  }

  for (const node of nodes) {
    const id = node.getAttribute('data-demo-screen');
    if (!isDemoScreen(id)) continue;
    node.classList.add('demo-phone');
    node.innerHTML = renderDemoScreen(id, data);
  }
}
