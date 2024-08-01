<?php

use App\Http\Controllers\Api\CommonController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

$api_version = config('api.api_version');


Route::group(['prefix' => "{$api_version}", 'middleware' => ['api']], function () {
    Route::post('login', 'Auth\Api\LoginController@login');
    Route::post('login/mode', 'Auth\Api\LoginController@getLoginMode');
    Route::post('register/{step}', 'Auth\Api\RegisterController@registerStepCreate');
    Route::match(['GET', 'POST'], 'register/{step}/{uid}', 'Auth\Api\RegisterController@registerStepUpdate');
    Route::post('check/nickname', 'Auth\Api\RegisterController@checkNickname');

    Route::post('forgot/password', 'Auth\Api\LoginController@forgotPassword');
    Route::post('forgot/password/question', 'Auth\Api\LoginController@forgotPasswordQuestion');
    Route::post('forgot/password/otp', 'Auth\Api\LoginController@forgotPasswordOtp');
    Route::post('set/password', 'Auth\Api\LoginController@setPassword');

    Route::post('verify/email', 'Auth\Api\LoginController@verifyEmail');
    Route::get('captcha', 'Api\InitController@captcha');
    Route::get('genders', 'Api\CommonController@getGenderList');
    Route::get('secret/questions', 'Api\CommonController@getSecretQuestionList');
    Route::get('country/list', 'Api\CommonController@getCountryList');

    Route::group(['prefix' => 'cron'], function () {
        Route::get('check/user/online', 'Api\CronController@getUserOnlineStatus');
        Route::get('delete/banned-user', 'Api\CronController@deleteBannedUser');
    });
    Route::get('versions', 'Api\CommonController@versionDetails');
    Route::post('cms-contents', 'Api\CommonController@cmsListDetails');

    Route::post('retrieve/checkout/session', 'Api\SubscriptionController@getCheckoutSession');
    Route::post('retrieve/virtual/gift/checkout/session', 'Api\SubscriptionController@getVirtualGiftCheckoutSession');
    Route::post('sendbird/webhook', 'Api\CommonController@handleSendbirdWebhookEvent');
});

Route::group(['prefix' => "{$api_version}", 'middleware' => ['auth:api', 'permission']], function () {
    Route::post('auth/logout', 'Auth\Api\LoginController@logout');
    Route::get('init', 'Api\InitController@initialDetails');

    Route::get('activeroom/init', 'Api\RoomController@getActiveRoomInitDetails');

    Route::group(['prefix' => 'users'], function () {
        Route::post('avatar', 'Api\UserController@uploadAvatar');
        Route::post('password', 'Api\UserController@updatePassword');
        Route::post('update', 'Api\UserController@update');
        Route::post('change-my-status', 'Api\UserController@changeVisibleStatus');
        Route::post('show-profile-picture', 'Api\UserController@showProfilePicture');
        Route::post('find/nearby', 'Api\UserController@findNearByUsers');
        Route::post('update/current/location', 'Api\UserController@updateCurrentLocation');
        Route::post('details', 'Api\UserController@userDetails');
        Route::post('check/password', 'Api\UserController@checkPassword');
        Route::post('update/about-us', 'Api\UserController@updateAboutUs');
        Route::get('clear/about-us', 'Api\UserController@clearAboutUs');
    });

    Route::group(['prefix' => 'rooms'], function () {
        Route::post('createSystemRoom', 'Api\RoomController@createSystemRoom');
        Route::post('saveUnsaveChat', 'Api\RoomController@saveUnsaveChat');
        Route::post('getAutosaveStatus', 'Api\RoomController@getAutosaveStatus');
        Route::get('type', 'Api\RoomController@getRoomTypes');
        Route::get('group/{category_id?}', 'Api\RoomController@getRoomGroups');
        Route::get('language', 'Api\RoomController@getRoomLanguages');
        Route::get('category', 'Api\RoomController@getRoomCategories');
        Route::post('create', 'Api\RoomController@createRoom');
        Route::post('createVipRoom', 'Api\RoomController@createVipRoom');
        Route::post('update/{room_id}', 'Api\RoomController@updateRoom');
        Route::match(['GET', 'POST'], 'list', 'Api\RoomController@roomListCategoryWise');
        Route::post('verify/lockword', 'Api\RoomController@verifyLockword');
        Route::post('verify/admincode', 'Api\RoomController@verifyAdmincode');
        Route::post('verify/invitationcode', 'Api\RoomController@verifyInvitationCode');
        Route::post('verify/roompassword', 'Api\RoomController@verifyRoomPassword');
        Route::post('join', 'Api\RoomController@joinRoom');
        Route::post('check/simultaneous', 'Api\RoomController@simultaneousCheck');
        Route::get('details/{room_id}', 'Api\RoomController@getRoomDetails');
        Route::post('add/favourite', 'Api\RoomController@addFavourite');
        Route::post('remove/favourite', 'Api\RoomController@removeFavourite');
        Route::post('add/like', 'Api\RoomController@addLike');
        Route::post('remove/like', 'Api\RoomController@removeLike');
        Route::post('manage/topic', 'Api\RoomController@manageTopic');
        Route::get('my/active/rooms', 'Api\RoomController@myActiveRooms');
        Route::get('exit/room/{room_id}', 'Api\RoomController@exitFromRoom');
        Route::get('delete/{room_id}', 'Api\RoomController@deleteRoom');

        Route::post('admin/list', 'Api\RoomController@getAdminList');
        Route::post('delete/admin', 'Api\RoomController@deleteAdmin');
        Route::post('add/admin', 'Api\RoomController@addAdmin');

        Route::post('admin/control/panel', 'Api\RoomController@getAdminCPInfo');
        Route::post('admin/control/panel/save', 'Api\RoomController@saveAdminCPInfo');
        Route::post('removed/kick/users', 'Api\RoomController@removedUserFrmKick');
        Route::post('removed/banned/users', 'Api\RoomController@removedUserFrmBan');
        Route::post('banned/users', 'Api\RoomController@banUsers');

        Route::get('my/room', 'Api\RoomController@myRooms');
        Route::get('category-with-subcategory', 'Api\CommonController@roomCategoryWithSubcategory');
        Route::post('favourite/room', 'Api\RoomController@favouriteRooms');
        Route::get('favourite/list', 'Api\RoomController@favouriteRoomlists');
        Route::get('favourite/folders/list', 'Api\RoomController@favouriteFolders');
        Route::post('customize/room/name', 'Api\RoomController@customizeRoomname');
        Route::post('create/favourite/folder', 'Api\RoomController@createFolder');
        Route::get('favourite/folder', 'Api\RoomController@favouriteFolderList');
        Route::post('assign/favourite/folder', 'Api\RoomController@assignToFolder');
        Route::post('delete/favourite/folder', 'Api\RoomController@deleteFolder');

        Route::group(['prefix' => 'category'], function () {
            Route::match(['GET', 'POST'], 'list', 'Api\RoomController@getCategoryList');


        });

        Route::group(['prefix' => 'actions'], function () {
            Route::post('customize/nickname', 'Api\RoomActionController@customizeNickname');
            Route::post('kick/user', 'Api\RoomActionController@kickUser');
            Route::post('remove/hand', 'Api\RoomActionController@removeHand');
            Route::post('raise/hand', 'Api\RoomActionController@raiseHand');
            Route::post('remove/raise/hand', 'Api\RoomActionController@removeRaiseHand');
            Route::post('add/ignore', 'Api\RoomActionController@addToIgnore');
            Route::post('remove/ignore', 'Api\RoomActionController@removeIgnore');
            Route::post('red/dot/user', 'Api\RoomActionController@redDotToUser');

            Route::post('remove/all/hand', 'Api\RoomActionController@removeAllHand');
            Route::post('disable/invitation', 'Api\RoomActionController@disableInvitation');
            Route::post('red/dot/all', 'Api\RoomActionController@redDotToAll');
            Route::post('give/mic/all', 'Api\RoomActionController@giveMicToAll');
            Route::post('remove/all/mic', 'Api\RoomActionController@removeAllMic');
            Route::post('simultaneous/mic', 'Api\RoomActionController@simultaneousMic');
            Route::post('grab/mic', 'Api\RoomActionController@grabMic');

            Route::post('change/setting', 'Api\RoomActionController@changeSettings');
            Route::post('clear/text/chat', 'Api\RoomActionController@clearTextChat');

            Route::post('play/upload/video', 'Api\RoomActionController@playAVideo');
            Route::post('accept/play/video', 'Api\RoomActionController@acceptPlayVideo');
            Route::post('reject/play/video', 'Api\RoomActionController@rejectPlayVideo');
            Route::post('remove/play/video', 'Api\RoomActionController@removePlayVideo');

            Route::post('save/default/settings', 'Api\RoomActionController@saveDefaultRoomSettings');
            Route::post('userwise/save/default/settings', 'Api\RoomActionController@userWiseSaveDefaultRoomSettings');
            Route::post('reset/default/settings', 'Api\RoomActionController@resetDefaultRoomSettings');
            Route::post('who/viewing/me', 'Api\RoomActionController@whoIsViewingMe');



            Route::post('close', 'Api\RoomActionController@closeRoom');
            Route::get('join/admin/list', 'Api\RoomActionController@joinAdminList');
            Route::post('join/verify/admincode', 'Api\RoomActionController@verifyAdmincode');
        });

        Route::post('upload/video', 'Api\RoomController@uploadVideo');
        Route::post('find/join', 'Api\RoomController@findAndJoin');
        Route::post('invite', 'Api\RoomController@invite');
        Route::post('invite/instant', 'Api\RoomController@instantInvite');
        Route::post('is_camera_onoff', 'Api\RoomController@cameraOnOff');

        Route::post('view/video', 'Api\RoomController@startViewVideo');

    });

    Route::group(['prefix' => 'chats'], function () {
        Route::post('dowload/pdf', 'Api\ChatController@getAllChats');
        Route::post('fetch-all', 'Api\ChatController@getAllChats');
        Route::get('history', 'Api\ChatController@getChatHistory');
        Route::post('post', 'Api\ChatController@postChats');
        Route::post('save', 'Api\ChatController@saveChats');
        Route::post('clearAllChatForMe', 'Api\ChatController@clearAllChatForMe');
        Route::post('save/translations', 'Api\ChatController@saveChatTranslations');
    });

    Route::group(['prefix' => 'stickers'], function () {
        Route::post('categories', 'Api\StickerController@getCategories');
        Route::post('get/all', 'Api\StickerController@getStickers');
        Route::post('buy', 'Api\StickerController@buySticker');
        Route::post('buy-package', 'Api\StickerController@buyPackage');
        Route::get('own', 'Api\StickerController@ownSticker');
        Route::post('send/gift', 'Api\StickerController@sendGift');
        Route::post('accept/gift', 'Api\StickerController@acceptGift');
        Route::post('send/pack', 'Api\StickerController@sendPack');
        Route::get('stickerWithCategories', 'Api\StickerController@getCategoriesWithSticker');
    });

    Route::group(['prefix' => 'preferences'], function () {
        Route::get('get-all/{type?}', 'Api\PreferenceController@getAllPreference');
        Route::post('save', 'Api\PreferenceController@savePreference');

        Route::post('get-parental-info', 'Api\PreferenceController@getParentalPreference');
        Route::post('save/parental', 'Api\PreferenceController@saveParentalPreference');
        Route::post('delete/parental', 'Api\PreferenceController@deleteParentalPreference');
        Route::post('reset/parental/password', 'Api\PreferenceController@sendOtp');
        Route::post('forgot/password/otp', 'Api\PreferenceController@forgotPasswordOtp');
        Route::post('set/parental/password', 'Api\PreferenceController@setPassword');

        Route::get('get/auto/reply/message', 'Api\PreferenceController@getAutoReplyMessage');

        //Route::post('save/auto/message', 'Api\PreferenceController@saveAutoReplyMessage');
        //Route::get('user/list', 'Api\PreferenceController@getAllUserList');
        Route::post('contact/list', 'Api\PreferenceController@getContactList');
        Route::post('remove/contactlist/all', 'Api\PreferenceController@removeAllContact');
        Route::post('block/list', 'Api\PreferenceController@getBlockList');
        Route::post('remove/blocklist/all', 'Api\PreferenceController@removeAllBlockUser');
        Route::post('upload/gallery', 'Api\PreferenceController@uploadGalleryImage');
        Route::get('all/gallery', 'Api\PreferenceController@getAllGalleryImages');
        Route::post('delete/gallery', 'Api\PreferenceController@deleteGalleryImage');
        Route::post('delete/all/gallery', 'Api\PreferenceController@deleteAllGalleryImage');
        Route::get('my/accounts', 'Api\PreferenceController@getAllAcounts');
        //Route::post('delete/account', 'Api\PreferenceController@deleteAcount');
        //Route::post('undo/account', 'Api\PreferenceController@undoAcount');
        Route::post('upload/customize/sound', 'Api\PreferenceController@uploadCustomizeSound');
        Route::get('all/customize/sound', 'Api\PreferenceController@getAllCustomizeSound');
        Route::post('delete/customize/sound', 'Api\PreferenceController@deleteCustomizeSound');
        Route::post('save/translation/language', 'Api\PreferenceController@saveTranslationPreference');
    });

    Route::group(['prefix' => 'vvmessage'], function () {
        Route::get('is-page/password/protected/{type}', 'Api\MessageController@checkPasswordEnable');
        Route::post('check/password', 'Api\MessageController@checkPassword');
        Route::get('contact/list/{type?}', 'Api\MessageController@getContactList');
        Route::post('check/users', 'Api\MessageController@checkUserAvailability');
        Route::post('send/message', 'Api\MessageController@sendMessage');
        Route::get('list/{type}', 'Api\MessageController@messageList');
        Route::post('delete/message', 'Api\MessageController@deleteMessage');
        Route::post('restore/message', 'Api\MessageController@restoreMessage');
        Route::post('view/message', 'Api\MessageController@viewMessage');
    });

    Route::group(['prefix' => 'notebook'], function () {
        Route::get('list', 'Api\NotebookController@allList');
        Route::post('create', 'Api\NotebookController@create');
        Route::post('update', 'Api\NotebookController@update');
        Route::post('share', 'Api\NotebookController@share');
        Route::post('details', 'Api\NotebookController@details');
        Route::post('delete', 'Api\NotebookController@delete');
        Route::post('remove/share', 'Api\NotebookController@removeShare');
        Route::post('contact/list', 'Api\NotebookController@contactList');
        Route::post('upload/image', 'Api\NotebookController@imgeUpload');
    });

    Route::group(['prefix' => 'subscription'], function () {
        Route::group(['prefix' => 'room'], function () {
            Route::get('list/{room_id}', 'Api\SubscriptionController@getList');
            Route::post('process', 'Api\SubscriptionController@processRoomSubscription');
            Route::post('remove', 'Api\SubscriptionController@removeRoomSubscription');
            Route::post('update-colour', 'Api\SubscriptionController@updateSubsColor');
        });
        Route::group(['prefix' => 'nickname'], function () {
            Route::get('list', 'Api\SubscriptionController@getNicknameList');
            Route::post('process', 'Api\SubscriptionController@processNicknameSubscription');
            Route::get('remove', 'Api\SubscriptionController@removeNicknameSubscription');
        });
        Route::post('buy/plan', 'Api\SubscriptionController@buyPlan');
        Route::post('send/gift', 'Api\SubscriptionController@sendGift');
        Route::post('accept/gift', 'Api\SubscriptionController@acceptGift');
        Route::post('switch', 'Api\SubscriptionController@switchCurrentSubscription');
    });

    Route::group(['prefix' => 'virtual/gift'], function () {
        Route::get('credit/list', 'Api\SubscriptionController@getVirtualGiftCreditList');
        Route::post('process', 'Api\SubscriptionController@processVirtualGiftCredit');
        Route::post('credit/send', 'Api\SubscriptionController@sendVirtualGiftCredit');
        Route::post('credit/accept', 'Api\SubscriptionController@acceptVirtualGiftCredit');
    });

    Route::group(['prefix' => 'pms'], function () {
        Route::post('send', 'Api\PmController@sendPm'); // Create PM or Retrieve if Exist
        Route::post('details', 'Api\PmController@pmDetails'); // Get Detail of the PM
        Route::post('add', 'Api\PmController@pmAdd'); // Add user in PM
        Route::post('add/new', 'Api\PmController@pmAddNew');// Add user in PM new
        Route::post('sendInvite', 'Api\PmController@sendInvite'); //send invite in pm 
        Route::post('send/chat', 'Api\PmController@sendChat');
        Route::post('get/chat', 'Api\PmController@getAllChats');
        Route::post('read', 'Api\PmController@readPms');
        Route::get('iam/in', 'Api\PmController@myActivePms');
        Route::post('remove/users', 'Api\PmController@removeUsers');  // Remove Users in PM
        Route::post('video/audio/onoff', 'Api\PmController@videoAudioOnOff');
        Route::post('acccept/audio/video', 'Api\PmController@acceptAudioVideo');
        Route::post('user/location', 'Api\PmController@showUserLocations');
        Route::post('exit', 'Api\PmController@exitFromPm');
        Route::post('multi/recipient', 'Api\PmController@multiRecipientMessage');

        Route::group(['prefix' => 'actions'], function () {
            Route::post('change/setting', 'Api\PmController@changeSettings');
            Route::post('save/default/settings', 'Api\PmController@saveDefaultPmSettings');
            Route::post('reset/default/settings', 'Api\PmController@resetDefaultPmSettings');
            Route::get('dig/sound/list', 'Api\PmController@digSoundList');
            Route::post('dig/sound/send', 'Api\PmController@sendDigSound');
            Route::post('clear/text/chat', 'Api\PmController@clearTextChat');
        });
    });



    Route::group(['prefix' => 'badge'], function () {
        Route::get('details', 'Api\BadgeController@myBadgeDetails');
        Route::get('awardedBadges', 'Api\BadgeController@awardedBadges');
        Route::post('sharePointsNotify', 'Api\BadgeController@sharePointsNotify');
        Route::post('acceptPoints', 'Api\BadgeController@acceptPoints');
        Route::post('rejectPoints', 'Api\BadgeController@rejectPoints');
    });


    Route::group(['prefix' => 'file'], function () {
        Route::post('send', 'Api\FileController@sendFile');
        Route::post('download', 'Api\FileController@downloadFile');
    });

    Route::group(['prefix' => 'wallet'], function () {
        Route::get('getDetailsWallet', 'Api\WalletController@getDetailsWallet');
        Route::post('withdraw-money', 'Api\WalletController@withdrawMoney');
        Route::post('addCashInPointsExchange', 'Api\WalletController@addCashInPointsExchange');
    });

    Route::post('contact/list', 'Api\CommonController@contactList');
    Route::post('add/contactlist', 'Api\RoomActionController@addToContactList'); // Add User to Contact List
    Route::post('importContacts', 'Api\RoomActionController@importContacts');
    Route::post('importBlocked', 'Api\RoomActionController@importBlocked');

    Route::post('add/favourite/contactlist', 'Api\RoomActionController@addAsFavouriteContactList');
    Route::post('remove/contactlist', 'Api\RoomActionController@removeFromContactList');
    Route::post('remove/favouritelist', 'Api\RoomActionController@removeFromFavouriteList');
    Route::post('add/favourite', 'Api\RoomActionController@addFavourite');

    Route::post('add/blocklist', 'Api\RoomActionController@addToBlockList');
    Route::post('remove/blocklist', 'Api\RoomActionController@removeFromBlockList');

    Route::get('left/menu/list', 'Api\CommonController@leftMenuItems');

    Route::post('find/add/user', 'Api\CommonController@findAndAddUser');

    Route::get('notifications', 'Api\CommonController@notification');
    Route::post('close/notification', 'Api\CommonController@notificationClose');
    Route::post('invite/email', 'Api\CommonController@emailInvite');

    Route::get('user-credits', 'Api\CommonController@getUserCredits');
    //Route::post('redeem-credits', 'Api\CommonController@redeemUserCredits');

    Route::get('user-translation-chars', 'Api\CommonController@getUserTranslationChars');
    Route::post('purchase-translation-chars', 'Api\CommonController@purchaseTranslationChars');
    Route::post('redeem-translation-chars', 'Api\CommonController@reedemTranslationChars');
    Route::get('translation/languages', 'Api\CommonController@getTranslationLanguages');
    Route::post('create/group/channel', 'Api\CommonController@createGroupChannel');

});


