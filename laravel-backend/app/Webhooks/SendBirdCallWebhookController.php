<?php

namespace App\Webhooks;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use stdClass;
use Throwable;
use App\Helpers\Helper;


class SendBirdCallWebhookController extends Controller
{

    public function handle(Request $request)
    {

        info("call webhooks",[$request->all()]);
        $event = new stdClass();
        try {
            $event = $this->validateWebhook($request);
        } catch (\Throwable) {
            http_response_code(400);
            exit();
        }

        $this->sendSocket($request);
        
        http_response_code(200);
    }

    private function validateWebhook(Request $request)
    {
        $endpointSecret = config('services.sendBird.key');
        $sendBirdID = $request->application_id ?? null;
        if($endpointSecret != $sendBirdID){
            http_response_code(403);
        }
        return $request;
    }


    private function sendSocket(Request $request){

        Helper::emit($request->all(), 'sendbirdCall');

    }

    
}
