import { useEffect, useRef, cloneElement, isValidElement, forwardRef } from 'react';
import type { HTMLAttributes, MutableRefObject, Ref as ReactRef } from 'react';
import { useCoachMarkContext } from './CoachMarkContext';

interface CoachMarkTargetProps extends HTMLAttributes<HTMLElement> {
  id: string;
  children: React.ReactElement;
  asWrapper?: boolean;
}

function canAcceptRef(element: React.ReactElement): boolean {
  const type = element.type;
  if (typeof type === 'string') return true;
  if (typeof type === 'function') return false;
  if (type && typeof type === 'object') {
    return (type as { $$typeof?: symbol }).$$typeof === Symbol.for('react.forward_ref');
  }
  return false;
}

export const CoachMarkTarget = forwardRef<HTMLElement, CoachMarkTargetProps>(
  function CoachMarkTarget(
    { id, children, asWrapper = false, ...restProps },
    forwardedRef
  ) {
    const { registerRef } = useCoachMarkContext();
    const innerRef = useRef<HTMLElement | null>(null);

    const setRef = (node: HTMLElement | null) => {
      innerRef.current = node;

      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef && 'current' in forwardedRef) {
        (forwardedRef as MutableRefObject<HTMLElement | null>).current = node;
      }
    };

    useEffect(() => {
      registerRef(id, innerRef.current);
      return () => {
        registerRef(id, null);
      };
    }, [id, registerRef]);

    const useWrapper = asWrapper || !isValidElement(children) || !canAcceptRef(children);

    if (useWrapper) {
      return (
        <div
          ref={setRef as ReactRef<HTMLDivElement>}
          data-coach-target={id}
          style={{ display: 'contents' }}
          {...restProps}
        >
          {children}
        </div>
      );
    }

    return cloneElement(
      children as React.ReactElement<{ ref?: ReactRef<unknown> }>,
      {
        ...restProps,
        ref: setRef,
        'data-coach-target': id,
      }
    );
  }
);
