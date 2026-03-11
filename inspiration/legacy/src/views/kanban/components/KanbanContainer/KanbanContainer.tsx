// Phase 3: Kanban Container Component
// Main container that renders all stacks
// Reference: teable/apps/nextjs-app/src/features/app/blocks/view/kanban/components/KanbanContainer.tsx

import React, { useState, useEffect, useCallback } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useKanban } from "../../hooks/useKanban";
import { KanbanStackContainer } from "../KanbanStackContainer/KanbanStackContainer";
import { filterRecordsByStack } from "@/utils/kanban";
import { reorder, moveTo, getCellValueByStack } from "../../utils/drag";
import type { IRecord } from "@/types";
import styles from "./KanbanContainer.module.scss";

type ICardMap = Record<string, IRecord[]>;

const EMPTY_LIST: IRecord[] = [];

export const KanbanContainer: React.FC = () => {
	const {
		stackCollection,
		stackField,
		records = [],
		rowHeaders = [],
		onRecordUpdate,
		onCrossStackMoveComplete,
	} = useKanban();

	const [cardMap, setCardMap] = useState<ICardMap>({});

	// Initialize cardMap from records and stackCollection
	useEffect(() => {
		if (!stackCollection || !stackField || records.length === 0) {
			setCardMap({});
			return;
		}

		const newCardMap: ICardMap = {};
		for (const stack of stackCollection) {
			const stackRecords = filterRecordsByStack(
				records,
				stack,
				stackField,
			);
			newCardMap[stack.id] = stackRecords;
		}

		setCardMap(newCardMap);
	}, [stackCollection, stackField, records]);

	const setCardMapInner = useCallback((partialCardMap: ICardMap) => {
		setCardMap((prev) => ({ ...prev, ...partialCardMap }));
	}, []);

	const onDragEnd = useCallback(
		async (result: DropResult) => {
			const { source, destination } = result;

			if (!destination) return;

			const { droppableId: sourceStackId, index: sourceIndex } = source;
			const { droppableId: targetStackId, index: targetIndex } =
				destination;

			// Same stack reorder
			if (sourceStackId === targetStackId) {
				const cards = cardMap[sourceStackId] || [];
				const cardCount = cards.length;

				if (!cardCount || sourceIndex === targetIndex) return;

				if (sourceIndex < cardCount && targetIndex < cardCount) {
					// Optimistically update UI; backend will emit full records (e.g. recordsFetched) with new order
					const newCards = reorder(cards, sourceIndex, targetIndex);
					setCardMapInner({ [sourceStackId]: newCards });
				}
				return;
			}

			// Cross-stack move
			const sourceCards = cardMap[sourceStackId] || [];
			const targetCards = cardMap[targetStackId] || [];
			const sourceCard = sourceCards[sourceIndex];

			if (!sourceCard || !stackField || !stackCollection) return;

			// Find target stack and source stack
			const targetStack = stackCollection.find(
				(s) => s.id === targetStackId,
			);
			const sourceStack = stackCollection.find(
				(s) => s.id === sourceStackId,
			);
			if (!targetStack) return;

			// Store previous state for rollback
			const previousCardMap = { ...cardMap };

			try {
				// Get field value for target stack
				const fieldValue = getCellValueByStack(targetStack);
				const fieldId = (stackField as any).rawId || stackField.id;

				// Optimistically update UI
				const { sourceList, targetList } = moveTo({
					source: sourceCards,
					target: targetCards,
					sourceIndex,
					targetIndex,
				});

				setCardMapInner({
					[sourceStackId]: sourceList,
					[targetStackId]: targetList,
				});

				// Compute order: anchor = card we're dropping "above" (at targetIndex in target list)
				let newOrder: number | undefined;
				const anchorCard = targetCards[targetIndex];
				if (anchorCard && records.length === rowHeaders.length) {
					const anchorIndex = records.findIndex(
						(r) => String(r.id) === String(anchorCard.id),
					);
					if (anchorIndex >= 0) {
						const anchorOrderValue =
							(rowHeaders[anchorIndex] as { orderValue?: number })
								?.orderValue ??
							(
								rowHeaders[anchorIndex] as {
									displayIndex?: number;
								}
							)?.displayIndex ??
							anchorIndex + 1;
						// Drop above anchor: use slightly less; below would be targetIndex - 1
						newOrder = Number(anchorOrderValue) - 0.5;
					}
				}

				// Update record field value (and order) via backend
				if (onRecordUpdate) {
					await onRecordUpdate([
						{
							recordId: sourceCard.id,
							fieldId: String(fieldId),
							value: fieldValue,
							...(newOrder !== undefined && { order: newOrder }),
						},
					]);
				}

				// Optimistic group points: source -1, target +1
				if (onCrossStackMoveComplete && sourceStack) {
					onCrossStackMoveComplete(
						sourceStack.data,
						targetStack.data,
					);
				}
			} catch {
				// Rollback optimistic update on error
				setCardMap(previousCardMap);
			}
		},
		[
			cardMap,
			stackCollection,
			stackField,
			onRecordUpdate,
			onCrossStackMoveComplete,
			setCardMapInner,
		],
	);

	if (!stackCollection || stackCollection.length === 0) {
		return null;
	}

	// const canDrag = permission?.canEdit ?? false;

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<div className={styles.container}>
				{stackCollection.map((stack, index) => (
					<KanbanStackContainer
						key={stack.id}
						index={index}
						stack={stack}
						cards={cardMap[stack.id] || EMPTY_LIST}
					/>
				))}
			</div>
		</DragDropContext>
	);
};
