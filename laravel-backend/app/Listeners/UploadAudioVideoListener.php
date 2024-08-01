<?php

namespace App\Listeners;

use App\Events\UploadAudioVideoEvent;
use Illuminate\Contracts\Queue\ShouldQueue;
//use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Bus\Queueable;



class UploadAudioVideoListener
{
    use Queueable,
        DispatchesJobs;

    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param  UploadAudioVideoEvent  $event
     * @return void
     */
    public function handle(UploadAudioVideoEvent $event)
    {
        if ($event->request->hasFile($event->input_file)) {
            $cdn = \App\Models\Cdn::where("status", 1)->first();

            $file = $event->request->file($event->input_file);
            $fileExt = strtolower($file->getClientOriginalExtension());
            $fileNameOriginal = $file->getClientOriginalName();
            $fileSize = $file->getSize();
            $fileMime = $file->getMimeType();

            $mimes = new \Mimey\MimeTypes;

            if (!$fileExt) {
                $fileExt = $mimes->getExtension($fileMime);
            }


            if (!file_exists(public_path('temp/' . $event->request->type))) {
                mkdir(public_path('temp/' . $event->request->type), 0777, true);
            }

            // Generating file name
            $fileName = time() . rand();
            $target_file = public_path('temp/' . $event->request->type . '/') . $fileName . ($fileExt ? '.' . $fileExt : '');
            @move_uploaded_file($_FILES[$event->input_file]['tmp_name'], $target_file);

            $source = $target_file;
            $previousFile = null;
            // if file ext is not mp4 for video file and not mp3 for audio file, 
            // then first it will convert to respective format
            // then upload to s3 bucket.

            if ($event->request->type == 'video') {
                if ($fileMime != 'video/mp4') {
                    $convertUrl = public_path('temp/' . $event->request->type . '/' . $fileName . '.mp4');
                    $command = "ffmpeg -i " . $source . " " . $convertUrl . " -hide_banner";
                    exec($command);

                    $previousFile = $source;
                    $source = $convertUrl;
                    $fileExt = "mp4";
                }
            } elseif ($event->request->type == 'voice') {
                if ($fileMime != 'audio/mpeg') {
                    $convertUrl = public_path('temp/' . $event->request->type . '/' . $fileName . '.mp3');
                    $command = "ffmpeg -i " . $source . " " . $convertUrl . " -hide_banner";
                    exec($command);

                    $previousFile = $source;
                    $source = $convertUrl;
                    $fileExt = "mp3";
                }
            }

            // uploading file into s3 server
            $destination = $cdn->cdn_path . "avm/" . $fileName . ($fileExt ? '.' . $fileExt : '');
            //($fileExt && strpos($fileExt, ".") ? '.' . $fileExt : '');
            $upload = \App\Helpers\Helper::s3UploadLargeFile($destination, $source);

            if ($upload) {
                // unlink from local server
                @unlink($source);
                if ($previousFile) {
                    @unlink($previousFile);
                }

                $file = \App\Models\File::create([
                    'entity_id' => $event->entity_ids[0],
                    'entity_type' => 8,
                    'cdn_id' => $cdn->id,
                    'file_name' => $fileName . '.' . $fileExt,
                    'file_name_original' => $fileNameOriginal,
                    'file_ext' => $fileExt,
                    'file_mime' => $fileMime,
                    'location' => 'avm',
                    'file_size' => $fileSize,
                ]);

                if ($file) {
                    unset($event->entity_ids[0]);
                    if (count($event->entity_ids)) {
                        foreach ($event->entity_ids as $entity_id) {
                            $newFile = $file->replicate();
                            $newFile->entity_id = $entity_id;
                            $newFile->save();
                        }
                    }
                }
            }
        }
    }
}
