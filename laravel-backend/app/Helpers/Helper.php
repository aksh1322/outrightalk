<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Services\SendBirdChannelService;
use App\Repositories\SendBirdChannelRepository;
use Illuminate\Http\Exceptions\HttpResponseException;

//use ElephantIO\Client as Elephant;
//use ElephantIO\Engine\SocketIO\Version2X;

define('SOCKET_ENDPOINT_URL', 'https://1859-139-135-45-127.ngrok-free.app');
// define('SOCKET_ENDPOINT_URL', 'https://0526-203-99-174-147.ngrok-free.app');

class Helper
{

	/**
	 * Show date with date format.
	 * @param date / datetime $date
	 * @param boolean $showTime [show time also]
	 * @param string $dateFormat custom date format [any custom date format, which is not default]
	 * @param string $timezone [User timezone]
	 * @version:    1.0.0.5
	 * @author:     Somnath Mukherjee
	 */
	public static function showdate($date, $showTime = true, $dateFormat = '', $timezone = '')
	{
		if (self::check_valid_date($date)) {
			$customFormat = true;
			if (!$dateFormat) {
				$customFormat = false;
				//$dateFormat   = \Config::get('settings.date_format');
				$dateFormat = 'jS F, Y';
				//'d-F-Y';
			}
			$gdt = explode(" ", $date);
			if ($showTime && isset($gdt[1]) && self::checktime($gdt[1])) {
				if (!$customFormat) {
					$dateFormat .= " " . 'h:i a';
				}
				$date = (string) date($dateFormat, strtotime($date));

				return $date;
			} else {
				$date = (string) date($dateFormat, strtotime($date));
				return $date;
			}
		} else {
			return false;
		}
	}

	/**
	 * Search text with html tag
	 * @param:      html string [string]
	 * @param:      tag name [string]
	 * @return:     tag value if found else boolean
	 * @version:    1.0.0.1
	 * @author:     Somnath Mukherjee
	 */

	public static function text_within_tag($string, $tagname)
	{
		$pattern = "#<\s*?$tagname\b[^>]*>(.*?)</$tagname\b[^>]*>#s";
		preg_match($pattern, $string, $matches);
		return isset($matches[1]) ? $matches[1] : false;
	}

	/**
	 * Check valid time
	 * @param:      time as string
	 * @author:     Somnath Mukherjee
	 * @version:    1.0.0.1
	 */
	public static function checktime($time = '00:00:00')
	{
		list($hour, $min, $sec) = explode(':', $time);

		if ($hour == 0 && $min == 0 && $sec == 0) {
			return false;
		}

		if ($hour < 0 || $hour > 23 || !is_numeric($hour)) {
			return false;
		}
		if ($min < 0 || $min > 59 || !is_numeric($min)) {
			return false;
		}
		if ($sec < 0 || $sec > 59 || !is_numeric($sec)) {
			return false;
		}
		return true;
	}

	/**
	 * Check valid date
	 * @param:      date as string
	 * @author:     Somnath Mukherjee
	 * @version:    1.0.0.2
	 */
	public static function check_valid_date($date = '')
	{
		if ($date != "") {
			$date = date("Y-m-d", strtotime($date));
			$dt = explode("-", $date);
			return checkdate((int) $dt[1], (int) $dt[2], (int) $dt[0]);
		}

		return false;
	}

	/**
	 * Get clean url.
	 * @params:         url string
	 * @version:        1.0.0.1
	 * @author:         Somnath Mukherjee
	 */

	public static function getcleanurl($name)
	{
		/*$name = trim($name);
																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																															$url  = preg_replace('/[^A-Za-z0-9\-]/', '-', $name);
																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																															$url  = strtolower(str_replace("-----", "-", $url));
																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																															$url  = strtolower(str_replace("----", "-", $url));
																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																															$url  = strtolower(str_replace("---", "-", $url));
																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																															$url  = strtolower(str_replace("--", "-", $url));

																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																												*/

		return str_slug($name);
	}

	public static function getUniqueSlug($title = '', $table = '', $column = 'slug', $stringFormat = true)
	{
		$title = self::getcleanurl($title);
		$condition[$column] = $title;

		$nor = \DB::table($table)
			->where($condition)
			->count();

		if (!$nor) {
			return $title;
		}

		if ($stringFormat) {
			$title .= '-' . chr(rand(65, 90));
		} else {
			$title .= rand(0, 9);
		}

		return self::getUniqueSlug($title, $table, $column);
	}

	/**
	 * Check for directory name
	 * @param:      directory name (mandatory).
	 * @author:     Somnath Mukherjee.
	 * @version:    1.0.0.1
	 *
	 * NOTE:        It checks only into user panels assets folder
	 *              if specified directory not exist then it will create it
	 */
	public static function check_directory($dir_name = '')
	{
		if ($dir_name == "") {
			return false;
		}

		$filePath = public_path($dir_name);
		if (!file_exists($filePath)) {
			$oldmask = umask(0);
			mkdir($filePath, 0755);

			// copying index file
			self::cp_index($filePath);
			umask($oldmask);
		}
		return true;
	}

	/**
	 * Copy index.html file to the destination folder.
	 *
	 * @param [string] $dest Destination folder
	 */
	public static function cp_index($dest = '', $source = '')
	{
		$dest = rtrim($dest, "/") . '/index.html';
		$source = !$source ? 'index.html' : $source;
		@copy(public_path($source), $dest);
	}

	/**
	 * if this is not a valid data then it will
	 * redirct to the listing page
	 *
	 * @param  array  $data
	 * @param  string $redirectRoute redirect route
	 * @param  mixed $param extra param
	 * @return boolean
	 */
	public static function notValidData($data = [], $redirectRoute = '', $param = [])
	{
		if (!$data) {
			if ($redirectRoute) {
				return redirect()
					->route($redirectRoute, $param)
					->with('error', 'Not a valid data.');
			}

			return self::rj('No record found', 204);
		}

		return false;
	}

	public static function price($price = 0, $decimalplace = 0)
	{
		return '$' . number_format($price, $decimalplace);
	}

	/**
	 * Make associative array from 2d array.
	 *
	 * @param:      2d array (mandatory)
	 *
	 * @param:      fields name (mandatory).  First field for associative array's Key and
	 *              Second field for associative array's value.
	 *
	 *              NOTE: if you want to put only one field, then it will create
	 *              key and value with the same name or value.
	 *
	 * @param:      If you want to create a simple array then pass TRUE. It will not
	 *              create any associative array.
	 *
	 * @author:     Somnath Mukherjee.
	 *
	 * @version:    1.0.0.2
	 */

	public static function makeSimpleArray($marray = array(), $fields = '', $make_single = false)
	{
		if ($fields == "") {
			return false;
		}

		$fields = explode(",", $fields);
		$key = null;
		$val = null;
		if (count($fields) > 1) {
			$key = trim($fields[0]);
			$val = trim($fields[1]);
		} else {
			$key = $val = trim($fields[0]);
		}

		$sarray = array();
		if (is_array($marray) and !empty($marray)) {
			if (!$make_single) {
				foreach ($marray as $k => $v) {
					$v = (array) $v;
					$sarray[$v[$key]] = trim($v[$val]);
				}
			} else {
				foreach ($marray as $k) {
					$k = (array) $k;
					$sarray[] = $k[$key];
				}
			}
		}

		return $sarray;
	}

	public static function getMethod()
	{
		$method = explode("@", \Route::currentRouteAction());
		return $method = end($method);
	}

	public static function getController()
	{
		$controller = explode("@", \Route::currentRouteAction());
		$controller = explode('\\', $controller[0]);
		return $controller = end($controller);
	}

	public static function randomNumber()
	{
		return mt_rand(10000000, 99999999);
	}
	public static function randomString($size = 15)
	{
		return Str::random($size);

		/*
																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																															$alpha_key = '';
																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																															$keys      = range('A', 'Z');

																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																															for ($i = 0; $i < 2; $i++) {
																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																$alpha_key .= $keys[array_rand($keys)];
																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																															}

																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																															$length = $size - 2;

																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																															$key  = '';
																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																															$keys = range(0, 9);

																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																															for ($i = 0; $i < $length; $i++) {
																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																$key .= $keys[array_rand($keys)];
																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																															}

																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																												*/
	}

	public static function checkFolder($location = '')
	{
		if (!\File::exists($location)) {
			return \File::makeDirectory($location);
		}
		return true;
	}

	public static function getAttr($attributes = [], $return = FALSE)
	{
		$param = '';
		if (!empty($attributes)) {
			foreach ($attributes as $k => $v) {
				if (!$return) {
					echo ' ' . $k . '="' . $v . '"';
				} else {
					$param .= ' ' . $k . '="' . $v . '"';
				}
			}
		}

		return $param;
	}

	/**
	 * Response Json
	 * 200 OK
	 * 201 Created
	 * 202 Accepted
	 * 203 Non-Authoritative Information
	 * 204 No Content
	 * 205 Reset Content
	 * 206 Partial Content
	 * 207 Multi-Status
	 * 208 Already Reported
	 * 226 IM Used
	 *
	 * 400 Bad Request
	 * 401 Unauthorized
	 * 402 Payment Required
	 * 403 Forbidden
	 * 404 Not Found
	 * 405 Method Not Allowed
	 * 406 Not Acceptable
	 * 407 Proxy Authentication Required
	 * 408 Request Timeout
	 *
	 * 500 Internal Server Error
	 * 501 Not Implemented
	 * 502 Bad Gateway
	 */
	public static function rj($message = '', $headerStatus = 200, $data = [])
	{
		// if(empty($data)){
		//     $data = [
		//         'message'   => 'No record found!',
		//         'data'      => []
		//     ];
		//     $headerStatus   = 204;
		// }

		// $data['message']    = !isset($data['message']) ? 'No record found' : $data['message'];
		// $data['data']       = !isset($data['data']) ? (object)[] : (array)$data['data'];

		return self::resp($message, $headerStatus, $data);

		//return response()->json($data, $headerStatus);
	}

	public static function resp($message = '', $status = 200, $data = [])
	{

		$data = [
			'status' => $status,
			'message' => $message,
			'data' => $data,
		];

		return response()->json($data, $status);
	}

	public static function Log($type = '', $message = '', $requestedParam = [])
	{
		$requestedParam = json_encode($requestedParam);

		\App\ErrorLog::create([
			'error_type' => $type,
			'error_message' => $message,
			'request_params' => $requestedParam,
		]);
	}

	/**
	 * Format sort by clause from url.
	 *
	 *
	 */
	public static function manageOrderBy($orderBy = '')
	{
		if ($orderBy) {
			$orderBy = explode(",", $orderBy);
			$orderByArr = [];
			foreach ($orderBy as $key => $value) {
				if ($value) {
					$value = str_replace("__", ".", $value);
					$orderValue = substr($value, 0, 1);
					if ($orderValue == '-') {
						$orderByArr[substr($value, 1)] = 'DESC';
					} else {
						$orderByArr[$value] = 'ASC';
					}
				}
			}

			return $orderByArr;
		}

		return False;
	}

	public static function manageGroupBy($groupBy = '')
	{
		if ($groupBy) {
			$groupBy = explode(",", $groupBy);
			$groupByArr = [];
			foreach ($groupBy as $key => $value) {
				if ($value) {
					$groupByArr[] = str_replace("__", ".", $value);
				}
			}

			return $groupByArr;
		}

		return False;
	}

	public static function getUserLatLong($data = array())
	{
		$lat = '';
		$lng = '';

		if (isset($data['zip']) and $data['zip']) {
			$location = file_get_contents("https://maps.googleapis.com/maps/api/geocode/json?address=" . urlencode($data['zip']) . "&sensor=false&key=" . env('GOOGLE_API_KEY'));
			$location = json_decode($location);
			$location = (array) $location;

			if (!empty($location['results'])) {
				$location = (array) $location['results'][0]->geometry;

				$lat = $location["location"]->lat;
				$lng = $location["location"]->lng;
			}
		} elseif ((!isset($data['zip']) or (isset($data['zip']) and !$data['zip'])) and ((isset($data['lat']) and isset($data['lng'])) and ($data['lat'] != "" and $data['lng'] != ""))) {
			$lat = $data['lat'];
			$lng = $data['lng'];
		}

		if ($lat == '' and $lng == '') {
			$location = file_get_contents('http://ip-api.com/json/' . $_SERVER['REMOTE_ADDR']);

			$location = json_decode($location);
			$lat = $location->lat;
			$lng = $location->lon;
		}

		return ['lat' => $lat, 'lng' => $lng];
	}

	public static function callAPI($method, $url, $data)
	{
		$curl = curl_init();
		switch ($method) {
			case "POST":
				curl_setopt($curl, CURLOPT_POST, 1);
				if ($data) {
					curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
				}

				break;
			case "PUT":
				curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "PUT");
				if ($data) {
					curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
				}

				break;
			default:
				if ($data) {
					$url = sprintf("%s?%s", $url, http_build_query($data));
				}
		}
		// OPTIONS:
		curl_setopt($curl, CURLOPT_URL, $url);
		curl_setopt(
			$curl,
			CURLOPT_HTTPHEADER,
			array(
				'Content-Type: application/json',
			)
		);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
		// EXECUTE:
		$result = curl_exec($curl);
		if (!$result) {
			die("Connection Failure");
		}
		curl_close($curl);
		return $result;
	}

	public static function sort($route = '', $fieldName = '', $orderBy = [], $routeParam = [])
	{
		$srchParams = \Request::all();
		$sortBy = explode(",", \Request::input('orderBy'));
		$sortIcon = \Config::get('settings.icon_sort_none');
		$matchFound = false;

		if (!empty($orderBy)) {
			foreach ($orderBy as $key => $value) {
				$key = str_replace(".", "__", $key);
				if ($key == $fieldName) {
					$matchFound = true;
					if ($value == 'ASC') {
						$sortBy = array_diff($sortBy, [$key]);
						$sortBy[] = '-' . $key;
						$sortIcon = \Config::get('settings.icon_sort_desc');
					} else {
						$sortBy = array_diff($sortBy, ['-' . $key]);
						// $sortBy[]   = $key;
						$sortIcon = \Config::get('settings.icon_sort_asc');
					}
				}
			}
		}

		if (!$matchFound) {
			$sortBy[] = $fieldName;
		}
		$srchParams['orderBy'] = implode(",", $sortBy);

		if ($routeParam) {
			$srchParams = array_merge($srchParams, $routeParam);
		}

		return '<a href="' . route($route, $srchParams) . '" class="icon-sorting">' . $sortIcon . '</a>';
	}

	public static function getUrlSegment($request = null, $segment = 0)
	{
		if ($request->is('api/*')) {
			$segment++;
		}

		return $segment;
	}

	public static function getSql($data = [], $print = true)
	{
		if (isset($data[0]) && isset($data[1])) {
			$sql = \Str::replaceArray('?', $data[1], $data[0]);
			if ($print) {
				dd($sql);
			}

			return $sql;
		}

		return false;
	}

	public static function emit($param = [], $pointer = 'notification')
	{
		// dd('dfdf');
		foreach ($param as $key => $value) {
			if (is_numeric($value)) {
				//$param[$key] = (int)$value;
				$param[$key] = $value;
			}
		}

		$post = array(
			'event' => $pointer,
			'params' => json_encode($param)
		);


		info("emit data", [$post]);


		$fields_string = http_build_query($post);

		// $ch = curl_init('https://node.outrightalk.com/emit');
		$ch = curl_init(config('services.frontendSocket'));
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_string);


		$response = curl_exec($ch);

		curl_close($ch);
	}

	// public static function emit($param = [], $pointer = 'notification')
	// {
	// 	return true;
	// }

	public static function getTimezone($ip_addr = null)
	{
		$ipInfo = file_get_contents('http://ip-api.com/json/' . $ip_addr);
		$ipInfo = json_decode($ipInfo);

		if ($ipInfo->status == 'fail') {
			return date_default_timezone_get();
		} else {
			return $ipInfo->timezone;
		}

	}

	public static function convertGMTToLocalTimezone($gmttime, $timezoneRequired)
	{
		$system_timezone = date_default_timezone_get();


		date_default_timezone_set("GMT");
		$gmt = date("Y-m-d H:i:s");

		$local_timezone = !empty($timezoneRequired) && $timezoneRequired != "1" ? $timezoneRequired : $system_timezone;
		date_default_timezone_set($local_timezone);



		$local = date("Y-m-d H:i:s");

		date_default_timezone_set($system_timezone);

		$diff = (strtotime($local) - strtotime($gmt));

		$date = new \DateTime($gmttime);
		$date->modify("+$diff seconds");
		$timestamp = $date->format("Y-m-d H:i:s");
		return $timestamp;
	}

	public static function convertLocalTimezoneToSystemTimezone($localtime, $withsec, $tz_from = null)
	{
		$tz_to = date_default_timezone_get();
		if ($withsec) {
			$format = 'Y-m-d H:i';
		} else {
			$format = 'Y-m-d';
		}
		$dt = new \DateTime($localtime, new \DateTimeZone($tz_from));
		$dt->setTimeZone(new \DateTimeZone($tz_to));
		return $dt->format($format);
	}

	public static function s3UploadLargeFile($destination = '', $source_path = '', $thumb_destination = null, $thumb_source = null)
	{
		// $s3 = \Storage::disk('s3');
		// if ($thumb_destination && $thumb_source) {
		//     $s3->put($thumb_destination, fopen($thumb_source, 'r+'));
		// }
		// return $s3->put($destination, fopen($source_path, 'r+'));

		$path = \Storage::disk('s3')->put($destination, file_get_contents($source_path));
		$path = \Storage::disk('s3')->url($path);

		return $path;
	}

	//     public static function s3UploadLargeFile($destination = '', $source_path = '', $thumb_destination = null, $thumb_source = null)
	// {        

	//     try {
	//         $path = \Storage::disk('s3')->put($destination, file_get_contents($source_path));
	//         $path = \Storage::disk('s3')->url($path);
	// 		dd($path);
	//         return $path;
	//     } catch (\Exception $e) {
	//         return "Error uploading file: " . $e->getMessage();
	//     }
	// }

	public static function convertVideo($event, $upload_folder)
	{
		$source = public_path('temp/' . $event->fileName . '.' . $event->fileExt);
		//$thumb_source = public_path('temp/thumbs/' . $event->fileName . '.jpg');
		$previousFile = null;
		$cdn = \App\Models\Cdn::where("status", 1)->first();

		if ($event->fileMime != 'video/mp4') {
			$convertUrl = public_path('temp/' . $event->fileName . '.mp4');
			$command = "ffmpeg -i " . $source . " " . $convertUrl . " -hide_banner";
			exec($command);

			$previousFile = $source;
			$source = $convertUrl;
			$event->fileExt = "mp4";
		}

		// uploading file into s3 server
		$destination = $cdn->cdn_path . $upload_folder . "/" . $event->fileName . '.' . $event->fileExt;
		//$thumb_destination = $cdn->cdn_path . "pv/thumbs/" . $event->fileName . '.jpg';
		$upload = self::s3UploadLargeFile($destination, $source);

		if ($upload) {
			// unlink from local server
			@unlink($source);
			if ($previousFile) {
				@unlink($previousFile);
			}
		}

		return $upload;
	}

	public static function removeRoomUserInformation($room_id, $user_id)
	{
		$room = \App\Models\Room::find($room_id);

		// Remove User to SendBird Group Channel
		// this can be PM or Public Room or Public Room
		$sendBirdChannelService = new SendBirdChannelService(new SendBirdChannelRepository());
		$sendBirdChannelService->resetMyChatHistory($user_id . '', $room->send_bird_channel_url);
		$is_owner = false;
		$user = \App\Models\RoomUser::where(['room_id' => $room_id, 'user_id' => $user_id])->first();

		if ($user && $user->is_admin == 3) {
			$is_owner = true;
		}

		if (!$is_owner && $room->send_bird_channel_url) {
			$sendBirdChannelService->removeUsersFromChannel([$user_id], $room->send_bird_channel_url);
		}

		\App\Models\RoomUser::where(['room_id' => $room_id, 'user_id' => $user_id])->delete();

		$file_name = "c_" . $room_id . "_" . $user_id . ".json";
		\Storage::disk('public')->delete('assets\chats\\' . $file_name);

		\App\Models\RoomIgnore::where([
			'room_id' => $room_id,
			'user_id' => $user_id
		])->delete();

		\App\Models\UserRoomSetting::where([
			'room_id' => $room_id,
			'user_id' => $user_id
		])->delete();

		\App\Models\WhisperChannel::where([
			'room_id' => $room_id
		])
			->where(function ($q) use ($user_id) {
				$q->where('user_id', $user_id)
					->orWhere('to_user_id', $user_id);
			})->delete();

		//            \App\Models\RoomBannedUser::where([
//                'room_id' => $room_id,
//                'user_id' => $user_id
//            ])->delete();
//
//            \App\Models\RoomKickUser::where([
//                'room_id' => $room_id,
//                'user_id' => $user_id
//            ])->delete();

		\App\Models\PlayVideoShare::where('user_id', $user_id)->delete();
	}

	public static function removePmUserInformation($pm_id, $user_id, $sendBirdChatService, $isLogout = false)
	{
		$pm = \App\Models\Pm::where('id', $pm_id)->first();

		if ($pm) {

			$isAddedUser = false;
			$isAdminUser = false;
			$isOtherUser = false;
			foreach ($pm->users as $pmUser) {

				if ($pmUser->user_id == $user_id) {
					if ($pmUser->is_added) {
						$isAddedUser = true;
					} else {
						//dd($pmUser);
						if ($pmUser->is_admin) {
							$isAdminUser = true;
						} else {
							$isOtherUser = true;
						}
					}

				}
			}

			if ($isAddedUser) {

				$sendBirdChatService->removeUsersFromChannel([$user_id], $pm->send_bird_channel_url);

				\App\Models\PmUser::where(['pm_id' => $pm_id, 'user_id' => $user_id])->delete();

			} else {

				if ($isAdminUser) {
					\App\Models\PmUser::where(['pm_id' => $pm_id, 'is_added' => 0, 'is_admin' => 0])->update(['is_admin' => 1]);
				}

				\App\Models\PmUser::where(['pm_id' => $pm_id, 'user_id' => $user_id])->update(['is_admin' => 0, 'is_close' => 1]);

			}


			\App\Models\PmChat::where('pm_id', $pm_id)->where('type', 'auto_reply')->where('session_on_for', $user_id)->update(['session_on_for' => null]);

			//remove file on basis of preference setting chat history

			$siteSettingInst = new \App\Models\SiteSettingUserStructure();
			$siteSetting = $siteSettingInst->getListing([
				'key' => 'delete_chat_history_pm_window_closed',
			]);

			$userSetting = \App\Models\SiteSettingUser::where('user_id', Auth::id())->where('site_setting_id', $siteSetting->structure_id)->first();

			if ($userSetting && $userSetting->val == 1 || $isAddedUser) {
				$file_name = "pmc_" . (int) $pm_id . "_" . $user_id . ".json";
				\Storage::disk('public')->delete('assets\chats\\' . $file_name);

				$sendBirdChatService->resetMyChatHistory(Auth::id() . '', $pm->send_bird_channel_url);
			}



			// $param = [
			// 	'pm_id' => (int) $pm_id,
			// 	'user_id' => $user_id,
			// 	'type' => 'exit'
			// ];
			// self::emit($param, 'pmAddRemove');

			// \App\Models\UserPmSetting::where([
			//     'pm_id' => $pm_id,
			//     'user_id' => $user_id
			// ])->delete();





			$total_user = \App\Models\PmUser::where('pm_id', $pm_id)->count();
			if (!$total_user) {
				\App\Models\PmOpentalk::where(['pm_id' => $pm_id])->delete();

				if (!empty($send_bird_channel_url)) {
					$sendBirdChatService->deleteUserPMChannel($send_bird_channel_url->channel_url, $pm);
				}
				\App\Models\Pm::where('id', $pm_id)->delete();
			}

			// if ($isLogout || !$total_user) {
			// \App\Models\PmRecent::where([
			// 	'pm_id' => $pm_id
			// ])->where(function ($q) use ($user_id) {
			// 	$q->where('third_user_id', $user_id)->orWhere('for_user_id', $user_id)->orWhere('user_id', $user_id);
			// })->delete();
			//}

			$recentPm = \App\Models\PmRecent::where('pm_id', $pm_id)->first();
			if ($recentPm) {
				$closedData = $recentPm && $recentPm->is_closed ? json_decode($recentPm->is_closed) : null;
				$encodeData = null;
				if ($closedData) {
					$encodeData = collect($closedData);
					$encodeData[$user_id] = true;
				}

				//dd($encodeData);

				$deleteRecentPm = true;

				if ($encodeData) {
					foreach ($encodeData as $id => $val) {
						$deleteRecentPm = $val;
						if (!$deleteRecentPm) {
							break;
						}
					}
				}

				//dd($deleteRecentPm);

				if ($deleteRecentPm) {
					$recentPm->delete();
				} else {
					if ($encodeData) {
						if ($isAddedUser) {
							unset($encodeData[$user_id]);
							$recentPm->update(['third_user_id' => null, 'is_closed' => json_encode($encodeData)]);
						} else {
							$recentPm->update(['is_closed' => json_encode($encodeData)]);
						}
					}
				}
			}
		}
	}

	public static function checkPmExist($owner_id, $user_id)
	{
		//check pm already exist or
		//not between these two users
		$pm = \App\Models\Pm::select("pms.id")
			->selectRaw("COUNT(*) AS total_user")
			->leftJoin('pm_users', function ($join) use ($owner_id, $user_id) {
				$join->on("pms.id", "pm_users.pm_id")
					->where(function ($q) use ($owner_id, $user_id) {
						$q->where('pm_users.user_id', $owner_id)
							->orWhere('pm_users.user_id', $user_id);
					});
				// ->orWhere("pm_users.is_close",0);
			})
			->having("total_user", 2)
			->where("pms.tot_user", 2)
			->where('pm_type', 'single')
			->groupBy('id')
			->first();
		return $pm;
	}

	public static function createPmUsers($request, $pm, $owner_id, $user_id)
	{

		\App\Models\PmUser::create([
			'pm_id' => $pm->id,
			'user_id' => $owner_id,
			'joined_by_id' => $owner_id,
			'is_admin' => $user_id != $owner_id ? 1 : 0,
			'is_self' => $user_id == $owner_id ? 1 : 0,
			'ip_addr' => $request->ip(),
			'timezone' => self::getTimezone($request->ip())
		]);
		//$isNotExist = \App\Models\UserPmSetting::where(['user_id' => $owner_id, 'pm_id' => $pm->id])->doesntExist();
		// if ($isNotExist) {
		// 	$isDefaultPmSettings = \App\Models\UserPmDefaultSetting::where([
		// 		'user_id' => $owner_id,
		// 		'pm_id' => $pm->id
		// 	])->first();
		// 	if ($isDefaultPmSettings) {
		// 		\App\Models\UserPmDefaultSetting::query()
		// 			->where(['user_id' => $owner_id, 'pm_id' => $pm->id])
		// 			->each(function ($isDefaultPmSettings) {
		// 				$newPmSettings = $isDefaultPmSettings->replicate();
		// 				$newPmSettings->setTable('user_pm_settings');
		// 				$newPmSettings->save();
		// 			});
		// 	} else {
		// 		\App\Models\UserPmSetting::create([
		// 			'user_id' => $owner_id,
		// 			'pm_id' => $pm->id
		// 		]);
		// 		\App\Models\UserPmDefaultSetting::create([
		// 			'user_id' => $owner_id,
		// 			'pm_id' => $pm->id
		// 		]);
		// 	}
		// }
		if ($user_id != $owner_id) {
			$userInfo = \App\Models\User::select('ip_addr', 'timezone')->where('id', $user_id)->first();
			\App\Models\PmUser::create([
				'pm_id' => $pm->id,
				'user_id' => $user_id,
				'joined_by_id' => $owner_id,
				'is_admin' => 0,
				'is_self' => 0,
				'ip_addr' => $userInfo->ip_addr || '',
				'timezone' => $userInfo->timezone || date_default_timezone_get(),
			]);
		}

		// $isNotExist = \App\Models\UserPmSetting::where(['user_id' => $user_id, 'pm_id' => $pm->id])->doesntExist();
		// if ($isNotExist) {
		// 	$isDefaultPmSettings = \App\Models\UserPmDefaultSetting::where([
		// 		'user_id' => $user_id,
		// 		'pm_id' => $pm->id
		// 	])->first();
		// 	if ($isDefaultPmSettings) {
		// 		\App\Models\UserPmDefaultSetting::query()
		// 			->where(['user_id' => $user_id, 'pm_id' => $pm->id])
		// 			->each(function ($isDefaultPmSettings) {
		// 				$newPmSettings = $isDefaultPmSettings->replicate();
		// 				$newPmSettings->setTable('user_pm_settings');
		// 				$newPmSettings->save();
		// 			});
		// 	} else {
		// 		\App\Models\UserPmSetting::create([
		// 			'user_id' => $user_id,
		// 			'pm_id' => $pm->id
		// 		]);
		// 		\App\Models\UserPmDefaultSetting::create([
		// 			'user_id' => $user_id,
		// 			'pm_id' => $pm->id
		// 		]);
		// 	}
		// }
	}

	public static function sendAutoReplyIfSet($pm, $pmUser, $timezone, $sendBirdChatService)
	{
		$sendUserAutoReplyMessage = false;
		$message = '';

		if ($pm && $pmUser && $sendBirdChatService) {
			$user = \App\Models\User::where('id', $pmUser)->first();
			$userModel = new \App\Models\User();
			$userData = $userModel->userWithAppends($user);

			if ($userData && $userData->auto_reply_message) {
				$userAutoReplyMessage = (object) $userData->auto_reply_message;
				if ($userAutoReplyMessage->enable_auto_reply) {

					if ($userAutoReplyMessage->start_date && $userAutoReplyMessage->end_date) {
						$start_time = '00:00 am';
						$end_time = '11:59 pm';

						if ($userAutoReplyMessage->start_time) {
							$start_time = $userAutoReplyMessage->start_time;
						}
						if ($userAutoReplyMessage->end_time) {
							$end_time = $userAutoReplyMessage->end_time;
						}


						$set_timezone = date_default_timezone_get();

						if ($timezone && $timezone != "1") {
							$set_timezone = $timezone;
						}

						//dd($set_timezone);
						$nowInTz = \Carbon\Carbon::now(new \DateTimeZone($set_timezone));

						$startDate = \Carbon\Carbon::createFromFormat('m/d/Y H:i A', $userAutoReplyMessage->start_date . $start_time, $set_timezone);

						$endDate = \Carbon\Carbon::createFromFormat('m/d/Y H:i A', $userAutoReplyMessage->end_date . $end_time, $set_timezone);
						//dd($endDate);
						$res = $nowInTz->greaterThanOrEqualTo($startDate) && $nowInTz->lessThanOrEqualTo($endDate);
						//dd($res);

						if (!$res) {
							$data['sendUserAutoReplyMessage'] = $sendUserAutoReplyMessage;
							$data['message'] = $message;
							return $data;
						}

					}


					$autoReplyMessage = $userAutoReplyMessage->customize_auto_reply_msg;
					if ($userAutoReplyMessage->selected_message_id) {
						$autoReplyMessage = $userAutoReplyMessage->selected_message->message;
					}
					if ($autoReplyMessage) {
						$message = $autoReplyMessage;
						$sendUserAutoReplyMessage = true;
						$sendBirdChatService->sendMessageToChannel($user->id, $pm->send_bird_channel_url, $autoReplyMessage, 'auto_reply');
					}
				}
			}
		}

		$data['sendUserAutoReplyMessage'] = $sendUserAutoReplyMessage;
		$data['message'] = $message;
		return $data;
	}


	public static function sendPmNotification($pm, $owner)
	{
		$pmUserObj = new \App\Models\PmUser();
		$chatExist = \App\Models\PmChat::where('pm_id', $pm)->first();
		// if (is_null($chatExist)) {
		// dd("chat2222..",$chatExist);

		//\App\Models\PmUser::where(['pm_id' => $pm])->update(['is_admin' => 0]);
		//\App\Models\PmUser::where(['pm_id' => $pm, 'user_id' => $owner->id])->update(['is_admin' => 1, 'is_read' => 1]);
		// $pmObj = \App\Models\Pm::where(['id' => $pm])->first();
		// $is_updated = $pmObj->update(['is_initialize' => 1]);
		// sent notification to other users
		//dd($is_updated, $pmObj, "..", $owner);
		$current_users = $pmUserObj->getListing([
			'pm_id' => $pm,
			'user_id_not' => $owner->id,
			//'with' => ['user']
		]);
		//dd($current_users);
		if (count($current_users)) {
			$data['user'] = [];
			foreach ($current_users as $u) {
				$from_customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
					->where(['for_user_id' => $owner->id, 'user_id' => $u->user_id])
					->first();
				$record = \App\Models\Notification::create([
					'from_user_id' => $owner->id,
					'to_user_id' => $u->user_id,
					'type' => 'pm_notification',
					'entity_id' => $pm,
					'message' => (($from_customized_nickname) ? $from_customized_nickname->nickname : $owner->username) . ' has sent you a PM.',
				]);
				// dd("record....",$record);
				$data['user'][] = $record;
			}

			//dd($data);
			self::emit($data, 'Invite');
		}
		// }
	}

	public static function sendNotificationGiftSender($reciever, $sender, $invitationId, $message = '', $type = 'gift_accepted')
	{
		$from_customized_nickname_gift_sender = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
			->where(['for_user_id' => $reciever->id, 'user_id' => $sender->id])
			->first();

		$giftAcceptedRecord = \App\Models\Notification::create([
			'from_user_id' => $reciever->id,
			'to_user_id' => $sender->id,
			'type' => $type,
			'entity_id' => $invitationId,
			'message' => (($from_customized_nickname_gift_sender) ? $from_customized_nickname_gift_sender->nickname : $reciever->username) . ($message ? ' ' . $message : ' has accepted your gift.')
		]);
		$senderData['user'][] = $giftAcceptedRecord;
		self::emit($senderData, 'Invite');
	}

	public static function sendPmInviteNotification($pm, $owner, $invitedUser, $sendBirdChatService, $other_user)
	{
		$from_customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
			->where(['for_user_id' => $owner->id, 'user_id' => $invitedUser])
			->first();

		$from_customized_nickname_other_user = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
			->where(['for_user_id' => $other_user->user_id, 'user_id' => $invitedUser])
			->first();

		$record = \App\Models\Notification::create([
			'from_user_id' => $owner->id,
			'to_user_id' => $invitedUser,
			'type' => 'pm_invite',
			'entity_id' => $pm,
			'message' => (($from_customized_nickname) ? $from_customized_nickname->nickname : $owner->username) . ' is adding you to a PM with ' . ($from_customized_nickname_other_user ? $from_customized_nickname_other_user->nickname : $other_user->userInfo->username),
		]);
		$data['user'][] = $record;
		$data['type'] = 'pm_invite';





		// send notification to other user that new user has been invited to PM


		$admin_customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
			->where(['for_user_id' => $owner->id, 'user_id' => $other_user->user_id])
			->first();

		$invited_customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
			->where(['for_user_id' => $invitedUser, 'user_id' => $other_user->user_id])
			->first();

		$userInvited = \App\Models\User::where('id', $invitedUser)->first();



		$record = \App\Models\Notification::create([
			'from_user_id' => $owner->id,
			'to_user_id' => $other_user->user_id,
			'type' => 'pm_notification',
			'entity_id' => $pm,
			'message' => (($admin_customized_nickname) ? $admin_customized_nickname->nickname : $owner->username) . ' is adding ' . ($invited_customized_nickname ? $invited_customized_nickname->nickname : $userInvited->username) . ' to a PM with you',
		]);
		$otherData['user'][] = $record;
		//$otherData['type'] = 'pm_notification';


		self::emit($data, 'Invite');
		sleep(1);
		self::emit($otherData, 'Invite');

	}
	public static function processSendChat($pm_id, $owner, $chatArry = [], $sendBirdChatService, $message_id)
	{
		$chat = \App\Models\PmChat::create($chatArry);

		$pmUserObj = new \App\Models\PmUser();
		$users = [];
		$users = $pmUserObj->getListing([
			'pm_id' => $pm_id,
			//'get_sql' => 1
		])->pluck('timezone', 'user_id')->toArray();
		$chatdtls['msgs'] = [];
		if (count($users)) {
			$cdn = \App\Models\Cdn::where("status", 1)->first();
			$chat_array = $chat->toArray();
			$file_path = public_path("storage/" . $cdn->cdn_path . "chats" . "/");
			$pmObj = \App\Models\Pm::where(['id' => $pm_id])->first();
			$forUserId = null;
			$thirdUserId = null;

			foreach ($users as $cu => $timezone) {

				$pmc_user = $cu;
				$user_timezone = $timezone;
				$customize_for_user_id = $owner->id;
				$customize_user_id = $cu;
				$autoReply = false;
				$autoReplyMessage = '';


				$file_name = "pmc_" . $pm_id . "_" . $pmc_user . ".json";
				$chat_array['post_converted_timestamp'] = self::convertTimetoLocalTime($chat_array['post_timestamp'], $user_timezone);
				$customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
					->where(['for_user_id' => $customize_for_user_id, 'user_id' => $customize_user_id])
					->first();
				$chat_array['customize_nickname'] = ($customized_nickname) ? $customized_nickname->toArray() : $customized_nickname;

				$chat_array['view_user_id'] = $autoReply ? $owner->id : $cu;
				$chat_array['message_id'] = $message_id;
				$chat_array['translations'] = [];

				$chatWithoutUser = $chat_array;



				if (file_exists($file_path . $file_name)) {
					$inp = file_get_contents($file_path . $file_name);
					$tempArray = json_decode($inp, true);
					unset($chatWithoutUser['user_details']);
					array_push($tempArray, $chatWithoutUser);
					$jsonData = json_encode($tempArray);

					file_put_contents($file_path . $file_name, $jsonData);

				} else {
					$fp = fopen($file_path . $file_name, 'w');
					$tempArray = [];
					unset($chatWithoutUser['user_details']);
					array_push($tempArray, $chatWithoutUser);
					fwrite($fp, json_encode($tempArray));
					fclose($fp);
				}

				$chat_array['view_user_id'] = $cu;
				array_push($chatdtls['msgs'], $chat_array);


				if ($cu != $owner->id) {

					if (!$forUserId) {
						$forUserId = $cu;
					} else {
						$thirdUserId = $cu;
					}



					$is_sent = \App\Models\PmChat::where('pm_id', $pm_id)->where('user_id', $cu)->where('type', 'auto_reply')->where('session_on_for', $owner->id)->first();

					if (!$is_sent) {

						$messageData = self::sendAutoReplyIfSet($pmObj, $cu, $timezone, $sendBirdChatService);

						if ($messageData && $messageData['sendUserAutoReplyMessage']) {

							foreach ($users as $lcu => $lcu_timezone) {
								if ($lcu != $cu) {



									$autoReply = true;
									$pmc_user = $lcu;
									$user_timezone = $lcu_timezone;
									$customize_for_user_id = $cu;
									$customize_user_id = $lcu;
									$autoReplyMessage = $messageData['message'];

									$replyChat = new \App\Models\PmChat();
									$replyChat->pm_id = $pm_id;
									$replyChat->chat_body = $autoReplyMessage;
									$replyChat->type = 'auto_reply';
									$replyChat->session_on_for = $lcu;

									$replyChat->user_id = $cu;
									$replyChat->save();

									$reply_chat_array = $replyChat->toArray();


									$file_name = "pmc_" . $pm_id . "_" . $pmc_user . ".json";

									$reply_chat_array['post_converted_timestamp'] = self::convertTimetoLocalTime($reply_chat_array['post_timestamp'], $user_timezone);
									$customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
										->where(['for_user_id' => $customize_for_user_id, 'user_id' => $customize_user_id])
										->first();
									$reply_chat_array['customize_nickname'] = ($customized_nickname) ? $customized_nickname->toArray() : $customized_nickname;

									$replyChatdtls['msgs'] = [];
									$reply_chat_array['view_user_id'] = $autoReply ? $lcu : $cu;
									$replyChatWithoutUser = $reply_chat_array;
									unset($replyChatWithoutUser['user_details']);

									if (file_exists($file_path . $file_name)) {
										$inp = file_get_contents($file_path . $file_name);
										$tempArray = json_decode($inp, true);
										array_push($tempArray, $replyChatWithoutUser);
										$jsonData = json_encode($tempArray);
										file_put_contents($file_path . $file_name, $jsonData);

									} else {
										$fp = fopen($file_path . $file_name, 'w');
										$tempArray = [];
										array_push($tempArray, $replyChatWithoutUser);
										fwrite($fp, json_encode($tempArray));
										fclose($fp);
									}

									array_push($replyChatdtls['msgs'], $reply_chat_array);
								}
							}
						}

					}
				}
			}

			// $recentPM = \App\Models\PmRecent::where("for_user_id", $owner->id)
			// 	->orWhere("user_id", $owner->id)
			// 	->orWhere("third_user_id", $owner->id);

			if ($owner && $forUserId) {
				$recentPM = null;
				if ($thirdUserId) {
					$recentPM = \App\Models\PmRecent::whereIn("for_user_id", [$owner->id, $forUserId, $thirdUserId])
						->whereIn("user_id", [$owner->id, $forUserId, $thirdUserId])
						->whereIn("third_user_id", [$owner->id, $forUserId, $thirdUserId])->first();
					// $recentPM = \App\Models\PmRecent::where("user_id", $owner->id)
					// 	->where("for_user_id", $forUserId)
					// 	->where("third_user_id", $thirdUserId)->first();
				} else {
					$recentPM = \App\Models\PmRecent::whereIn("for_user_id", [$owner->id, $forUserId, $thirdUserId])
						->whereIn("user_id", [$owner->id, $forUserId, $thirdUserId])->first();

					// $recentPM = \App\Models\PmRecent::where("user_id", $owner->id)
					// 	->where("for_user_id", $forUserId)->first();
				}
				//dd($recentPM);

				if (!$recentPM) {

					$forUser = \App\Models\PmUser::where('user_id', $forUserId)->where('pm_id', $pm_id)->first();


					$encodeData = [$owner->id => false, $forUserId => ($forUser && $forUser->is_close ? true : false)];
					if ($thirdUserId) {
						$thirdUser = \App\Models\PmUser::where('user_id', $thirdUserId)->where('pm_id', $pm_id)->first();
						//dd($forUser);
						$encodeData[$thirdUserId] = ($thirdUser->is_close ? true : false);
					}

					$closedData = json_encode($encodeData);
					//dd($closedData);
					\App\Models\PmRecent::create([
						'user_id' => $owner->id,
						'for_user_id' => $forUserId,
						'third_user_id' => $thirdUserId,
						'pm_id' => $pm_id,
						'is_closed' => $closedData
					]);
				}

			}


			// $resentPmJob = new \App\Jobs\SendRecentPmJob($users);
			// dispatch($resentPmJob);

			if (count($users)) {
				$recentPmObj = new \App\Models\PmRecent();
				foreach ($users as $user => $timezone) {
					$recentPm = $recentPmObj->getListing([
						'for_user_id' => $user,
						'groupBy' => 'pm_id',
					]);

					if (count($recentPm)) {
						foreach ($recentPm as $pm) {
							$pm->pm_info = \DB::table('pms')->where('id', $pm->pm_id)->first();
						}
					}

					$data[$user] = $recentPm;
				}

				\App\Helpers\Helper::emit($data, 'recentPm');
			}


		}

		$chatdtls['pm_admin_user'] = \App\Models\PmUser::where(['pm_id' => $pm_id, 'is_admin' => 1])->first();

		//dd($chatdtls);

		$chatJob = new \App\Jobs\SendPmChatJob($chatdtls);
		dispatch($chatJob);

		//Helper::emit($chatdtls, 'pmChatMessage');

		return $chat;

	}

	public static function convertTimetoLocalTime($post_time, $timezone)
	{
		$converted_time = self::convertGMTToLocalTimezone($post_time, $timezone);
		return self::showdate($converted_time);
	}

	public static function exitFromAllRooms($user)
	{
		$roomUserObj = new \App\Models\RoomUser();
		$list = $roomUserObj->getListing(['user_id' => $user->id])->pluck('room_id', 'id');
		if (count($list)) {
			$roomObj = new \App\Models\Room();
			$pram = [];
			foreach ($list as $key => $room_id) {
				self::removeRoomUserInformation($room_id, $user->id);

				$notificationJob = new \App\Jobs\SendExitRoomNotificationJob((int) $room_id, $user);
				dispatch($notificationJob);

				$srch_params['id'] = $room_id;
				$room = $roomObj->getListing($srch_params);
				if ($room && $room->room_type_id == 1 && $room->locked_room) {
					$is_any_admin_exist = \App\Models\RoomUser::where('is_admin', '<>', 0)
						->where('room_id', $room_id)->count();
					if (!$is_any_admin_exist) {
						$userList = $roomUserObj->getListing(['room_id' => $room_id]);
						$param = [];
						if (count($userList)) {
							foreach ($userList as $room_user) {
								self::removeRoomUserInformation($room_id, $room_user->user_id);
								$param['user'][] = $room_user->toArray();
							}
						}
						\App\Models\RoomUser::where(['room_id' => $room_id])->delete();
						//\App\Models\RoomOpentalk::where(['room_id' => $room_id])->delete();
						$room->update(['is_closed' => 1]);
						$param['room_id'] = $room_id;
						$param['type'] = 'room_close';
						self::emit($param, 'RoomMemberOption');
					}
				}
				$pram[] = [
					'room_id' => $room_id,
					'user_id' => $user->id
				];
				$total_user = \App\Models\RoomUser::where('room_id', $room_id)->count();
				//delete private room if there is no member
				if ($room && $room->room_type_id == 2) {
					if (!$total_user) {
						\App\Models\RoomOpentalk::where(['room_id' => $room_id])->delete();

						dispatch(function () use ($room) {
							$sendBirdChannelService = new SendBirdChannelService(new SendBirdChannelRepository());
							$sendBirdChannelService->deleteGroupChannel($room->send_bird_channel_url, $room);
						})->afterResponse();

						$room->delete();
					}
				} elseif ($room->room_type_id == 1) {
					if (!$total_user) {
						$room->update(['is_closed' => 1]);
					}
				}

				//remove chats on logout

				$cdn = \App\Models\Cdn::where("status", 1)->first();
				$file_path = "storage/" . $cdn->cdn_path . "chats" . "/";
				$file_name = "c_" . $room_id . "_" . $user->id . ".json";
				if (file_exists($file_path . $file_name)) {
					unlink($file_path . $file_name);
				}

			}
			$pram['type'] = 'exit';
			self::emit($pram, 'RoomMemberOption');
		}
	}

	public static function createUserRoomSetting($user_id, $room_id)
	{
		// $isNotExist = \App\Models\UserRoomSetting::where(['user_id' => $user_id, 'room_id' => $room_id])->doesntExist();
		// if ($isNotExist) {
		// 	$isDefaultRoomSettings = \App\Models\UserRoomDefaultSetting::where([
		// 		'user_id' => $user_id,
		// 		'room_id' => $room_id
		// 	])->first();
		// 	if ($isDefaultRoomSettings) {
		// 		\App\Models\UserRoomDefaultSetting::query()
		// 			->where(['user_id' => $user_id, 'room_id' => $room_id])
		// 			->each(function ($isDefaultRoomSettings) {
		// 				$newRoomSettings = $isDefaultRoomSettings->replicate();
		// 				$newRoomSettings->setTable('user_room_settings');
		// 				$newRoomSettings->save();
		// 			});
		// 	} else {
		// 		\App\Models\UserRoomSetting::create([
		// 			'user_id' => $user_id,
		// 			'room_id' => $room_id
		// 		]);
		// 		\App\Models\UserRoomDefaultSetting::create([
		// 			'user_id' => $user_id,
		// 			'room_id' => $room_id
		// 		]);
		// 	}
		// }
	}

	public static function validateAndSendEmail($request, $validationRules, $email_template_key)
	{
		//dd(\Carbon\Carbon::createFromFormat('m/d/Y H:i A', $request->start_date . $request->start_time, 'UTC')->toDayDateTimeString());
		$validator = \Validator::make($request->all(), $validationRules);
		if ($validator->fails()) {
			return \App\Helpers\Helper::rj('Bad Request', 400, [
				'errors' => $validator->errors()
			]);
		} else {
			$emails = array_map('trim', explode(",", $request->emails));

			if (count($emails)) {
				$missed = [];
				foreach ($emails as $mail) {

					$user = \App\Models\User::where('email', $mail)->orWhere('username', $mail)->first();

					$user_id = $user ? $user->id : null;

					$nickname = null;
					$startDate = null;
					$endDate = null;

					$start_time = '00:00 am';
					$end_time = '11:59 pm';

					$set_timezone = \Auth::user()->timezone;

					if ($request->isScheduled) {

						if (!isset($request->start_date) || !$request->start_date) {
							return self::rj('Please provide Start date', 400);
						}

						if (!isset($request->end_date) || !$request->end_date) {
							return self::rj('Please provide End date', 400);
						}



						if (isset($request->start_time) && $request->start_time) {
							$start_time = $request->start_time;
						}

						if (isset($request->end_time) && $request->end_time) {
							$end_time = $request->end_time;
						}

						//dd($request->end_date . ' ' . $end_time);

						$startDate = \Carbon\Carbon::createFromFormat('m/d/Y H:i A', $request->start_date . ' ' . $start_time, $set_timezone)->toDayDateTimeString();


						$endDate = \Carbon\Carbon::createFromFormat('m/d/Y H:i A', $request->end_date . ' ' . $end_time, $set_timezone)->toDayDateTimeString();

					}

					$sendEmail = true;
					$email = $mail;

					if ($user) {
						$nickname = $user->username;
						if (!filter_var($mail, FILTER_VALIDATE_EMAIL)) {
							$email = $user->email;
						}
					} else {
						$sendEmail = false;
						$missed[] = $mail;
					}

					if ($sendEmail) {


						$from_customized_nickname = null;

						if ($user_id) {
							$from_customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
								->where(['for_user_id' => \Auth::id(), 'user_id' => $user_id])
								->first();
						}

						$mailData = [
							'content' => (isset($request->message)) ? $request->message : '',
							'sender_name' => $from_customized_nickname ? $from_customized_nickname->nickname : \Auth::user()->username
						];

						if (isset($request->room_id) && $request->room_id) {
							$mailData['room_name'] = '';
							$room = \App\Models\Room::where('id', $request->room_id)->first();
							if ($room) {
								$mailData['room_name'] = $room->room_name;
							}
						}
						if ($email_template_key === 'room_invite') {
							$mailData['room_link'] = $request->room_link;
						}
						if ($email_template_key === 'vip_invite') {

							$user = \App\Models\User::where('email', $email)->first();

							$invitation_code = '' . (mt_rand(1, 999999) + now()->getTimestampMs());

							$user_inviation_link = $request->room_link;

							$vipInvitationObj = new \App\Models\VIPInvitation();
							$record = $vipInvitationObj->getListing(['email' => $email, 'room_id' => $request->room_id])->first();

							//dd($record);

							$invitation_code = '' . (mt_rand(1, 999999) + now()->getTimestampMs());

							if (!$record) {

								$user_inviation_link = $request->room_link . '?nickname=' . ($nickname ? $nickname : '') . '&invitation_code=' . $invitation_code;

								\App\Models\VIPInvitation::create([
									'email' => $email,
									'nickname' => $nickname,
									'user_id' => $user ? $user->id : null,
									'room_id' => $request->room_id,
									'invitation_code' => $invitation_code,
									'invited_by' => Auth::id(),
									'start_at' => $request->isScheduled ? $request->start_date . ' ' . $start_time : null,
									'close_at' => $request->isScheduled ? $request->end_date . ' ' . $end_time : null
								]);

							} else {
								$user_inviation_link .= '?nickname=' . ($nickname ? $nickname : '') . '&invitation_code=' . $record->invitation_code;
								\App\Models\VIPInvitation::where('id', $record->id)->update([
									'start_at' => $request->isScheduled ? $request->start_date . $start_time : null,
									'close_at' => $request->isScheduled ? $request->end_date . $end_time : null,
									'invitation_code' => $invitation_code,
									'expired_at' => null
								]);
							}

							//dd($user_inviation_link);


							if (!$user) {
								$email_template_key = $request->isScheduled ? 'scheduled_register_vip_invite' : 'register_vip_invite';

								$mailData['registration_link'] = env('FRONTEND_BASE_URL', "https://sendbird.dxx1s7zkaz795.amplifyapp.com") . '/registration';

							} else {
								$email_template_key = $request->isScheduled ? 'scheduled_vip_invite' : 'vip_invite';
							}



							$mailData['room_link'] = $user_inviation_link;

							if ($request->isScheduled) {
								$mailData['start_date'] = $startDate;
								$mailData['end_date'] = $endDate;
							}


						}

						\App\Models\SiteTemplate::sendMail($email, '', $mailData, $email_template_key);
					}

				}


				if (count($missed)) {

					return self::rj('Unable to send invitation email to these all nicknames / emails "' . implode(',', $missed) . '"', 404);

				}
			}
			return self::rj('Emails has been sent successfully.', 200, []);
		}
	}

	public static function calculateAvailableCredit($user = null)
	{
		$today = date("Y-m-d");

		if (!$user) {
			$user = Auth::user();
		}


		$credits = \App\Models\UserCredit::selectRaw("SUM(points - point_redeemed) as credit")
			->where('user_id', $user->id)
			->where('process', 'add')
			->whereNull('expire_at')
			->orWhere(function ($q) use ($user, $today) {
				$q->whereDate('expire_at', '>=', $today)
					->where('user_id', $user->id);
			})
			->first();

		//dd($credits);


		// Reserve Credits
		$giftInvites = \App\Models\GiftInvite::where('from_user', $user->id)->where('expired_at', '>', now())->select(['sticker_id', 'pack_id', 'subscription_price_id'])->get();




		$packCredits = \App\Models\StickerPack::whereIn('id', $giftInvites->whereNotNull('pack_id')->pluck('pack_id')->toArray())->sum('credit_points');
		$reserverCredits = 0 + $packCredits;
		$stickerObj = new \App\Models\Sticker();
		$record = $stickerObj->getListing([
			'id' => $giftInvites->whereNotNull('sticker_id')->pluck('sticker_id')->toArray(),
			'type' => 'credit'
		]);

		$reserverCredits += $record->sum('credit_points');




		$subscription_price = \App\Models\SubscriptionPrice::whereIn('id', $giftInvites->whereNotNull('subscription_price_id')->pluck('subscription_price_id')->toArray());



		$reserverCredits += $subscription_price->sum('points');

		$credits->credit = $credits->credit - $reserverCredits;

		return $credits;
	}


	public static function calculateCreditExpenses($redeemed_credit = 0, $user = null)
	{
		$today = date("Y-m-d");
		if (!$user) {
			$user = Auth::user();
		}
		$credits = \App\Models\UserCredit::selectRaw("id, (points - point_redeemed) as credit")
			->where('user_id', $user->id)
			->where('process', 'add')
			->whereRaw('(points - point_redeemed) > 0')
			->whereNull('expire_at')
			->orWhere(function ($q) use ($user, $today) {
				$q->whereDate('expire_at', '>=', $today)
					->where('user_id', $user->id);
			})
			->orderBy('credit_type')
			->get();



		if (count($credits)) {
			// Map storing amount_redeemed against id
			$point_redeemed_map = [];
			foreach ($credits as $credit) {
				$point_redeemed = min($credit->credit, $redeemed_credit);
				$point_redeemed_map[$credit->id] = $point_redeemed;
				$redeemed_credit -= $point_redeemed;
				if ($redeemed_credit == 0) {
					break;
				} else {
					// This should never happen, still if it happens, throw error
					//throw new Exception("Something wrong with logic!");
				}
			}

			if (count($point_redeemed_map)) {
				foreach ($point_redeemed_map as $key => $redeemed_point) {
					$record = \App\Models\UserCredit::find($key);
					\App\Models\UserCredit::where(['id' => $key])->update(['point_redeemed' => ($record->point_redeemed + $redeemed_point)]);
					\App\Models\UserCredit::create([
						'user_id' => $user->id,
						'points' => $redeemed_point,
						'process' => 'deduct',
					]);
				}
			}
		}
	}


	public static function calculateTranslationCharsExpenses($chars_redeemed = 0, $user = null)
	{


		if (!$user) {
			$user = Auth::user();
		}
		$chars = \App\Models\UserTranslationChar::selectRaw("id, (chars - redeemed_chars) as chars")
			->where('user_id', $user->id)
			->where('process', 'add')
			->whereRaw('(chars - redeemed_chars) > 0')
			->get();

		//dd($chars);



		if (count($chars)) {
			// Map storing char_redeemed against id
			$char_redeemed_map = [];
			foreach ($chars as $char) {
				$redeemed = min($char->chars, $chars_redeemed);
				$char_redeemed_map[$char->id] = $redeemed;
				$chars_redeemed -= $redeemed;
				if ($chars_redeemed == 0) {
					break;
				} else {
					// This should never happen, still if it happens, throw error
					//throw new Exception("Something wrong with logic!");
				}
			}

			if (count($char_redeemed_map)) {
				foreach ($char_redeemed_map as $key => $redeemed_char) {
					$record = \App\Models\UserTranslationChar::find($key);
					\App\Models\UserTranslationChar::where(['id' => $key])->update(['redeemed_chars' => ($record->redeemed_chars + $redeemed_char)]);
					\App\Models\UserTranslationChar::create([
						'user_id' => $user->id,
						'chars' => $redeemed_char,
						'process' => 'deduct',
					]);
				}
			}
		}
	}


	public static function resetAllSettingsRoomAndPm()
	{

		// $user_id = Auth::id();

		// $pmRecs = \App\Models\PmUser::select('pm_id')->where('user_id', $user_id)->get();

		// if ($pmRecs) {
		// 	foreach ($pmRecs as $pm) {
		// 		$pm_id = $pm->pm_id;

		// 		$default_pm_settings = \App\Models\UserPmDefaultSetting::where([
		// 			'user_id' => $user_id,
		// 			'pm_id' => $pm->pm_id
		// 		])->first();
		// 		if ($default_pm_settings) {
		// 			\App\Models\UserPmSetting::where(['user_id' => $user_id, 'pm_id' => $pm_id])->delete();
		// 			\App\Models\UserPmDefaultSetting::query()
		// 				->where(['user_id' => $user_id, 'pm_id' => $pm_id])
		// 				->each(function ($default_pm_settings) {
		// 					$newPmSettings = $default_pm_settings->replicate();
		// 					$newPmSettings->setTable('user_pm_settings');
		// 					$newPmSettings->save();
		// 				});
		// 		}
		// 	}
		// }


		// $roomRecs = \App\Models\RoomUser::select('room_id')->where('user_id', $user_id)->where('is_accepted', 1)->get();

		// if ($roomRecs) {
		// 	foreach ($roomRecs as $room) {
		// 		//dd();
		// 		$room_id = $room->room_id;

		// 		$default_room_settings = \App\Models\UserRoomDefaultSetting::where([
		// 			'user_id' => $user_id,
		// 			'room_id' => $room_id
		// 		])->first();
		// 		if ($default_room_settings) {
		// 			\App\Models\UserRoomSetting::where(['user_id' => $user_id, 'room_id' => $room_id])->delete();
		// 			\App\Models\UserRoomDefaultSetting::query()
		// 				->where(['user_id' => $user_id, 'room_id' => $room_id])
		// 				->each(function ($default_room_settings) {
		// 					$newDefaultRoomSettings = $default_room_settings->replicate();
		// 					$newDefaultRoomSettings->setTable('user_room_settings');
		// 					$newDefaultRoomSettings->save();
		// 				});
		// 		}
		// 	}
		// }
	}



}
