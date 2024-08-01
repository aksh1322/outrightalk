import { Model } from "./_common";

export interface FileType extends Model {
  originalName?: string;
  name?: string;
  path?: string;
  mime?: string;
  fullUrl: string;
}