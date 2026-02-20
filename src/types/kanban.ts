import { IRecord } from "./grid";

export const UNCATEGORIZED_STACK_ID = "__uncategorized__";

export interface IStackData {
  id: string;
  title: string;
  records: IRecord[];
  color?: string;
  count: number;
}

export interface IKanbanViewOptions {
  stackField: string;
  coverField?: string;
  titleField?: string;
  visibleFields?: string[];
  stackOrder?: string[];
  hideEmptyStacks?: boolean;
  cardCoverAspectRatio?: "square" | "landscape" | "portrait";
}

export interface IKanbanPermission {
  canCreateCard: boolean;
  canEditCard: boolean;
  canDeleteCard: boolean;
  canMoveCard: boolean;
  canCreateStack: boolean;
  canEditStack: boolean;
  canDeleteStack: boolean;
  canReorderStack: boolean;
}
