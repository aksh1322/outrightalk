import { Cdn } from "./cdn";
import { Model, Status } from "./_common";

export interface Banner extends Model {
  entity_id: number,
  entity_type: number,
  cdn_id: number,
  file_name: string,
  file_name_original: string,
  file_ext: string,
  file_mime: string,
  location: string,
  file_size: number,
  cdn: Cdn,
}