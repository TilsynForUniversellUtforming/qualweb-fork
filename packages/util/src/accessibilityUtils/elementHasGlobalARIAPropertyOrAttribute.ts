import type { QWElement } from '@qualweb/qw-element';
import { ariaAttributesRoles } from './ariaAttributesRoles';

function elementHasGlobalARIAPropertyOrAttribute(element: QWElement): boolean {
  let elemAttribs = element.getElementAttributesName();
  elemAttribs = elemAttribs.filter((elem) => elem.startsWith('ar'));
  let result = false;
  let i = 0;
  while (!result && i < elemAttribs.length) {
    result =
      elemAttribs[i] in ariaAttributesRoles &&
      ariaAttributesRoles[elemAttribs[i] as keyof typeof ariaAttributesRoles].global === 'yes';
    i++;
  }
  return result;
}

export default elementHasGlobalARIAPropertyOrAttribute;
