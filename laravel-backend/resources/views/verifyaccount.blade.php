<!doctype html>
<html lang="en">

<head>

    <meta charset="utf-8" />
    <title>OutrighTalk</title>
    <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
    <meta content="Premium Multipurpose Admin & Dashboard Template" name="description" />
    <meta content="Themesbrand" name="author" />
    <!-- App favicon -->
    <link rel="shortcut icon" href="assets/images/favicon.ico">

    <!-- Bootstrap Css -->
    <link href="../../administrator/assets/css/bootstrap.min.css" id="bootstrap-style" rel="stylesheet" type="text/css" />
    
    <!-- App Css-->
    <link href="../../administrator/assets/css/app.min.css" id="app-style" rel="stylesheet" type="text/css" />
    <link href="../../administrator/assets/css/brand.css" id="app-style" rel="stylesheet" type="text/css" />
</head>

<body style="background: url('../../img/bg-all.jpg')">
    <div class="account-pages my-5 pt-sm-5">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-8 col-lg-8 col-xl-5">
                    <div class="card overflow-hidden">
                        <div class="bg-soft-primary">
                            <div class="row">
                                <div class="col-12">
                                    <div class="text-primary p-4 text-center">
                                        <img src="../../img/logo.png" alt="logo">
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div class="card-body pt-0 login thankyou">
                            <div class="p-2 pl-3 pr-3 pt-4 pb-3">
                                <form class="form-horizontal" action="index.html">
                                    @if($response['success'])
                                        <div class="thankyou-icon">
                                            <img src="../../img/thankyou-icon.png">
                                        </div>
                                        <div class="thankyou-text">
                                            <h1>Thank You</h1>
                                            <h2>{{ $response['message'] }}</h2>
                                        </div>                                        
                                    @else
                                        <div class="thankyou-text">
                                            <h2>{{ $response['message'] }}</h2>
                                        </div>
                                    @endif
                                                                           
                                </form>
                            </div>

                        </div>                        
                    </div>


                </div>
            </div>
        </div>
    </div>
</body>

</html>