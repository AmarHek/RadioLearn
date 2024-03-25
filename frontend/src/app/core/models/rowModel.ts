import {Clickable} from "@app/core/models/templateModel";

export interface Row {
  kind: "category";
  name: string;
  hidden: boolean;
  optional?: boolean;
  clickables: Clickable[];
}
