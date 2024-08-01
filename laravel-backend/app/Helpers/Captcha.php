<?php
namespace App\Helpers;

/**
 *
 * @package		Captcha
 * @author		Dreamztech Solutions Pvt. Ltd. Team
 * @copyright		Copyright (c) Dreamztech Solutions.
 * @copyright		Copyright (c) Dreamztech Solutions (http://dreamztech.com/)
 * @since		Version 1.0
 * @DateOfCreation      2016-Feb-19
 */
// ------------------------------------------------------------------------

/**
 * Captcha Class
 *
 * @package		CodeIgniter
 * @subpackage          Libraries
 * @category            Captcha
 * @author		Dreamztech Solutions Pvt. Ltd. Team
 */
class Captcha {

	public $word       = null;
	public $img_path   = null;
	public $img_url    = null;
	public $font_path  = null;
	public $img_width  = null;
	public $img_height = null;
	public $expiration = null;

	/**
	 * Constructor
	 *
	 * @access	public
	 */
	public function __construct($props = array()) {
		if (count($props) > 0) {
			$this->initialize($props);
		}

		// log_message('debug', "Captcha Class Initialized");
	}

	// --------------------------------------------------------------------

	/**
	 * Initialize preferences
	 *
	 * @param	array
	 * @return	void
	 */
	public function initialize($config = array()) {
		$defaults = array(
			'word'       => '',
			'img_path'   => public_path('captcha/images/'),
			'img_url'    => asset('captcha/images/'),
			'font_path'  => public_path('captcha/font/monofont.ttf'),
			'img_width'  => 200,
			'img_height' => 65,
			'expiration' => 7200,
		);

		foreach ($defaults as $key => $val) {
			if (isset($config[$key])) {
				$method = 'set_' . $key;
				if (method_exists($this, $method)) {
					$this->$method($config[$key]);
				} else {
					$this->$key = $config[$key];
				}
			} else {
				$this->$key = $val;
			}
		}
	}

	public function create($data = array()) {
		if (!$data) {
			$this->initialize($data);
		}

		if ($this->img_path == '' OR $this->img_url == '') {
			return FALSE;
		}
		if (!@is_dir($this->img_path)) {
			return FALSE;
		}
		if (!is_writable($this->img_path)) {
			return FALSE;
		}
		if (!extension_loaded('gd')) {
			return FALSE;
		}
		// -----------------------------------
		// Remove old images
		// -----------------------------------
		list($usec, $sec) = explode(" ", microtime());
		$now              = ((float) $usec + (float) $sec);
		$current_dir      = @opendir($this->img_path);
		while ($filename = @readdir($current_dir)) {
			if ($filename != "." and $filename != ".." and $filename != "index.html") {
				$name = str_replace(".jpg", "", $filename);
				if (($name + $this->expiration) < $now) {
					@unlink($this->img_path . $filename);
				}
			}
		}
		@closedir($current_dir);

		$characters_on_image = 6;
		$font                = $this->font_path;

		//The characters that can be used in the CAPTCHA code.
		//avoid confusing characters (l 1 and i for example)
		$possible_letters    = '23456789bcdfghjkmnpqrstvwxyz';
		$random_dots         = 70;
		$random_lines        = 20;
		$captcha_text_color  = "0x" . rand(100000, 999999);
		$captcha_noice_color = "0x" . rand(100000, 999999);

		$code = '';

		$i = 0;
		while ($i < $characters_on_image) {
			$code .= substr($possible_letters, mt_rand(0, strlen($possible_letters) - 1), 1);
			$i++;
		}

		$font_size = $this->img_height * 0.75;
		$image     = @imagecreate($this->img_width, $this->img_height);

		/* setting the background, text and noise colours here */
		$background_color = imagecolorallocate($image, 255, 255, 255);

		$arr_text_color = $this->hexrgb($captcha_text_color);
		$text_color     = imagecolorallocate($image, $arr_text_color['red'], $arr_text_color['green'], $arr_text_color['blue']);

		$arr_noice_color   = $this->hexrgb($captcha_noice_color);
		$image_noise_color = imagecolorallocate($image, $arr_noice_color['red'], $arr_noice_color['green'], $arr_noice_color['blue']);

		/* generating the dots randomly in background */
		for ($i = 0; $i < $random_dots; $i++) {
			imagefilledellipse($image, mt_rand(0, $this->img_width), mt_rand(0, $this->img_height), 2, 3, $image_noise_color);
		}

		/* generating lines randomly in background of image */
		for ($i = 0; $i < $random_lines; $i++) {
			imageline($image, mt_rand(0, $this->img_width), mt_rand(0, $this->img_height), mt_rand(0, $this->img_width), mt_rand(0, $this->img_height), $image_noise_color);
		}

		/* create a text box and add 6 letters code in it */
		$textbox = imagettfbbox($font_size, 0, $font, $code);
		$x       = ($this->img_width - $textbox[4]) / 2;
		$y       = ($this->img_height - $textbox[5]) / 2;
		imagettftext($image, $font_size, 0, $x, $y, $text_color, $font, $code);

		$img_name = $now . '.jpg';
		ImageJPEG($image, $this->img_path . $img_name);
		$img = '<img src="' . $this->img_url . '/' . $img_name . '"/>';
		ImageDestroy($image);

		return array(
			'word'     => strtolower($code),
			'time'     => $now,
			'image'    => $img,
			'word-org' => $code,
		);
	}

	public function hexrgb($hexstr) {
		$int = hexdec($hexstr);

		return array("red" => 0xFF & ($int >> 0x10),
			"green"            => 0xFF & ($int >> 0x8),
			"blue"             => 0xFF & $int);
	}

	// --------------------------------------------------------------------
}

// END Captcha Class

/* End of file captcha.php */
/* Location: ./application/libraries/captcha.php */
