import { Confirmation, Model, Status, UserType } from './_common'

export interface Avatar {
  file_mime?: string | null;
  id: number;
  original: string;
  thumb: string;
  visible_avatar?: number;
}

interface VISIBLE_OPTION {
  key?: string;
  value?: number;
}

export interface User extends Model {
  isVipOwner:any,
  alerts_and_sounds:any,
  all_room_subscribtions:any,
  all_subscribtions:any;
  auto_reply_message:any;
  about: string;
  answer: string;
  avatar: Avatar;
  badge_data: any,
  badge_points: any,
  country: number;
  dob: string;
  date_of_birth: string;
  email: string;
  first_name: string | null;
  full_name: string | null;
  gender: number;
  allow_create_room?: number;
  id: number;
  last_name: string | null;
  otp: string | null;
  phone: string | null;
  question: number;
  roles: any;
  state: string;
  is_subscribed:any;
  status: number
  username: string;
  visible_status?: number;
  visible_option?: VISIBLE_OPTION[];
  current_translation_language:string;
  is_set_parental:boolean;
}