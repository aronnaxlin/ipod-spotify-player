import React from 'react';
export const Menubar = ({ children }: any) => <div>{children}</div>;
export const MenubarMenu = ({ children }: any) => <div>{children}</div>;
export const MenubarTrigger = ({ children }: any) => <button>{children}</button>;
export const MenubarContent = ({ children }: any) => <div>{children}</div>;
export const MenubarItem = ({ children, onSelect }: any) => <div onClick={onSelect}>{children}</div>;
export const MenubarSeparator = () => <hr />;
export const MenubarSub = ({ children }: any) => <div>{children}</div>;
export const MenubarSubTrigger = ({ children }: any) => <div>{children}</div>;
export const MenubarSubContent = ({ children }: any) => <div>{children}</div>;
export const MenubarCheckboxItem = ({ children, checked, onCheckedChange }: any) => (
  <div onClick={() => onCheckedChange(!checked)}>{children} {checked ? '✓' : ''}</div>
);
export const MenubarRadioGroup = ({ children, value, onValueChange }: any) => <div>{children}</div>;
export const MenubarRadioItem = ({ children, value }: any) => <div>{children}</div>;
export const MenubarPortal = ({ children }: any) => <div>{children}</div>;
