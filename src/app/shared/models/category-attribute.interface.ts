export type AttributeType = 'select' | 'multi-select' | 'number-range' | 'text';

export interface AttributeOption {
  value: string;
  label: string;
  labelAr?: string;
}

export interface CategoryAttribute {
  _id?: string;
  key: string;
  label: string;
  labelAr?: string;
  type: AttributeType;
  options?: AttributeOption[];
  unit?: string;
  min?: number;
  max?: number;
  filterable: boolean;
  required: boolean;
  order: number;
}

export interface FilterDefinitionResponse {
  status: 'success';
  data: {
    filters: CategoryAttribute[];
  };
}

export interface CategoryAttributeResponse {
  status: 'success';
  data: {
    categoryAttributes: {
      _id: string;
      category: string;
      attributes: CategoryAttribute[];
      createdAt?: string;
      updatedAt?: string;
    };
  };
}

export type AttrFilterValue =
  | string
  | string[]
  | { min?: number; max?: number };

export interface ActiveFilters {
  [attrKey: string]: AttrFilterValue;
}
