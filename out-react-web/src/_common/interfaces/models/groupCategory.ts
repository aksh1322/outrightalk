import { Confirmation, Model, Status, UserType } from './_common'
import { User, Avatar } from './user'
interface Types {
    id: number,
    no_of_users: number,
    type_name: string
}

interface Groups {
    id: number,
    group_name: string
}

interface Category {
    id: number,
    category_title: string
}

interface GroupCategoryProperty {
    id: number,
    group_name: string,
    group_type: string,
    categoty_type: number,
    color_code: string,
    status: number | null,
    total_room: number,
    categories_id: number | string
}

export interface GroupCategory extends Model {
    list: GroupCategoryProperty[]
}

interface JoinStatus {
    room_id: number,
    is_accepted: number,
    is_admin: number
}
interface CategoryWiseDataProperty {
    id: number,
    text_enabled: number,
    video_enabled: number,
    voice_enabled: number,
    locked_room: number,
    room_type_id: number,
    group_id: number,
    room_category_id: number,
    language_id: number | null,
    room_name: string,
    topic: string | null,
    banner_url: string | null,
    lockword: string | null,
    admin_code: string,
    room_password: string,
    post_url: string,
    welcome_message: string,
    filter_words: string | null,
    total_user: number,
    type: string,
    total_camera_on: number,
    total_favourite: number,
    room_category: Category | null,
    join_status: JoinStatus | null,
}
export interface RoomListCategoryWise extends Model {
    list: CategoryWiseDataProperty[],
    allow_create_room: number,
    category_info: GroupCategoryProperty | null
}

export interface RoomTypes extends Model {
    list: Types[]
}

export interface RoomGroups extends Model {
    list: Groups[]
}

export interface RoomCategories extends Model {
    list: Category[]
}

interface Room {
    id: number,
    text_enabled: number,
    video_enabled: number,
    voice_enabled: number,
    locked_room: number,
    room_type_id: number,
    group_id: number,
    room_category_id: number,
    language_id: number | null,
    room_name: string,
    topic: string | null,
    banner_url: string | null,
    post_url: string,
    welcome_message: string,
    filter_words: string | null,
    is_comma_separated: number,
    is_favourite_count: number,
    room_picture: Avatar,
    total_user: number,
    type: string,
    total_camera_on: number,
    total_favourite: number,
    join_status: JoinStatus | null
}

export interface RoomDetails extends Model {
    room: Room,
    members: any[],
    user: User
}

export interface ActiveRoom {
    id: number;
    is_accepted: number;
    is_admin: number;
    is_cemera: number;
    is_mic: number;
    is_raise_hand: number;
    room_details: Room;
    room_id: number;
    user_id: number;
    room_name: string;
    group_id: number;
}