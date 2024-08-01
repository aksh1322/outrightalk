import { Model, Status } from "./_common";

export interface Cdn extends Model {
  status: Status,
  cdn_path?: string,
  cdn_root?: string
}