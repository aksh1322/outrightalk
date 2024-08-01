import { type } from "os";

export interface Model {
  id: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export enum Status {
  active = 1,
  inactive = 0
}

export enum Confirmation {
  yes = 1,
  no = 0
}

export enum UserType {
  admin = 0,
  instructor = 1,
  student = 2,
}

export enum PaymentGateway {
  stripe = 2,
}

export enum PaymentCardType {
  savedCard = 1,
  newCard = 2,
}


export enum CalendarDayType {
  monday = 1,
  tuesday = 2,
  wednesday = 3,
  thursday = 3,
  friday = 3,
  saturday = 3,
  sunday = 3,
}
