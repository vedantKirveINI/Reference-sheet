import { useEffect, useRef, cloneElement, isValidElement } from 'react';
import { useCoachMarkContext } from './CoachMarkProvider';

interface CoachMarkTargetProps {
  id: string;
  children: React.ReactElement;
  asWrapper?: boolean;
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

  if (asWrapper) {
    return (
      <div ref={ref as React.Ref<HTMLDivElement>} style={{ display: 'contents' }}>
        {children}
      </div>
    );
  }

  if (!isValidElement(children)) return children;

  try {
    return cloneElement(children as React.ReactElement<{ ref?: React.Ref<HTMLElement> }>, {
      ref,
    });
  } catch {
    return (
      <div ref={ref as React.Ref<HTMLDivElement>} style={{ display: 'contents' }}>
        {children}
      </div>
    );
  }
}
