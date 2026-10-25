export const $ = <T extends HTMLElement = HTMLElement>(selector: string, root: ParentNode = document): T => {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`Element not found: '${selector}'`);
  return el;
};

export const cloneTemplate = <T extends HTMLElement = HTMLElement>(selector: string): T => {
  const template = $<HTMLTemplateElement>(selector);
  const cloneSubtree = true;
  const clone = template.content.firstElementChild?.cloneNode(cloneSubtree);
  if (!clone) throw new Error(`Not a valid template: '${selector}'`);
  return clone as T;
};
