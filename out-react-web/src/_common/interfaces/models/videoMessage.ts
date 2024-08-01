import { Model } from './_common'
import { User, Avatar } from './user'
export interface GetContactListUsers extends Model {
    list: []
}
export interface GetMessageList extends Model {
    unread_message: any[],
    old_message: any[],
    deleted_message: any[]
}