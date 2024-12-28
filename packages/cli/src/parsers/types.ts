export interface StringLiteral {
  type: "StringLiteral";
  value: string;
}

export interface ObjectExpression {
  type: "ObjectExpression";
  properties: Property[];
}

export interface Property {
  key?: {
    name: string;
  };
  value?: StringLiteral;
}

export interface JSXAttribute {
  name?: {
    name: string;
  };
  value?: StringLiteral;
}

export type Node = {
  type: string;
  callee?: {
    type: string;
    name?: string;
    object?: {
      name: string;
    };
    property?: {
      name: string;
    };
  };
  arguments?: (StringLiteral | ObjectExpression)[];
  name?: {
    name: string;
  };
  attributes?: JSXAttribute[];
  value?: string;
  key?: {
    name: string;
  };
  properties?: Property[];
};

export interface Parser {
  parse(node: Node, keys: string[]): void;
}
