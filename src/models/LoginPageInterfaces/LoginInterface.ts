import React from "react";

export type FormInputProps = {
    description: string;
    placeholder: string;
    type: React.HTMLInputTypeAttribute;
    value: string;
    onChange: (value: string) => void;
};


export type FormButtonProps = {
    title: string;
    onClick: () => void;
};