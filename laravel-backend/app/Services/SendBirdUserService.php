<?php


namespace App\Services;

use App\Repositories\SendBirdUserRepository;

class SendBirdUserService{

    
    public function __construct(protected SendBirdUserRepository $sendBirdRepository)
    {
        
    }


    public function createUser($user){
        return $this->sendBirdRepository->createUser($user);
    }

}