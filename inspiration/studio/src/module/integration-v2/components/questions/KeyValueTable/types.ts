import { CSSProperties } from "react";

export type TStyles = CSSProperties & {
  boxContainerStyles?: CSSProperties;
};

export type TInitialValue = {
  key: string;
  value: any;
} & any;

export type TKeyValueTableProps = {
  value: TInitialValue[] | [];
  onChange: any;
  variables: any;
  question?: any;
  isCreator?: boolean;
  answers?: any;
  styles?: TStyles;
};
