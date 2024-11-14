import type { QWElement } from '@qualweb/qw-element';

function getDisabledWidgets(): Array<QWElement> {
  const elements = window.qwPage.getElements('*');
  const disabledElements = new Array<QWElement>();
  let disable, ariaDisable, parent, parentTag;
  for (const element of elements) {
    const isWidget = window.AccessibilityUtils.isElementWidget(element);
    disable = element.getElementAttribute('disabled') !== null;
    ariaDisable = element.getElementAttribute('aria-disabled') === 'true';
    parent = element.getElementParent();
    if (parent && !(disable || ariaDisable)) {
      parentTag = parent.getElementTagName();
      if (parentTag === 'label') {
        parent = parent.getElementParent();
        disable = parent?.getElementAttribute('disabled') !== null;
        ariaDisable = parent?.getElementAttribute('aria-disabled') === 'true';
      }
    }
    if (isWidget && (disable || ariaDisable)) {
      disabledElements.push(element);
    }
  }
  return disabledElements;
}

export default getDisabledWidgets;
