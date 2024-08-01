<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Image;

class File extends Model
{
	use SoftDeletes;

	protected $table = 'files';

	protected $fillable = [
		'entity_id',
		'entity_type',
		'cdn_id',
		'file_name',
		'file_name_original',
		'file_ext',
		'file_mime',
		'file_size',
		'location',
	];

	protected $hidden = [
		'location',
		'entity_id',
		'entity_type',
		'cdn_id',
		'file_size',
		'updated_at',
		'deleted_at',
		'cdn',
	];

	/**
	 * var fileType
	 * used for various files, type will be store in
	 * database, location: your desired upload location.
	 *
	 * please create a new entity, if you want to
	 * upload for a new module.
	 */
	public static $fileType = [
		'user_avatar' => [
			'type' => 1,
			'location' => 'u',
		],
		'room' => [
			'type' => 2,
			'location' => 'r',
		],
		'customize_sound' => [
			'type' => 3,
			'location' => 'cs',
		],
		'upload_video' => [
			'type' => 4,
			'location' => 'uv',
		],
		'audio_video_message' => [
			'type' => 8,
			'location' => 'avm',
		],
		'user_gallery' => [
			'type' => 9,
			'location' => 'g',
		],
		'editor_image' => [
			'type' => 10,
			'location' => 'e',
		],
		'play_video' => [
			'type' => 11,
			'location' => 'pv',
		],
		'sticker_cat_icon' => [
			'type' => 12,
			'location' => 'stckrcat',
		],
		'sticker_icon' => [
			'type' => 13,
			'location' => 'sticker',
		],
		'dig_sound' => [
			'type' => 14,
			'location' => 'ds',
		],
		'badge_level_icon' => [
			'type' => 15,
			'location' => 'bli',
		],
		'badge_icon' => [
			'type' => 16,
			'location' => 'bi',
		],
		'sticker_pack' => [
			'type' => 17,
			'location' => 'sp',
		],
		'subscription_icon' => [
			'type' => 18,
			'location' => 'si'
		],
		'virtual_credit_icon' => [
			'type' => 19,
			'location' => 'vi'
		]
	];

	/**
	 * Resized image resolutions
	 */
	public static $fileResolutions = [
		'200x200' => [
			'height' => 200,
			'width' => 200,
		],
	];

	public static $fileValidations = [
		'image' => [
			'mime' => 'jpeg,png,jpg,gif,svg',
			'file_mimes' => [
				'image/jpeg',
				'image/png',
				'image/gif',
			],
			'max' => 5120,
		],

		'sticker' => [
			'mime' => 'png,gif',
			'file_mimes' => [
				'image/png',
				'image/gif',
			],
			'max' => 2000,
		],

		'attachment' => [
			'mime' => 'jpeg,png,jpg,gif,svg,pdf,ppt,doc',
			'file_mimes' => [
				'image/jpeg',
				'image/png',
				'image/gif',
				'application/pdf',
				'application/vnd.ms-powerpoint',
				'application/msword',
			],
			'max' => 2048,
		],

		// Video Type     Extension       MIME Type
		// Flash           .flv            video/x-flv
		// MPEG-4          .mp4            video/mp4
		// iPhone Index    .m3u8           application/x-mpegURL
		// iPhone Segment  .ts             video/MP2T
		// 3GP Mobile      .3gp            video/3gpp
		// QuickTime       .mov            video/quicktime
		// A/V Interleave  .avi            video/x-msvideo
		// Windows Media   .wmv            video/x-ms-wmv
		'video' => [
			'mime' => 'application/octet-stream,video/mp4,video/3gpp,video/quicktime',
			'file_mimes' => [
				'video/mp4',
				'application/octet-stream',
				'video/quicktime',
				'video/3gpp',
			],
			'max' => 10240,
		],
		'json' => [
			'mime' => 'json',
			'file_mimes' => [
				'application/json',
			],
			'max' => 2048,
		],
		'audio' => [
			'mime' => 'mp3,wav',
			'file_mimes' => [
				'audio/mpeg',
				'audio/wav',
			],
			'max' => 10240,
		],
		'audio_video' => [
			'mime' => 'mp3,mp4,bin,txt',
			'file_mimes' => [
				'audio/mpeg',
				'audio/wav',
				'audio/m4a',
				'audio/x-m4a',
				'video/mp4',
				'bin',
				'txt',
				'video/webm',
				'video/mpeg',
				'video/x-matroska',
			],
			'max' => 10240,
		],
	];

	public $orderBy = [];

	public function cdn()
	{
		return $this->hasOne('App\Models\Cdn', 'id', 'cdn_id');
	}

	public static function file($file = null, $defaultImage = 'no-image.png')
	{
		if ($file) {
			if ($file->cdn->location_type == 'public') {
				$r = [
					'id' => $file->id,
					'original' => self::getImage($file, '', $defaultImage),
					'thumb' => self::getImage($file, '200x200', $defaultImage),
					'file_mime' => $file->file_mime,
					'filename_original' => $file->file_name_original,
				];
				if ($file->entity_type == 1) {
					$visible_avtar = UserOptionVisible::where(['key' => 'avatar_visible', 'user_id' => \Auth::user()->id])->first();
					$r['visible_avatar'] = ($visible_avtar) ? $visible_avtar->value : 0;
				}
				return $r;
			} else {
				$r = [
					'id' => $file->id,
					'original' => \Storage::disk('s3')->url($file->cdn->cdn_path . $file->location . '/' . $file->file_name),
					'thumb' => \Storage::disk('s3')->url($file->cdn->cdn_path . $file->location . '/' . $file->file_name),
					'file_mime' => $file->file_mime,
					'filename_original' => $file->file_name_original
				];
				if ($file->entity_type == 1) {
					$visible_avtar = UserOptionVisible::where(['key' => 'avatar_visible', 'user_id' => \Auth::user()->id])->first();
					$r['visible_avatar'] = ($visible_avtar) ? $visible_avtar->value : 0;
				}
				return $r;
			}
		}

		return [
			'id' => 0,
			'original' => self::getImage([], '', $defaultImage),
			'thumb' => self::getImage([], '200x200', $defaultImage),
			'file_mime' => ''
		];
	}

	public function getListing($srch_params = [])
	{
		$listing = self::select($this->table . '.*')
			->when(isset($srch_params['with']), function ($q) use ($srch_params) {
				return $q->with($srch_params['with']);
			})
			->when(isset($srch_params['entity_type']), function ($q) use ($srch_params) {
				$q->where($this->table . '.entity_type', $srch_params['entity_type']);
			})
			->when(isset($srch_params['entity_id']), function ($q) use ($srch_params) {
				$q->where($this->table . '.entity_id', $srch_params['entity_id']);
			})
			->when(isset($srch_params['id_in']), function ($q) use ($srch_params) {
				$q->whereIn($this->table . '.id', $srch_params['id_in']);
			});

		if (isset($srch_params['id'])) {
			$listing = $listing->where("id", $srch_params['id'])->first();
			return $listing;
		}

		$listing = $listing->get();

		return $listing;
	}

	/**
	 * upload file and insert into db
	 *
	 * @param request
	 * @param input_file
	 * @param entity_type
	 * @param entity_id
	 */
	public static function upload($request, $input_file = '', $entity_type = '', $entity_id = 0, $cdn = 0)
	{
		// checking if file exists in this
		// request or not
		if ($request->hasFile($input_file)) {
			// if cdn id not defined
			if (!$cdn) {
				$cdn = \App\Models\Cdn::where("status", 1)->first();
			}

			// checking whether upload folder exists
			// or not, make folder if not exists.
			//$fileCreate = \App\Helpers\Helper::checkFolder($cdn->cdn_root . self::$fileType[$entity_type]['location']);
			//if($fileCreate){
			$files = [];
			if (is_array($request->file($input_file))) {
				foreach ($request->file($input_file) as $file) {
					$files[] = self::__upload($file, $entity_type, $entity_id, $cdn);
				}
			} else {
				$files = self::__upload($request->file($input_file), $entity_type, $entity_id, $cdn);
			}

			return $files;
			//}

			return false;
		} elseif (is_string($request->get($input_file))) {
			if (!$cdn) {
				$cdn = \App\Models\Cdn::where("status", 1)->first();
			}

			$files = self::__uploadBase64($request->get($input_file), $request->file($input_file . "_input"), $entity_type, $entity_id, $cdn);
			return $files;
		}
		return false;
	}

	private static function __upload($file, $entity_type = '', $entity_id = 0, $cdn = 0)
	{
		$fileExt = $file->getClientOriginalExtension();
		$fileNameOriginal = $file->getClientOriginalName();
		$fileSize = $file->getSize();
		$fileMime = $file->getMimeType();

		// Generating file name
		$fileName = time() . rand() . '.' . $fileExt;
		// uploading file
		$fileUploaded = false;

		// Moveing Uploaded File
		if ($cdn->location_type == 'public') {
			if (\Storage::disk($cdn->location_type)->putFileAs($cdn->cdn_root . self::$fileType[$entity_type]['location'], $file, $fileName)) {
				$fileUploaded = true;
				if (
					in_array($fileMime, [
						'image/jpeg',
						'image/jpg',
						'image/png',
					])
				) {
					// if this is a image type file
					// it will orientate and
					// compress.
					$fileAbsPath = \Storage::disk($cdn->location_type)->path($cdn->cdn_root . self::$fileType[$entity_type]['location'] . '\\' . $fileName);
					$fileAbsPath = str_replace("\\", "/", $fileAbsPath);
					$image = Image::make($fileAbsPath)
						->orientate()
						->encode('jpg', 75);

					$image->save($fileAbsPath);
				}
			}
		} else {
			if (\Storage::disk($cdn->location_type)->putFileAs($cdn->cdn_root . self::$fileType[$entity_type]['location'], $file, $fileName)) {
				$fileUploaded = true;
			}
		}

		if ($fileUploaded && $entity_id) {
			$file = self::create([
				'entity_id' => $entity_id,
				'entity_type' => self::$fileType[$entity_type]['type'],
				'cdn_id' => $cdn->id,
				'file_name' => $fileName,
				'file_name_original' => $fileNameOriginal,
				'file_ext' => $fileExt,
				'file_mime' => $fileMime,
				'location' => self::$fileType[$entity_type]['location'],
				'file_size' => $fileSize,
			]);

			return $file;
		}

		return (object) [
			'path' => asset('storage/' . $cdn->cdn_path . self::$fileType[$entity_type]['location'] . '/' . $fileName),
			'absolute_path' => \Storage::disk($cdn->location_type)->path($cdn->cdn_root . self::$fileType[$entity_type]['location'] . '\\' . $fileName),
			'cdn' => $cdn,
			'location' => self::$fileType[$entity_type]['location'],
			'file_name' => $fileName,
		];
	}

	private static function __uploadBase64($file, $fileOriginal, $entity_type = '', $entity_id = 0, $cdn = 0)
	{
		$fileExt = 'jpg';
		$fileName = time() . rand() . '.' . $fileExt;
		$fileNameOriginal = $fileName;
		$fileSize = 0;
		$fileMime = 'image/jpeg';

		if ($fileOriginal) {
			$fileExt = $fileOriginal->getClientOriginalExtension();
			$fileNameOriginal = $fileOriginal->getClientOriginalName();
			$fileSize = $fileOriginal->getSize();
			$fileMime = $fileOriginal->getMimeType();
		}

		// uploading file
		$fileUploaded = false;
		list($type, $file) = explode(';', $file);
		list(, $file) = explode(',', $file);
		$file = base64_decode($file);
		$path = $cdn->cdn_root . self::$fileType[$entity_type]['location'] . '/' . $fileName;
		if (Storage::disk($cdn->location_type)->put($path, $file)) {
			$fileUploaded = true;
		}

		if ($fileUploaded && $entity_id) {
			$file = self::create([
				'entity_id' => $entity_id,
				'entity_type' => self::$fileType[$entity_type]['type'],
				'cdn_id' => $cdn->id,
				'file_name' => $fileName,
				'file_name_original' => $fileNameOriginal,
				'file_ext' => $fileExt,
				'file_mime' => $fileMime,
				'location' => self::$fileType[$entity_type]['location'],
				'file_size' => $fileSize,
			]);

			return $file;
		}
	}

	public static function uploadBinary($file, $entity_type = '', $entity_id = 0, $cdn = 0)
	{
		if (!$cdn) {
			$cdn = \App\Models\Cdn::where("status", 1)->first();
		}

		// Generating file name
		$fileName = time() . rand() . '.' . $file['ext'];
		\Storage::disk($cdn->location_type)->put($cdn->cdn_root . self::$fileType[$entity_type]['location'] . '\\' . $fileName, $file['data']);

		if ($entity_id) {
			$file = self::create([
				'entity_id' => $entity_id,
				'entity_type' => self::$fileType[$entity_type]['type'],
				'cdn_id' => $cdn->id,
				'file_name' => $fileName,
				'file_name_original' => $fileNameOriginal,
				'file_ext' => $fileExt,
				'file_mime' => $fileMime,
				'location' => self::$fileType[$entity_type]['location'],
				'file_size' => $fileSize,
			]);

			return $file;
		}

		return [
			'path' => asset('storage/' . $cdn->cdn_path . self::$fileType[$entity_type]['location'] . '/' . $fileName),
			'absolute_path' => \Storage::disk($cdn->location_type)->path($cdn->cdn_root . self::$fileType[$entity_type]['location'] . '\\' . $fileName),
		];
	}

	public static function copyFile($source_location = '', $file_name = '', $entity_type = '', $entity_id = 0, $cdn = 0)
	{
		// if cdn id not defined
		if (!$cdn) {
			$cdn = \App\Cdn::where("status", 1)->first();
		}
		$extension = explode(".", $file_name);
		$extension = end($extension);
		$mime = \File::mimeType($source_location . "/" . $file_name);
		// checking whether upload folder exists
		// or not, make folder if not exists.
		if ($cdn->location_type == 'public') {
			$fileCreate = \App\Helpers\Helper::checkFolder('storage/' . $cdn->cdn_path . self::$fileType[$entity_type]['location']);
			if ($fileCreate) {
				if ($source_location != self::$fileType[$entity_type]['location']) {
					@move_uploaded_file($source_location . "/" . $file_name, 'storage/' . $cdn->cdn_path . self::$fileType[$entity_type]['location'] . "/" . $file_name);
				}
			}
		} else {
			\Storage::disk($cdn->location_type)
				->put(
					$cdn->cdn_root . self::$fileType[$entity_type]['location'] . '/' . $file_name,
					fopen('storage/' . $cdn->cdn_path . self::$fileType[$entity_type]['location'] . "/" . $file_name, 'r+')
				);

		}

		return self::create([
			'entity_id' => $entity_id,
			'entity_type' => self::$fileType[$entity_type]['type'],
			'cdn_id' => $cdn->id,
			'file_name' => $file_name,
			'file_name_original' => $file_name,
			'file_ext' => $extension,
			'file_mime' => $mime,
			'location' => self::$fileType[$entity_type]['location'],
			'file_size' => 0,
		]);

		return false;
	}

	public static function getImage($file = [], $resolution = '', $defaultImage = 'no-image.png')
	{
		if ($file && isset($file->cdn)) {
			if ($resolution) {
				// if file mime is image.
				if (in_array($file->file_mime, self::$fileValidations['image']['file_mimes'])) {
					self::getThumb($file, $file->cdn, $resolution);

					// checking whether thumb image exists or not
					if (\Storage::disk($file->cdn->location_type)->exists($file->cdn->cdn_root . $file->location . '/' . $resolution . '/' . $file->file_name)) {
						if ($file->cdn->location_type == 'public') {
							return asset('storage/' . $file->cdn->cdn_path . $file->location . '/' . $resolution . '/' . $file->file_name);
						} else {
							return \Storage::disk($file->cdn->location_type)->path($file->cdn->cdn_root . $file->location . '/' . $resolution . '/' . $file->file_name);
						}
					}
				}
			}

			// checking original image exists or not
			if (\Storage::disk($file->cdn->location_type)->exists($file->cdn->cdn_root . $file->location . '/' . $file->file_name)) {
				if ($file->cdn->location_type == 'public') {
					return asset('storage/' . $file->cdn->cdn_path . $file->location . '/' . $file->file_name);
				} else {
					return \Storage::disk($file->cdn->location_type)->path($file->cdn->cdn_root . $file->location . '/' . $file->file_name);
				}
			}
		}

		// returning default image.
		/*$resolution = $resolution ? $resolution . '/' : '';
																				return asset('img/' . $resolution . $defaultImage);*/
		return null;
	}

	public static function getThumb($file = [], $cdn = [], $resolution = '', $crop = true)
	{
		// checking whether original file exists or not
		if (\Storage::disk($cdn->location_type)->exists($cdn->cdn_root . $file->location . '/' . $file->file_name)) {
			// checking whether thumb folder exists or not
			// make folder if not exists.
			if ($cdn->location_type == 'public') {
				\Storage::makeDirectory('public\\' . $cdn->cdn_root . $file->location . '\\' . $resolution);
			}

			// if the cropped image not exists, it will generate.
			if (\Storage::disk($cdn->location_type)->missing($cdn->cdn_root . $file->location . '/' . $resolution . '/' . $file->file_name)) {
				$width = self::$fileResolutions[$resolution]['width'];
				$height = $crop ? self::$fileResolutions[$resolution]['height'] : null;
				// creating thumb image
				$fileAbsPath = \Storage::disk($cdn->location_type)
					->path($cdn->cdn_root . $file->location . '\\' . $file->file_name);
				$fileAbsPath = str_replace("\\", "/", $fileAbsPath);
				$destination = \Storage::path('public\\' . $cdn->cdn_root . $file->location . '\\' . $resolution . '\\' . $file->file_name);
				$destination = str_replace("\\", "/", $destination);

				$img = Image::make($fileAbsPath)
					->resize($width, $height, function ($constraint) {
						$constraint->aspectRatio();
						$constraint->upsize();
					})
					->save($destination);
				if ($img) {
					return $img;
				}

				return asset('storage/' . $cdn->cdn_path . $file->location . '/' . $resolution . '/' . $file->file_name);
			}

			return asset('storage/' . $cdn->cdn_path . $file->location . '/' . $resolution . '/' . $file->file_name);
		}

		return false;
	}

	public static function getFile($file = [])
	{
		if ($file && isset($file->cdn)) {
			// checking original image exists or not
			if (\Storage::disk($file->cdn->location_type)->exists($file->cdn->cdn_root . $file->location . '/' . $file->file_name)) {
				return asset('storage/' . $file->cdn->cdn_path . $file->location . '/' . $file->file_name);
			}
		}

		return null;
	}

	public static function read($file = null, $cdn = null)
	{
		return \Storage::disk($cdn->location_type)->get($cdn->cdn_path . $file->location . '/' . $file->file_name);
	}

	public static function deleteFile($file = [], $forceDelete = false)
	{
		if (!$forceDelete) {
			return $file->delete();
		}

		// deleting original file
		self::unlinkFile($file, $file->cdn);

		// deleting all files from different resolution folders
		// if file type is an image.
		if (in_array($file->file_mime, self::$fileValidations['image']['file_mimes'])) {
			foreach (self::$fileResolutions as $resolution => $attributes) {
				$file->location .= '/' . $resolution;
				self::unlinkFile($file, $file->cdn);
			}
		}

		// deleting from database
		return $file->forceDelete();
	}

	public static function deleteFiles($srch_params = [], $forceDelete = false, $files = [])
	{
		if (empty($srch_params) && !$files) {
			return false;
		}

		if (!$files) {
			$fileModel = new self;
			$files = $fileModel->getListing($srch_params);
		}

		foreach ($files as $key => $file) {
			self::deleteFile($file, $forceDelete);
		}
	}

	public static function unlinkFile($file = null, $cdn = null)
	{
		\Storage::disk($cdn->location_type)->delete($cdn->cdn_root . $file->location . '\\' . $file->file_name);
	}

	//        public function visible_options() {
//            return $this->hasOne(UserOptionVisible::class, 'user_id', 'entity_id');
//        }
}
