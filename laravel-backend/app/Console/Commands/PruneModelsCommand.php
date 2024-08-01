<?php

namespace App\Console\Commands;

use App\Models\SendFile;
use App\Models\GiftInvite;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\QueryException;

class PruneModelsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'custom:prunable';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Prune Specific Model Old Data';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        try {
            // Delete GiftInvites if one hour or more has passed
            $oneHourAgo = now()->subHour();
            // Retrieve GiftInvites with users
            $giftInvites = GiftInvite::with('users')->where('expired_at', '<=', $oneHourAgo)->get();

            foreach ($giftInvites as $giftInvite) {
                // Delete related users
                $giftInvite->users()->delete();

                // Now delete the GiftInvite
                $giftInvite->delete();
            }

            Log::info('GiftInvites deleted successfully.');
        } catch (QueryException $e) {
            Log::error('Error deleting GiftInvites: ' . $e->getMessage());
        }

        try {
            // Delete SendFiles and associated ShareFiles if 24 hours or more have passed
            $files = SendFile::with('shareFiles')->where('created_at', '<=', now()->subHours(24))->get();

            foreach ($files as $file) {
                // Delete associated ShareFiles
                $file->shareFiles()->delete();

                // Delete the file from the S3 bucket
                Storage::disk('s3')->delete($file->path);

                // Delete the SendFile record
                $file->delete();
            }

            Log::info('SendFiles and associated ShareFiles deleted successfully.');
        } catch (QueryException $e) {
            Log::error('Error deleting SendFiles and associated ShareFiles: ' . $e->getMessage());
        }

        Log::info('Expired data deletion completed.');
    }
}
