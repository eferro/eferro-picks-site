/**
 * Utility to join CSS class names conditionally.
 * Filters out falsy values and joins the rest with spaces.
 */
export function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
