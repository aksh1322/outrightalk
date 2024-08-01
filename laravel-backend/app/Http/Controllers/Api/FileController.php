<?php

namespace App\Http\Controllers\Api;

use App\Helpers\Helper;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Models\SendFile;
use Auth;
use Illuminate\Http\Request;
use App\Models\SendFileUser;
use DB;


class FileController extends Controller
{

    public function __construct($parameters = array())
    {
        parent::__construct($parameters);
        $this->middleware(function ($request, $next) {
            $this->_user = Auth::user();
            return $next($request);
        });
    }

    public function sendFile(Request $request)
    {
        DB::beginTransaction();

        try {
            $fileValidations = \App\Models\File::$fileValidations['audio_video'];
            $validationRules = [
                'user_id' => 'array|min:1|required',
                'user_id.*' => 'required|exists:users,id',
                'file' => 'required|max:5120|mimetypes:' . implode(",", $fileValidations['file_mimes'])
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);

            } else {
                $input = $request->all();
                $path = 'shareFiles';
                $path = Storage::disk('s3')->put($path, $request->file);
                $url = Storage::disk('s3')->url($path);
                $file = SendFile::create([
                    'url' => $url,
                    'path' => $path,
                    'sender_id' => $this->_user->id
                ]);
                $data['file_invite_id'] = $file->id;
                $data['url'] = $url;
                foreach ($request->user_id as $user) {
                    SendFileUser::create([
                        'receiver_id' => $user,
                        'send_file_id' => $file->id
                    ]);

                    $from_customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
                        ->where(['for_user_id' => $this->_user->id, 'user_id' => $user])
                        ->first();
                    $record = \App\Models\Notification::create([
                        'from_user_id' => $this->_user->id,
                        'to_user_id' => $user,
                        'type' => 'file',
                        'file_id' => $file->id,
                        'url' => $url,
                        'message' => (($from_customized_nickname) ? $from_customized_nickname->nickname : $this->_user->username) . ' has sent a file to you.',
                    ]);


                    $data['user'][] = $record;
                    $record->delete();
                }
                Helper::emit($data, 'sendFileInvite');
                DB::commit();
                return Helper::rj('File has been sent successfully.', 200, []);
            }
        } catch (\Exception $e) {
            DB::rollback();
            return Helper::rj($e->getMessage(), 500);
        }
    }


    public function downloadFile(Request $request)
    {
        DB::beginTransaction();

        try {
            $validationRules = [
                'file_id' => 'required|exists:send_files,id',
            ];

            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);

            } else {
                $input = $request->all();
                // Find the SendFile record by file_id
                $file = SendFile::with('shareFiles')->find($request->file_id);

                // Check if the file exists
                if (!$file) {
                    return response()->json(['error' => 'File not found'], 404);
                }

                // Find the related shareFiles record for the logged-in user
                $shareFile = $file->shareFiles->where('receiver_id', $this->_user->id)->first();

                // Check if the shareFiles record exists
                if ($shareFile) {
                    // Delete the shareFiles record
                    $shareFile->delete();
                }

                $file->refresh();

                if ($file->shareFiles->count() == 0) {
                    Storage::disk('s3')->delete($file->path);
                    // Delete the SendFile record
                    $file->delete();
                }

                DB::commit();
                return Helper::rj('File has been downloaded successfully.', 200, []);
            }
        } catch (\Exception $e) {
            DB::rollback();
            return Helper::rj($e->getMessage(), 500);
        }
    }

}
