<?php
$filePath = base_path('bootstrap/cache/settings.php');
if(file_exists($filePath)){
	$settings = file_get_contents($filePath);
	$settings = (array)json_decode($settings);
	return $settings;
}
