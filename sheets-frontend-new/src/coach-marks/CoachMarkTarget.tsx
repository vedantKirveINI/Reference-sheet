import { useEffect, useRef, cloneElement, isValidElement } from 'react';
import { useCoachMarkContext } from './CoachMarkProvider';

interface CoachMarkTargetProps {
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

export function CoachMarkTarget({ id, children, asWrapper = false }: CoachMarkTargetProps) {
  const { registerRef } = useCoachMarkContext();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    registerRef(id, ref.current);
    return () => {
      registerRef(id, null);
    };
  }, [id, registerRef]);

  const useWrapper = asWrapper || !isValidElement(children) || !canAcceptRef(children);

  if (useWrapper) {
    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        data-coach-target={id}
        style={{ display: 'contents' }}
      >
        {children}
      </div>
    );
  }

  return cloneElement(children as React.ReactElement<{ ref?: React.Ref<unknown> }>, {
    ref,
  });
}
