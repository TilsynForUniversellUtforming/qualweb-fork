import isElementHiddenByCSSAux from './isElementHiddenByCSSAux';

function isElementHiddenByCSS(element: typeof window.qwElement): boolean {
  const parent = element.getParentAllContexts();
  let parentHidden = false;
  if (parent) {
    parentHidden = isElementHiddenByCSS(parent);
  }
  return isElementHiddenByCSSAux(element) || parentHidden;
}

export default isElementHiddenByCSS;
