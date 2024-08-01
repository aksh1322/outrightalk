<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use App\Helpers\Helper;
use App\Models\NoteBook;
use Auth;

class NotebookController extends Controller
{

    public function __construct($parameters = array())
    {
        parent::__construct($parameters);
        $this->_model = new NoteBook();
        $this->middleware(function ($request, $next) {
            $this->_user = Auth::user();
            return $next($request);
        });
    }

    public function create(Request $request)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'notebook_title' => 'required|max:255',
                'description' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $input['user_id'] = $this->_user->id;
                $notebook = NoteBook::create($input);
                \App\Models\NoteBookShare::create([
                    'notebook_id' => $notebook->id,
                    'share_user_id' => $notebook->user_id,
                    'is_viewed' => 1,
                ]);
                return Helper::rj('Notebook information saved successfully.', 200, []);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function update(Request $request)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'notebook_id' => 'required',
                'notebook_title' => 'required|max:255',
                'description' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $user = $this->_user;
                $input['modified_by'] = $user->id;
                $data = $this->_model->getListing([
                    'id' => $input['notebook_id'],
                    'with' => [
                        'isShare' => function ($q) use ($user) {
                            return $q->select('note_book_shares.*')->join('note_books', function ($join) use ($user) {
                                $join->on('note_books.id', 'note_book_shares.notebook_id')
                                    ->where('note_books.user_id', $user->id);
                            })
                                ->where('is_sharable', 1);
                        }
                    ],
                    //'get_sql' => 1
                ]);
                if ($data) {
                    $data->update($input);
                    return Helper::rj('Notebook updated successfully.', 200, $data);
                } else {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'Something went wrong. Please try again later.'
                    ]);

                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function allList(Request $request)
    {
        try {
            $user = $this->_user;
            $data = $this->_model->getListing([
                'user_id' => $this->_user->id,
                'with' => [
                    'isShare' => function ($q) use ($user) {
                        return $q->select('note_book_shares.*')->join('note_books', function ($join) use ($user) {
                            $join->on('note_books.id', 'note_book_shares.notebook_id')
                                ->where('note_books.user_id', $user->id);
                        })
                            ->where('is_sharable', 1);
                    },
                    'isEditable' => function ($q) {
                        $q->select('site_setting_users.*')->join('site_setting_user_structures', function ($join) {
                            $join->on('site_setting_user_structures.id', 'site_setting_users.site_setting_id')
                                ->where('key', 'permit_other_edit_notes')
                                ->where('group_name', 'notebook');
                        })
                            ->where('val', 1);
                    }
                ],
                /*'get_sql' => 1*/
            ]);
            if (count($data)) {
                foreach ($data as $key => $d) {
                    $data[$key]->isShare = ($d->isShare) ? 1 : 0;
                }
            }
            return Helper::rj('Record found.', 200, $data);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function share(Request $request)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'notebook_id' => 'required',
                'share_user_id' => 'array|min:1|required',
                'share_user_id.*' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                if (count($input['share_user_id'])) {
                    foreach ($input['share_user_id'] as $user_id) {
                        \App\Models\NoteBookShare::create([
                            'notebook_id' => $input['notebook_id'],
                            'share_user_id' => $user_id,
                            'is_sharable' => 1
                        ]);
                        $param['user'][] = [
                            'id' => $user_id,
                        ];
                        $vvObj = new \App\Models\VoiceVideoMessage();
                        $parmeter['user'][] = [
                            'id' => $user_id,
                            'unread_notbook_cnt' => \App\Models\NoteBookShare::where(['share_user_id' => $user_id, 'is_viewed' => 0])->count(),
                            'unread_voicemail_cnt' => $vvObj->getListing([
                                'user_id' => $user_id,
                                'is_view' => 0,
                                'type' => 'voice',
                                'current_time' => (new \DateTime())->format("Y-m-d H:i"),
                                'count' => 1
                            ]),
                            'unread_videomsg_cnt' => $vvObj->getListing([
                                'user_id' => $user_id,
                                'is_view' => 0,
                                'type' => 'video',
                                'current_time' => (new \DateTime())->format("Y-m-d H:i"),
                                'count' => 1
                            ])
                        ];
                    }
                    $param['notebook_info'] = $this->_model->getListing([
                        'id' => $input['notebook_id'],
                        'with' => [
                            'isEditable' => function ($q) {
                                $q->select('site_setting_users.*')->join('site_setting_user_structures', function ($join) {
                                    $join->on('site_setting_user_structures.id', 'site_setting_users.site_setting_id')
                                        ->where('key', 'permit_other_edit_notes')
                                        ->where('group_name', 'notebook');
                                })
                                    ->where('val', 1);
                            }
                        ]
                    ]);
                    $param['notebook_info']->is_viewed = 0;
                    $param['type'] = 'notebook';
                    Helper::emit($param, 'VoiceVideoNoteChnl');
                    Helper::emit($parmeter, 'VVNCntChnl');
                }
                return Helper::rj('Your notebook has been shared successfully.', 200, []);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function details(Request $request)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'notebook_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                \App\Models\NoteBookShare::where([
                    'notebook_id' => $input['notebook_id'],
                    'share_user_id' => $this->_user->id
                ])->update(['is_viewed' => 1]);
                $data = $this->_model->getListing([
                    'id' => $input['notebook_id'],
                    'with' => [
                        'shareWith' => function ($q) {
                            return $q->select('note_book_shares.*')->join('note_books', function ($join) {
                                $join->on('note_books.id', 'note_book_shares.notebook_id')
                                    ->where('note_books.user_id', $this->_user->id);
                            })
                                ->where('is_sharable', 1);
                        }
                    ]
                ]);
                $vvObj = new \App\Models\VoiceVideoMessage();
                $parmeter['user'][] = [
                    'id' => $this->_user->id,
                    'unread_notbook_cnt' => \App\Models\NoteBookShare::where(['share_user_id' => $this->_user->id, 'is_viewed' => 0])->count(),
                    'unread_voicemail_cnt' => $vvObj->getListing([
                        'user_id' => $this->_user->id,
                        'is_view' => 0,
                        'type' => 'voice',
                        'current_time' => (new \DateTime())->format("Y-m-d H:i"),
                        'count' => 1
                    ]),
                    'unread_videomsg_cnt' => $vvObj->getListing([
                        'user_id' => $this->_user->id,
                        'is_view' => 0,
                        'type' => 'video',
                        'current_time' => (new \DateTime())->format("Y-m-d H:i"),
                        'count' => 1
                    ])
                ];
                Helper::emit($parmeter, 'VVNCntChnl');
                return Helper::rj('Record found.', 200, $data);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function delete(Request $request)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'notebook_id' => 'array|min:1|required',
                'notebook_id.*' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                if (count($input['notebook_id'])) {
                    foreach ($input['notebook_id'] as $id) {
                        $check_shared = \App\Models\NoteBookShare::where(['notebook_id' => $id, 'is_sharable' => 1])->count();
                        if ($check_shared) {
                            return \App\Helpers\Helper::rj('Bad Request', 400, [
                                'errors' => 'Can not delete the notebook as it is shared with other users.'
                            ]);

                        } else {
                            NoteBook::where(['id' => $id])->delete();
                            \App\Models\NoteBookShare::where(['notebook_id' => $id])->delete();
                        }
                    }
                    return Helper::rj('Notebook deleted successfully.', 200, []);
                }
            }
        } catch (\Exception $x) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function removeShare(Request $request)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'share_user_id' => 'required',
                'notebook_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $data = \App\Models\NoteBookShare::where([
                    'notebook_id' => $input['notebook_id'],
                    'share_user_id' => $input['share_user_id'],
                    'is_sharable' => 1
                ])->first();
                if ($data) {
                    $param['user'][] = [
                        'id' => $input['share_user_id']
                    ];
                    $param['notebook_info'] = $this->_model->getListing(['id' => $input['notebook_id']]);
                    $param['type'] = 'remove_notebook';
                    $data->delete();
                    Helper::emit($param, 'VoiceVideoNoteChnl');
                    $vvObj = new \App\Models\VoiceVideoMessage();
                    $parmeter['user'][] = [
                        'id' => $input['share_user_id'],
                        'unread_notbook_cnt' => \App\Models\NoteBookShare::where(['share_user_id' => $input['share_user_id'], 'is_viewed' => 0])->count(),
                        'unread_voicemail_cnt' => $vvObj->getListing([
                            'user_id' => $input['share_user_id'],
                            'is_view' => 0,
                            'type' => 'voice',
                            'current_time' => (new \DateTime())->format("Y-m-d H:i"),
                            'count' => 1
                        ]),
                        'unread_videomsg_cnt' => $vvObj->getListing([
                            'user_id' => $input['share_user_id'],
                            'is_view' => 0,
                            'type' => 'video',
                            'current_time' => (new \DateTime())->format("Y-m-d H:i"),
                            'count' => 1
                        ])
                    ];
                    Helper::emit($parmeter, 'VVNCntChnl');
                    return Helper::rj('Notebook sharing stopped successfully.', 200, []);
                } else {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'Information not available.'
                    ]);

                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function contactList(Request $request)
    {
        try {
            $validationRules = [
                'notebook_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $contactListObj = new \App\Models\ContactList();
                $user = $this->_user;
                $data = $contactListObj->getListing([
                    'user_id' => $this->_user->id,
                    'visible_status' => [1, 2, 3],
                    'is_loggedout' => 0,
                    'with' => [
                        'customizeNickname' => function ($q) use ($user) {
                            return $q->select('for_user_id', 'nickname')->where('user_id', $user->id);
                        },
                        'isBlock' => function ($q) use ($user) {
                            return $q->select('user_id', 'block_user_id')->where('user_id', $user->id);
                        }
                    ],
                    //'get_sql' => 1
                ]);
                if (count($data)) {
                    $shared_info = \App\Models\NoteBookShare::where('notebook_id', $request->notebook_id)
                        ->where('is_sharable', 1)
                        ->pluck('share_user_id')->toArray();
                    if (count($shared_info)) {
                        $data = $data->toArray();
                        foreach ($data as $key => $contact_user) {
                            if (in_array($contact_user['contact_user_id'], $shared_info)) {
                                unset($data[$key]);
                            }
                        }
                        $data = array_values($data);
                    }
                    /*foreach ($data as $key => $c_user) {
                        if ($c_user['user_id'] == $user->id && $c_user['contact_user_id'] == $user->id) {
                            unset($data[$key]);
                        }
                    }
                    $data = array_values($data);*/
                }
                return Helper::rj('Record found.', 200, $data);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function imgeUpload(Request $request)
    {
        try {
            $fileValidations = \App\Models\File::$fileValidations['image'];
            $validationRules = [
                'notebook_image' => 'required|mimes:' . $fileValidations['mime'] . '|max:' . $fileValidations['max'],
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                // checking if file exists in this
                // request or not
                if ($request->hasFile('notebook_image')) {
                    $cdn = \App\Models\Cdn::where("status", 1)->first();
                    $file = self::__upload($request->file('notebook_image'), $cdn);
                    $data['url'] = $file;
                    return \App\Helpers\Helper::resp('Image uploaded successfully.', 200, $data);
                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    private static function __upload($file, $cdn = 0)
    {
        $fileExt = $file->getClientOriginalExtension();
        $fileNameOriginal = $file->getClientOriginalName();
        $fileSize = $file->getSize();
        $fileMime = $file->getMimeType();

        // Generating file name
        $fileName = time() . rand() . '.' . $fileExt;
        // uploading file
        $fileUploaded = false;
        if (\Storage::disk($cdn->location_type)->putFileAs($cdn->cdn_root . \App\Models\File::$fileType['editor_image']['location'], $file, $fileName)) {
            $fileUploaded = true;
        }
        if ($fileUploaded) {
            return \Storage::disk($cdn->location_type)->url($cdn->cdn_path . \App\Models\File::$fileType['editor_image']['location'] . '/' . $fileName);
        }
    }
}
