export interface Field {
    name: string;
    type: string;
    label?: string;
    isPrimary?: boolean;
    isNullable?: boolean;
    isUnique?: boolean;
}

export interface Table {
    name: string;
    fields: Field[];
}

export interface WebhookDefinition {
    name: string;
    url: string;
    events: string[];
}
