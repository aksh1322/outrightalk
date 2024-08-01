<?php

namespace App\Http\Controllers\Api;

use App\Helpers\Helper;
use App\Http\Controllers\Controller;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Models\RoomChat;
use App\Models\RoomChatSaveStatus;
use Auth;
use Illuminate\Http\Request;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use App\Services\SendBirdChannelService;

class ChatController extends Controller
{

    public function __construct($parameters = array())
    {
        parent::__construct($parameters);

        $this->_model = new RoomChat();
        $this->middleware(function ($request, $next) {
            $this->_user = Auth::user();
            return $next($request);
        });

    }

    public $successStatus = 200;

    public function getChatHistory(Request $request)
    {
        try {
            $data = [];
            $path = public_path('pdf');

            $files = scandir($path);
            //dd($files);

            $actual_link = (empty($_SERVER['HTTPS']) ? 'http' : 'https') . "://$_SERVER[HTTP_HOST]";

            foreach ($files as $key => $value) {
                if ($value != "." || $value == "..") {
                    if (str_contains($value, '_' . Auth::id() . '_')) {
                        if (str_contains($value, 'room' . '_')) {
                            $data['fileUrls']['room'][] = ["name" => $value, "url" => $actual_link . '/pdf/' . $value];
                        }
                        if (str_contains($value, 'pm' . '_')) {
                            $data['fileUrls']['pm'][] = ["name" => $value, "url" => $actual_link . '/pdf/' . $value];
                        }

                    }
                }
            }

            if (isset($data['fileUrls']['room'])) {
                $data['fileUrls']['room'] = array_reverse($data['fileUrls']['room']);
            }

            if (isset($data['fileUrls']['pm'])) {
                $data['fileUrls']['pm'] = array_reverse($data['fileUrls']['pm']);
            }


            return Helper::rj('Record found', 200, $data);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }

    }

    public function getAllChats(Request $request, SendBirdChannelService $sendBirdChannelService)
    {
        // $user = \App\Models\User::where('id', $this->_user->id)->first();
        // $userModel = new \App\Models\User();
        // $userData = $userModel->userWithAppends($user);
        // dd($userData->is_subscribed);


        try {
            $validationRules = [
                'room_id' => 'required',
                'isPM' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {


                $details = [];

                if ($request->isPM) {
                    $pm = \App\Models\Pm::where('id', $request->room_id)->first();

                    if (!$pm) {
                        return \App\Helpers\Helper::rj('Bad Request', 400, [
                            'errors' => ['Invalid PM ID, PM not found']
                        ]);

                        return $response;
                    }



                    $pmUserObj = new \App\Models\PmUser();
                    $details = $pmUserObj->getListing([
                        'pm_id' => $request->room_id,
                        'user_id' => Auth::id()
                        //'get_sql' => 1
                    ])->pluck('timezone', 'user_id')->toArray();

                    //dd($details);

                    //

                } else {

                    $room = \App\Models\Room::where('id', $request->room_id)->first();

                    if (!$room) {
                        return \App\Helpers\Helper::rj('Bad Request', 400, [
                            'errors' => ['Invalid Room ID, Room not found']
                        ]);

                        return $response;
                    }


                    $roomUserObj = new \App\Models\RoomUser();

                    $details = $roomUserObj->getListing([
                        'room_id' => $request->room_id,
                        'user_id' => Auth::id(),
                        'with' => ['roomDetails']

                        //'get_sql' => 1
                    ])->pluck('roomDetails.room_name', 'timezone')->toArray();

                }

                // dd($details);






                // if ($input['to_user_id']) {
                //     $users = $roomUserObj->getListing([
                //         'room_id' => $input['room_id'],
                //         'user_id' => [$this->_user->id, (int) $input['to_user_id']]
                //     ])->pluck('timezone', 'user_id')->toArray();
                // }

                // $saveDataStatus = RoomChatSaveStatus::where(['user_id' => Auth::id(), 'room_id' => $request->room_id])->first();

                // if (!$saveDataStatus) {
                //     $saveDataStatus = RoomChatSaveStatus::create(['user_id' => Auth::id(), 'room_id' => $request->room_id]);
                // }
                // $status = $saveDataStatus->status == 0 ? true : false;

                $srch_params = $request->all();


                /*$srch_params['user_id'] = $this->_user->id;
                if (isset($srch_params['order_by'])) {
                    if ($srch_params['order_by'] == 'asc') {
                        $srch_params['orderBy'] = 'id';
                    } else {
                        $srch_params['orderBy'] = '-id';
                    }
                }
                $srch_params['with'] = [
                    'userDetails' => function ($q) { return $q->select('id', 'username', 'first_name', 'last_name'); },
                    'toUserDetails' => function ($q) { return $q->select('id', 'username', 'first_name', 'last_name'); }
                ];
                $data['list'] = $this->_model->getListing($srch_params);*/
                $data['chatfile'] = null;
                $cdn = \App\Models\Cdn::where("status", 1)->first();
                $file_path = "storage/" . $cdn->cdn_path . "chats" . "/";
                $fonts_path = "storage/fonts/";
                $file_name = ($request->isPM ? "pmc_" : "c_") . $srch_params['room_id'] . "_" . $this->_user->id . ".json";

                //print_r($file_name);



                if (file_exists($file_path . $file_name)) {

                    // if($status == true){
                    //     unlink($file_path . $file_name);
                    // }else{
                    $inp = file_get_contents($file_path . $file_name);

                    $data['chatfile'] = json_decode($inp, true);
                    // }
                }
                //$channelMessages = $sendBirdChannelService->getUserChannelMessages();
                //dd($data);
                if ($request->download) {
                    $langFonts = config('services.langFont');

                    $settings = new \App\Models\SiteSettingUserStructure();
                    $setting = $settings->getListing([
                        'key' => 'current_translation_language',
                        'user_id' => $this->_user->id
                    ]);

                    $current_translation_language = $setting->val;

                    $font_family = $langFonts && $current_translation_language && isset($langFonts[$current_translation_language]) ? $langFonts[$current_translation_language] : 'Noto Sans';
                    //dd($font_family);

                    $html = '<html>
                                <head>
                                    <title>Chat</title>
                                    <meta charset="utf-8">
                                    <meta name="viewport" content="width=device-width, initial-scale=1">
                                    
                                    
                                    <link href="https://fonts.googleapis.com/css2?family=MonteCarlo:wght@100;200;300;400;500;600;700;800;900&display=swap"
                                    rel="stylesheet">
                                    <link href="https://fonts.googleapis.com/css2?family=MonteCarlo:wght@100;200;300;400;500;600;700;800;900&display=swap"
                                     rel="stylesheet">
                                     <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;200;300;400;500;600;700;800;900&display=swap"
                                     rel="stylesheet">
                                     <link href="https://fonts.googleapis.com/css2?family=Lato:wght@100;200;300;400;500;600;700;800;900&display=swap"
                                     rel="stylesheet">
                                     <link href="https://fonts.googleapis.com/css2?family=Comic%20Sans%20MS:wght@100;200;300;400;500;600;700;800;900&display=swap"
                                     rel="stylesheet">
                                     <link href="https://fonts.googleapis.com/css2?family=Open%20Sans:wght@100;200;300;400;500;600;700;800;900&display=swap"
                                     rel="stylesheet">
                                    <link href="https://fonts.googleapis.com/css2?family=Noto%20Sans:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
                                    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Gurmukhi:wght@100..900&display=swap" rel="stylesheet">
                                    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@100..900&display=swap" rel="stylesheet">
                                    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@100..900&display=swap" rel="stylesheet">
                                    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@100..900&display=swap" rel="stylesheet">
                                    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@100..900&display=swap" rel="stylesheet">
                                    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100..900&display=swap" rel="stylesheet">
                                    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap" rel="stylesheet">
                                    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@100..900&family=Noto+Sans+JP:wght@100..900&display=swap" rel="stylesheet">
                                    <link href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400..700&family=Noto+Sans+TC:wght@100..900&display=swap" rel="stylesheet">
                                    
                                     
                                    <style>
                                        @font-face {
                                            font-family: "Poppins";
                                            src: https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap;
                                            font-weight: normal;
                                            font-style: normal;
                                        }
                                        @font-face {
                                            font-family: "MonteCarlo";
                                            src: https://fonts.googleapis.com/css2?family=MonteCarlo:wght@100;200;300;400;500;600;700;800;900&display=swap;
                                            font-weight: normal;
                                            font-style: normal;
                                        }
                                        @font-face {
                                            font-family: "Poppins";
                                            src: https://fonts.googleapis.com/css2?family=Roboto:wght@100;200;300;400;500;600;700;800;900&display=swap;
                                            font-weight: normal;
                                            font-style: normal;
                                        }
                                        @font-face {
                                            font-family: "Poppins";
                                            src: https://fonts.googleapis.com/css2?family=Lato:wght@100;200;300;400;500;600;700;800;900&display=swap;
                                            font-weight: normal;
                                            font-style: normal;
                                        }
                                        @font-face {
                                            font-family: "Poppins";
                                            src: https://fonts.googleapis.com/css2?family=Comic%20Sans%20MS:wght@100;200;300;400;500;600;700;800;900&display=swap;
                                            font-weight: normal;
                                            font-style: normal;
                                        }

                                        
                                         body {
                                            display: flex;
                                            justify-content: center;
                                            align-items: center;
                                            background: #c2ccd9;
                                            font-family: Noto Sans SC;
                                            font-size: 16px !important;
                                            font-weight: 500 !important;
                                        }
                                        .normalMsg {
                                            text-align: center;
                                        }

                                        .userImg {

                                            align-items: center;
                                            text-align: center;
                                            width: 30px;
                                            height: 30px;
                                            background-color: #f2f2f2;
                                            border-radius: 50%;
                                            font-size: 20px;
                                            font-weight: bold;
                                        }

                                        .chat {
                                            width: 100%;
                                        }

                                        .chatMsg {
                                            display: flex;
                                            margin-bottom: 20px;
                                            margin-left: 20px;
                                        }

                                        .userImg img {
                                            width: 40px;
                                            height: 40px;
                                            object-fit: cover;
                                            border-radius: 50%;
                                        }

                                        .userInfo p {
                                            margin: 0px;
                                        }

                                       
                                        .rightMsg p.userInfo > span.userName {
                                            text-align: right;
                                        }

                                        p.userInfo > span.userName {
                                            color: #fff;
                                            font-weight: 700;
                                            margin-left: 10px;
                                        }

                                        
                                        
                                        p.userMsg {
                                            max-width: 500px;
                                            padding: 12px 15px;
                                            border-radius: 12px;
                                            background: #fff;
                                            margin-top: 5px !important;
                                            box-shadow: 0px 0px 10px 0px #b9b9b9;
                                            font-size: 17px;
                                            font-weight: 400;
                                        }



                                        .leftMsg .userMsg {
                                            border-top-left-radius: 0;
                                        }

                                        .leftMsg .sticker {
                                            background: transparent;
                                            box-shadow: none;
                                        }



                                        .rightMsg .userMsg {
                                            border-top-right-radius: 0;
                                        }

                                        .chatMsg.rightMsg {
                                            flex-direction: row-reverse;
                                        }
                                    </style>
                                </head>
                                <body>
                                <section class="chat" id="createImg">
                                    <div class="chatPanel">';
                    if (is_array($data['chatfile'])) {
                        foreach ($data['chatfile'] as $key => $allData) {
                            $user = \App\Models\User::where('id', $allData['user_id'])->first();
                            $userModel = new \App\Models\User();
                            $userData = $userModel->userWithAppends($user);
                            $allData['user_details'] = $userData;
                            //dd($allData['user_details']['is_subscribed']->planInfo->color_code);

                            if ($key == 0) {
                                $html .= '<br/>';
                            }

                            if ($allData) {

                                if (!$request->isPM && ($allData['type'] == 'welcome' || $allData['type'] == 'join' || $allData['type'] == 'exit')) {

                                    if ($allData['type'] == 'welcome' || (($allData['type'] == 'join' || $allData['type'] == 'exit') && $allData['user_id'] != $this->_user->id)) {

                                        $html .= '<div class="normalMsg">';

                                        if ($allData['type'] == 'join' || $allData['type'] == 'exit') {
                                            if (isset($allData['user_details']['is_subscribed']->planInfo->color_code)) {
                                                $html .= '<p><span style="font-weight: 700; color:' . $allData['user_details']['is_subscribed']->planInfo->color_code . '">';
                                            } else {
                                                $html .= '<span class="userName">';
                                            }

                                            $from_customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
                                                ->where(['for_user_id' => $allData['user_id'], 'user_id' => Auth::id()])
                                                ->first();

                                            $html .= $from_customized_nickname ? $from_customized_nickname : $allData['user_details']['username'] . '</span><span> has just ' . ($allData['type'] == 'join' ? 'joined' : 'left') . ' the room</span></p>';
                                        } else {
                                            $html .= $allData['chat_body'];
                                        }

                                        $html .= '</div>';

                                    }



                                } else {

                                    $html .= '<div class="chatMsg leftMsg">
                                            <p class="userInfo">
                                                <span class="userImg">';
                                    if (isset($allData['user_details'])) {
                                        if (isset($allData['user_details']['avatar']) && isset($allData['user_details']['avatar']) && $allData['user_details']['avatar']["thumb"]) {
                                            // $html .= '<img src="https://outrightalk-backend.s3.amazonaws.com/assets/u/1712916550761591951.jpg">';
                                            $html .= '<img src=' . $allData['user_details']['avatar']["thumb"] . '>';
                                        } else {
                                            $html .= strtoupper(substr($allData['user_details']['username'], 0, 1));
                                        }
                                    }


                                    $html .= '</span>';
                                    if (isset($allData['user_details'])) {


                                        if (isset($allData['user_details']['is_subscribed']->planInfo->color_code)) {
                                            $html .= '<span style="margin-left: 10px !important; font-weight: 700; color:' . $allData['user_details']['is_subscribed']->planInfo->color_code . '">';
                                        } else {
                                            $html .= '<span class="userName">';
                                        }

                                        $from_customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
                                            ->where(['for_user_id' => $allData['user_id'], 'user_id' => Auth::id()])
                                            ->first();

                                        $html .= $from_customized_nickname ? $from_customized_nickname : $allData['user_details']['username'] . '</span>';

                                        $html .= isset($allData['post_converted_timestamp']) ? '&nbsp;<span>' . $allData['post_converted_timestamp'] . '</span></p>' : '';

                                    }

                                    if (isset($allData['type']) && $allData['type'] == "sticker") {
                                        $html .= '<p class="sticker">';
                                    } else {
                                        $html .= '<p class="userMsg">';
                                    }


                                    $html .= stripslashes($allData['chat_body']) . '</p>';
                                    if (isset($allData['translations']) && count($allData['translations'])) {
                                        foreach ($allData['translations'] as $translation) {
                                            if (isset($translation[$current_translation_language])) {
                                                $html .= '<p class="userMsg">' . stripslashes($translation[$current_translation_language]) . '</p>';
                                            }
                                        }

                                    }
                                    $html .= '</div>';
                                }
                            }

                        }
                    }
                    $html .= '</div>
                    
                                </section>
                                 
                                </body>
                            </html>';

                    //dd($html);
                    $options = new Options();
                    $options->set('isHtml5ParserEnabled', true);
                    $options->set('isRemoteEnabled', true);
                    $options->set('isFontSubsettingEnabled', true);
                    $pdf = new Dompdf();
                    $pdf->loadHtml($html, "UTF-8");
                    $pdf->setPaper('A4', 'portrait');
                    $pdf->setOptions($options);
                    $pdf->render();
                    //dd($pdf);

                    $filename = ($request->isPM ? 'pm' : 'room') . '_' . $request->room_id . '_' . Auth::id() . '_' . date('Y_m_d-H:i:s') . '.pdf';

                    if ($details) {
                        $system_timezone = date_default_timezone_get();

                        if ($request->isPM) {
                            $user = \App\Models\PmUser::where('pm_id', $request->room_id)->where('user_id', '!=', Auth::id())->with('userInfo')->get()->pluck('userInfo.username')->toArray();

                            foreach ($details as $user_id => $timezone) {

                                if ($timezone != "1") {
                                    date_default_timezone_set($timezone);
                                }



                                if ($user) {
                                    $nicknamesString = collect(array_unique($user))->implode('_');
                                    $filename = 'pm' . '_' . strtolower($nicknamesString) . '_' . Auth::id() . '_' . date('Y_m_d-H:i:s') . '.pdf';

                                } else {
                                    $filename = 'pm' . '_' . $request->room_id . '_' . Auth::id() . '_' . date('Y_m_d-H:i:s') . '.pdf';
                                }

                            }

                        } else {
                            foreach ($details as $timezone => $room_name) {

                                if ($timezone != "1") {
                                    date_default_timezone_set($timezone);
                                }

                                $filename = 'room' . '_' . (!$request->isPM ? str_replace(" ", "_", strtolower($room_name)) : '') . '_' . $request->room_id . '_' . Auth::id() . '_' . date('Y_m_d-H:i:s') . '.pdf';

                                date_default_timezone_set($system_timezone);

                            }
                        }

                        date_default_timezone_set($system_timezone);

                    }


                    $output = $pdf->output();

                    $directoryPath = public_path('pdf');

                    if (!File::exists($directoryPath)) {
                        File::makeDirectory($directoryPath);
                    }

                    $path = public_path('pdf/' . $filename);
                    file_put_contents($path, $output);

                    // // uploading file into s3 server
                    // $destination = $cdn->cdn_path . "chats/" . $filename;
                    // //($fileExt && strpos($fileExt, ".") ? '.' . $fileExt : '');
                    // $upload = Helper::s3UploadLargeFile($destination, $path);

                    // if ($upload) {
                    //     dd($upload);
                    //     // unlink from local server
                    //     //@unlink($path);


                    //     \App\Models\File::create([
                    //         'entity_id' => $this->_user->id,
                    //         'entity_type' => 0,
                    //         'cdn_id' => $cdn->id,
                    //         'file_name' => $filename,
                    //         'file_name_original' => $filename,
                    //         'file_ext' => '.pdf',
                    //         'file_mime' => 'application/pdf',
                    //         'location' => 'chats',
                    //         'file_size' => 0,
                    //     ]);

                    //     $upFile = \App\Models\File::where(['entity_id' => $this->_user->id, 'entity_type' => 0, 'file_name' => $filename])->first();

                    //     dd($upFile);

                    // }

                    $actual_link = (empty($_SERVER['HTTPS']) ? 'http' : 'https') . "://$_SERVER[HTTP_HOST]";
                    $resp = [];
                    $resp['fileUrl'] = $actual_link . '/pdf/' . $filename;
                    //$data['fileUrl'] = $path;
                    // Store the PDF in the storage folder
                    // $path = $filename;
                    // // $storagePath = storage_path('app/public');
                    // // if (!file_exists($storagePath)) {
                    // //     mkdir($storagePath, 0777, true);
                    // // }
                    // // $pdfPath = $storagePath . '/' . $filename;
                    // // Storage::put($filename, $output);
                    // Storage::disk('public')->put($path, $output);
                    // // Download the PDF
                    // // Storage::put($path, $output);

                    // $headers = [
                    //     'Content-Type' => 'application/pdf',
                    // ];

                    // // download(storage_path('app/public/' . $path), $filename, $headers);
                    // $fileUrl = asset('storage/' . $path);


                    // $publicPath = public_path('pdf/'. $filename);
                    // File::copy($pdfPath, $publicPath);


                    return Helper::rj('Pdf generate successfully', 200, $resp);
                    // return response()->json(['pdf_url'=>$fileUrl]);

                    // $filename = 'sample.pdf';
                    // $output = $pdf->save($path  . $filename);
                    // $path = 'pdfs/' . $filename;
                    // Storage::disk('public')->put($path, $output);
                    // return true ;
                }

                return Helper::rj('Record found', 200, $data);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function postChats(Request $request)
    {
        try {
            $validationRules = [
                'room_id' => 'required',
                'chat_body' => 'required',
                'type' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $input = $request->all();
                $antiflood = \App\Models\RoomSetting::where(['room_id' => $input['room_id'], 'anti_flood' => 1])->first();
                if ($antiflood) {
                    $current_time = ((new \DateTime())->format("Y-m-d H:i:s"));
                    $data = RoomChat::select("created_at")
                        ->where('room_id', $input['room_id'])
                        ->where('user_id', $this->_user->id)
                        ->latest()
                        ->first();

                    if ($data) {
                        $differenceInSeconds = strtotime($current_time) - strtotime($data->created_at);
                        if ($differenceInSeconds < 5) {
                            return \App\Helpers\Helper::rj('Bad Request', 400, [
                                'errors' => 'Sorry, you cannot post messages continuously.'
                            ]);

                        }
                    }
                }
                $input['user_id'] = $this->_user->id;
                if (is_null($input['to_user_id'])) {
                    $input['to_user_id'] = 0;
                }
                $input['chat_body'] = $this->__filterChat($input['room_id'], $input['chat_body']);
                $chat = RoomChat::create($input);

                //fetch all users
                $users = [];
                $roomUserObj = new \App\Models\RoomUser();
                $users = $roomUserObj->getListing([
                    'room_id' => $input['room_id'],
                    'chat_block_user' => $this->_user->id,
                    'chat_ignore_user' => $this->_user->id,
                    //'get_sql' => 1
                ])->pluck('timezone', 'user_id')->toArray();

                if ($input['to_user_id']) {
                    $users = $roomUserObj->getListing([
                        'room_id' => $input['room_id'],
                        'user_id' => [$this->_user->id, (int) $input['to_user_id']]
                    ])->pluck('timezone', 'user_id')->toArray();
                }
                $chatdtls = [];
                if (count($users)) {
                    $cdn = \App\Models\Cdn::where("status", 1)->first();
                    $chat_array = $chat->toArray();
                    $file_path = public_path("storage/" . $cdn->cdn_path . "chats" . "/");
                    foreach ($users as $user => $timezone) {
                        $file_name = "c_" . $input['room_id'] . "_" . $user . ".json";
                        $chat_array['post_converted_timestamp'] = $this->__convertTimetoLocalTime($chat_array['post_timestamp'], $timezone);
                        unset($chat_array['view_user_id']); // This only for socket push
                        $customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
                            ->where(['for_user_id' => $this->_user->id, 'user_id' => $user])
                            ->first();
                        $chat_array['customize_nickname'] = ($customized_nickname) ? $customized_nickname->toArray() : $customized_nickname;


                        if (!file_exists($file_path)) {
                            mkdir($file_path, 0777, true);
                        }

                        if (file_exists($file_path . $file_name)) {
                            $inp = file_get_contents($file_path . $file_name);
                            $tempArray = json_decode($inp, true);
                            array_push($tempArray, $chat_array);
                            $jsonData = json_encode($tempArray);
                            file_put_contents($file_path . $file_name, $jsonData);
                            $chat_array['view_user_id'] = $user;
                            array_push($chatdtls, $chat_array);
                        } else {
                            $fp = fopen($file_path . $file_name, 'w');
                            $tempArray = [];
                            array_push($tempArray, $chat_array);
                            fwrite($fp, json_encode($tempArray));
                            fclose($fp);
                            $chat_array['view_user_id'] = $user;
                            array_push($chatdtls, $chat_array);
                        }
                    }
                }
                if (isset($input['to_user_id']) && $input['to_user_id']) {
                    if ($input['keep_whisper_channel']) {
                        $isNotExist = \App\Models\WhisperChannel::where([
                            'room_id' => $input['room_id'],
                            'user_id' => $this->_user->id,
                            'to_user_id' => $input['to_user_id']
                        ])->doesntExist();
                        if ($isNotExist) {
                            \App\Models\WhisperChannel::create([
                                'room_id' => $input['room_id'],
                                'user_id' => $this->_user->id,
                                'to_user_id' => $input['to_user_id']
                            ]);
                        }
                    } else {
                        \App\Models\WhisperChannel::where([
                            'room_id' => $input['room_id'],
                            'user_id' => $this->_user->id,
                            'to_user_id' => $input['to_user_id']
                        ])->delete();
                    }
                }

                // $chatJob = new \App\Jobs\SendChatJob($chatdtls);
                // dispatch($chatJob);
                Helper::emit($chatdtls, 'chatMessage');

                return Helper::rj('Message has been successfully posted.', $this->successStatus, $chat);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function saveChats(Request $request)
    {
        try {
            $validationRules = [
                'room_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $cdn = \App\Models\Cdn::where("status", 1)->first();
                $file_path = "storage/" . $cdn->cdn_path . "chats" . "/";
                $file_name = "c_" . $request->room_id . "_" . $this->_user->id . ".json";

                if (!file_exists($file_path)) {
                    mkdir($file_path, 0777, true);
                }

                if (file_exists($file_path . $file_name)) {
                    $inp = file_get_contents($file_path . $file_name);
                    $file_name = now . ".txt";
                    $fp = fopen($file_path . $file_name, 'w');
                    fwrite($fp, $inp);
                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }


    private function __convertTimetoLocalTime($post_time, $timezone)
    {
        $converted_time = Helper::convertGMTToLocalTimezone($post_time, $timezone);
        return Helper::showdate($converted_time);
    }

    private function __filterChat($room_id, $chat_body = null)
    {
        $room = \App\Models\Room::select('filter_words', 'is_comma_separated')->find($room_id);

        if ($room->filter_words) {
            $badwords = $replacewith = [];
            $index = 0;
            if ($room->is_comma_separated) {
                $badwords = array_map('trim', explode(',', $room->filter_words));
            } else {
                array_push($badwords, $room->filter_words);
            }

            foreach ($badwords as $value) {
                $lengthOfStars = strlen($badwords[$index]) - 2;
                $replacewith[$index] = substr($badwords[$index], 0, 1) . str_repeat("*", $lengthOfStars) . substr($badwords[$index], -1);
                $index++;
            }
            $chat_body = str_ireplace($badwords, $replacewith, $chat_body);
        }
        return $chat_body;
    }

    public function clearAllChatForMe(SendBirdChannelService $sendBirdChatService)
    {
        try {

            $user_id = Auth::id();

            //remove chat from all pms

            $pmUserObj = new \App\Models\PmUser();
            $pmUsers = $pmUserObj->getListing(['user_id' => $user_id, 'with' => ['pm']]);

            //dd($pms);
            $cdn = \App\Models\Cdn::where("status", 1)->first();
            $file_path = "storage/" . $cdn->cdn_path . "chats" . "/";

            if ($pmUsers) {
                foreach ($pmUsers as $pmUser) {
                    $file_name = "pmc_" . (int) $pmUser->pm->id . "_" . $user_id . ".json";

                    if (file_exists($file_path . $file_name)) {
                        unlink($file_path . $file_name);

                        if ($pmUser->is_close == 0) {
                            $fp = fopen($file_path . $file_name, 'w');
                            $tempArray = [];
                            fwrite($fp, json_encode($tempArray));
                            fclose($fp);
                        }
                    }

                    $sendBirdChatService->resetMyChatHistory($user_id . '', $pmUser->pm->send_bird_channel_url);
                }
            }

            //remove chat from all rooms

            $roomUserObj = new \App\Models\RoomUser();
            $roomUsers = $roomUserObj->getListing(['user_id' => $user_id, 'with' => ['room']]);
            //dd($rooms);
            if ($roomUsers) {

                foreach ($roomUsers as $roomUser) {

                    $file_name = "c_" . $roomUser->room->id . "_" . $user_id . ".json";


                    if (file_exists($file_path . $file_name)) {
                        unlink($file_path . $file_name);

                        if ($roomUser->room->welcome_message) {
                            $chat_array = [
                                'room_id' => $roomUser->room->id,
                                'chat_body' => $roomUser->room->welcome_message,
                                'to_user_id' => 0,
                                'type' => 'welcome',
                                'user_id' => $user_id,
                            ];
                            $fp = fopen($file_path . $file_name, 'w');
                            $tempArray = [];
                            array_push($tempArray, $chat_array);
                            fwrite($fp, json_encode($tempArray));
                            fclose($fp);
                        }
                    }

                    //dd($roomUser);

                    $sendBirdChatService->resetMyChatHistory($user_id . '', $roomUser->room->send_bird_channel_url);

                }

            }

            return Helper::rj('All Chat has been cleared for you successfully .', 200, []);

        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }



    }


    public function saveChatTranslations(Request $request)
    {
        try {

            $validationRules = [
                'pm_id' => 'required | numeric',
                'message_id' => 'required | numeric',
                'translations' => 'array|min:1|required',
                'translations.*' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                if ($request->message_id == 0) {
                    return Helper::rj('Can\'t save translation for file');
                }
                $cdn = \App\Models\Cdn::where("status", 1)->first();
                $file_path = "storage/" . $cdn->cdn_path . "chats" . "/";
                $file_name = "pmc_" . $request->pm_id . "_" . $this->_user->id . ".json";

                if (!file_exists($file_path)) {
                    throw new \Exception('Something went wrong!');
                }

                if (file_exists($file_path . $file_name)) {
                    $inp = file_get_contents($file_path . $file_name);
                    $tempArray = json_decode($inp, true);
                    if ($tempArray && count($tempArray)) {
                        foreach ($tempArray as $key => $tmpChat) {
                            if (isset($tmpChat['message_id']) && $tmpChat['message_id'] == $request->message_id) {
                                $allTranslation = [];
                                foreach ($request->translations as $translation) {
                                    $allTranslation[$translation['lang_code']] = $translation['message'];

                                }
                                if (!isset($tmpChat['translations'])) {
                                    $tmpChat['translations'] = $allTranslation;
                                } else {
                                    array_push($tmpChat['translations'], $allTranslation);
                                }
                                $tempArray[$key] = $tmpChat;
                                break;
                            }
                        }
                        $jsonData = json_encode($tempArray);
                        file_put_contents($file_path . $file_name, $jsonData);
                        return Helper::rj('Translation has been saved successfully for message in a PM.', 200, []);
                    }

                }
            }

        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

}
