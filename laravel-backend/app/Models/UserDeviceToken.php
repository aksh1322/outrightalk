<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserDeviceToken extends Model {

    protected $table = 'user_device_tokens';
    protected $fillable = [
        'user_id',
        'device_type',
        'device_token'
    ];

    public static function sendPush($user_id = null, $data_ios = [], $data_android = []) {
        if (\Config::get('settings.fcm_api_key')) {
            $devices = self::select('device_token','device_type','user_id');

            if ($user_id) {
                if (is_array($user_id)) {
                    $devices->whereIn('user_id', $user_id);
                } else {
                    $devices->where("user_id", $user_id);
                }
            }

            $devices = $devices->get();

            if ($devices->count()) {
                $header = [
                    'Content-Type: application/json',
                    'Authorization: key=' . \Config::get('settings.fcm_api_key')
                ];
                foreach ($devices as $key => $value) {
                    if ($value->device_type == 'iOS') {
                        $data_ios['to'] = $value->device_token;                        
                        $response = callAPI('https://fcm.googleapis.com/fcm/send', $data_ios, 'POST', $header);
                        $push_response = [
                            'response' => json_encode($data_ios),
                            'callback_response' => $response,
                            'user_id' => $value->user_id
                        ];
                    } else {
                        $data_android['to'] = $value->device_token;                        
                        $response = callAPI('https://fcm.googleapis.com/fcm/send', $data_android, 'POST', $header);
                        $push_response = [
                            'response' => json_encode($data_android),
                            'callback_response' => $response,
                            'user_id' => $value->user_id
                        ];
                    } 
                    PushLog::create($push_response);
                }
            }
        }
    }

    public static function subscribe($user, $device_type = null, $device_token = null) {
        if ($device_token) {
            $device = self::where("device_token", $device_token)->first();
            if ($device) {
                // if device token found, but 
                // user is different, it will
                // update the user
                if ($device->user_id != $user->id) {
                    $device->user_id = $user->id;
                    $device->save();
                }
            } else {
                // Create a new device token.
                $device = self::create([
                            'device_type' => $device_type,
                            'device_token' => $device_token,
                            'user_id' => $user->id
                ]);
            }
            return $device;
        }
        return false;
    }

    public static function unsubscribe($device_token) {
        return self::where("device_token", $device_token)->delete();
    }

}
