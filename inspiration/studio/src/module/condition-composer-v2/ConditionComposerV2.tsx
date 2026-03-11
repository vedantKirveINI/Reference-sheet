import React, {
  forwardRef,
  useReducer,
  useEffect,
  useImperativeHandle,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { isEmpty, cloneDeep, isEqual } from 'lodash';
import { ODSLabel as Label } from '@src/module/ods';
import type { ConditionComposerV2Props, ConditionNode } from './types';
import { createConditionReducer } from './utils/reducer';
import { createEmptyRoot, getHumanReadableSummarySegments } from './utils/helpers';
import { getWhereClauseStr } from '../condition-composer/utils/getWhereClauseStr';
import sanitizeAndProcessData from '../condition-composer/utils/getSanitizedData';
import UNSUPPORTED_QUESTION_TYPES from '../condition-composer/constant/unsupportedQuestionTypes';
import ConditionGroup from './components/ConditionGroup';
import Footer from './components/Footer';
import Summary from './components/Summary';

export const ConditionComposerV2 = forwardRef<any, ConditionComposerV2Props>(
  (
    {
      initialValue,
      schema: initialSchema = [],
      onChange = () => {},
      variables = {},
      effects = [],
    },
    ref
  ) => {
    const schema = useMemo(() => {
      return initialSchema.filter(
        (item) => !UNSUPPORTED_QUESTION_TYPES.includes(item.type) && !["ARRAY", "OBJECT", "JSON"].includes(item.data_type)
      );
    }, [initialSchema]);

    const conditionReducer = useMemo(() => createConditionReducer(schema), [schema]);

    const getInitialState = (): ConditionNode => {
      if (initialValue && !isEmpty(initialValue)) {
        return cloneDeep(initialValue);
      }
      return createEmptyRoot();
    };

    const [state, dispatch] = useReducer(conditionReducer, undefined, getInitialState);

    const summary = useMemo(() => getHumanReadableSummarySegments(state), [state]);

    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    const isFromPropSyncRef = useRef(false);
    const pendingNotifyRef = useRef(false);

    const notifyChange = useCallback((newState: ConditionNode) => {
      const sanitizedValue = sanitizeAndProcessData(cloneDeep(newState));
      const whereClauseStr = getWhereClauseStr({
        initialVal: sanitizedValue,
        includeWhere: true,
      });
      onChangeRef.current(sanitizedValue, whereClauseStr);
    }, []);

    useEffect(() => {
      if (isFromPropSyncRef.current) {
        isFromPropSyncRef.current = false;
        return;
      }
      if (pendingNotifyRef.current) {
        pendingNotifyRef.current = false;
        notifyChange(state);
      }
    }, [state, notifyChange]);

    const prevInitialValueRef = useRef(initialValue);
    const prevSchemaRef = useRef(schema);
    
    useEffect(() => {
      const initialValueChanged = !isEqual(prevInitialValueRef.current, initialValue);
      const schemaChanged = !isEqual(prevSchemaRef.current, schema);
      
      prevInitialValueRef.current = initialValue;
      prevSchemaRef.current = schema;
      
      if (initialValueChanged && initialValue && !isEmpty(initialValue)) {
        isFromPropSyncRef.current = true;
        dispatch({ type: 'SET_VALUE', payload: cloneDeep(initialValue) });
        return;
      }
      
      if (schemaChanged && schema.length > 0) {
        if (!initialValue || isEmpty(initialValue)) {
          isFromPropSyncRef.current = true;
          dispatch({ type: 'SET_VALUE', payload: createEmptyRoot() });
        }
      }
    }, [initialValue, schema]);

    useImperativeHandle(ref, () => ({
      getValue: () => state,
      getSanitizedData: () => sanitizeAndProcessData(cloneDeep(state)),
    }), [state]);

    const handleUpdateField = useCallback((path: string, property: string, value: any) => {
      pendingNotifyRef.current = true;
      dispatch({ type: 'UPDATE_FIELD', payload: { path, property, value } });
    }, []);

    const handleDelete = useCallback((path: string) => {
      pendingNotifyRef.current = true;
      dispatch({ type: 'DELETE_CONDITION', payload: { path } });
    }, []);

    const handleClone = useCallback((path: string) => {
      pendingNotifyRef.current = true;
      dispatch({ type: 'CLONE_CONDITION', payload: { path } });
    }, []);

    const handleAddCondition = useCallback((path: string, isGroup: boolean) => {
      pendingNotifyRef.current = true;
      dispatch({ type: 'ADD_CONDITION', payload: { path, isGroup } });
    }, []);

    const handleChangeConjunction = useCallback((path: string, conjunction: 'and' | 'or') => {
      pendingNotifyRef.current = true;
      dispatch({ type: 'CHANGE_CONJUNCTION', payload: { path, conjunction } });
    }, []);

    const handleAddRootCondition = useCallback(() => {
      pendingNotifyRef.current = true;
      dispatch({ type: 'ADD_CONDITION', payload: { path: '', isGroup: false } });
    }, []);

    const handleAddRootGroup = useCallback(() => {
      pendingNotifyRef.current = true;
      dispatch({ type: 'ADD_CONDITION', payload: { path: '', isGroup: true } });
    }, []);

    const handleClearAll = useCallback(() => {
      pendingNotifyRef.current = true;
      dispatch({ type: 'CLEAR_ALL' });
    }, []);

    const hasConditions = state?.childs && state.childs.length > 0;

    return (
      <div className="condition-composer-v2">
        {hasConditions && (
          <>
            <Label
              variant="subtitle2"
              color="#666"
              style={{
                lineHeight: '1.37rem',
                fontFamily: 'Inter',
                marginBottom: 0,
              }}
            >
              In this view, show records{' '}
              <span
                style={{
                  fontFamily: 'Inter',
                  fontSize: '1rem',
                  fontWeight: 600,
                  lineHeight: '2.25rem',
                  letterSpacing: '0.078rem',
                  color: '#333',
                  marginLeft: '0.75rem',
                }}
              >
                WHERE
              </span>
            </Label>

            <ConditionGroup
              node={state}
              path=""
              nestedLevel={0}
              schema={schema}
              variables={variables}
              effects={effects}
              onUpdateField={handleUpdateField}
              onDelete={handleDelete}
              onClone={handleClone}
              onAddCondition={handleAddCondition}
              onChangeConjunction={handleChangeConjunction}
              dataTestId="condition-group-root"
            />
          </>
        )}

        <Footer
          onAddCondition={handleAddRootCondition}
          onAddGroup={handleAddRootGroup}
          onClearAll={handleClearAll}
          isEmpty={!hasConditions}
        />

        {hasConditions && <Summary summary={summary} />}
      </div>
    );
  }
);

ConditionComposerV2.displayName = 'ConditionComposerV2';

export default ConditionComposerV2;
