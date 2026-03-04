import React from 'react';
import { IUserInfo } from '@/types/cell';
import { CollaboratorPicker } from './collaborator-picker';

interface UserEditorProps {
  value: IUserInfo[] | null;
  onChange: (users: IUserInfo[]) => void;
  isMultiple?: boolean;
}

export const UserEditor: React.FC<UserEditorProps> = ({
  value,
  onChange,
  isMultiple = true,
}) => {
  return (
    <CollaboratorPicker
      selectedUsers={value || []}
      onChange={onChange}
      isMultiple={isMultiple}
      placeholder="Select users..."
    />
  );
};
