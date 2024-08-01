@php ($headerOption = [
    'title' => 'Welcome to Dashboard',
    'noCardView' => true
])
@extends('admin.layouts.layout', $headerOption)

@section('content')
<div class="row">
    <div class="col-xl-8">
        <div class="row">
            <div class="col-lg-4">
                <div class="card blog-stats-wid">
                    <div class="card-body">

                        <div class="d-flex flex-wrap">
                            <div class="mr-3">
                                <p class="text-muted mb-2">Pages</p>
                                <h5 class="mb-0">86</h5>
                            </div>

                            <div class="avatar-sm ml-auto">
                                <div class="avatar-title bg-light rounded-circle text-primary font-size-20">
                                    <i class="bx bxs-note"></i>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="card blog-stats-wid">
                    <div class="card-body">
                        <div class="d-flex flex-wrap">
                            <div class="mr-3">
                                <p class="text-muted mb-2">Comments</p>
                                <h5 class="mb-0">4,235</h5>
                            </div>

                            <div class="avatar-sm ml-auto">
                                <div class="avatar-title bg-light rounded-circle text-primary font-size-20">
                                    <i class="bx bxs-message-square-dots"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- end row -->

        <div class="card">
            <div class="card-body">
                <div class="d-flex flex-wrap">
                    <h5 class="card-title mr-2">Visitors</h5>
                    <div class="ml-auto">
                        <div class="toolbar button-items text-right">
                            <button type="button" class="btn btn-light btn-sm">
                                ALL
                            </button>
                            <button type="button" class="btn btn-light btn-sm">
                                1M
                            </button>
                            <button type="button" class="btn btn-light btn-sm">
                                6M
                            </button>
                            <button type="button" class="btn btn-light btn-sm active">
                                1Y
                            </button>

                        </div>
                    </div>
                </div>

                <div class="row text-center">
                    <div class="col-lg-4">
                        <div class="mt-4">
                            <p class="text-muted mb-1">Today</p>
                            <h5>1024</h5>
                        </div>
                    </div>

                    <div class="col-lg-4">
                        <div class="mt-4">
                            <p class="text-muted mb-1">This Month</p>
                            <h5>12356 <span class="text-success font-size-13">0.2 % <i class="mdi mdi-arrow-up ml-1"></i></span></h5>
                        </div>
                    </div>

                    <div class="col-lg-4">
                        <div class="mt-4">
                            <p class="text-muted mb-1">This Year</p>
                            <h5>102354 <span class="text-success font-size-13">0.1 % <i class="mdi mdi-arrow-up ml-1"></i></span></h5>
                        </div>
                    </div>
                </div>

                <hr class="mb-4">

                <div class="apex-charts" id="area-chart" dir="ltr"></div>
            </div>
        </div>
    </div>
    <!-- end col -->

    <div class="col-xl-4">
        <div class="card">
            <div class="card-body">
                <div class="media">
                    <div class="mr-3">
                        <img src="assets/images/users/avatar-1.jpg" alt="" class="avatar-sm rounded-circle img-thumbnail">
                    </div>
                    <div class="media-body">
                        <div class="media">
                            <div class="media-body">
                                <div class="text-muted">
                                    <h5 class="mb-1">Henry wells</h5>
                                    <p class="mb-0">UI / UX Designer</p>
                                </div>

                            </div>

                            <div class="dropdown ml-2">
                                <button class="btn btn-light btn-sm dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <i class="bx bxs-cog align-middle mr-1"></i> Setting
                                </button>
                                <div class="dropdown-menu dropdown-menu-right">
                                    <a class="dropdown-item" href="#">Action</a>
                                    <a class="dropdown-item" href="#">Another action</a>
                                    <a class="dropdown-item" href="#">Something else</a>
                                </div>
                            </div>
                        </div>


                        <hr>

                        <div class="row">
                            <div class="col-4">
                                <div>
                                    <p class="text-muted text-truncate mb-2">Total Post</p>
                                    <h5 class="mb-0">32</h5>
                                </div>
                            </div>
                            <div class="col-4">
                                <div>
                                    <p class="text-muted text-truncate mb-2">Subscribes</p>
                                    <h5 class="mb-0">10k</h5>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>

            </div>
        </div>

        <div class="card">
            <div class="card-body">
                <div class="d-flex flex-wrap">
                    <h5 class="card-title mb-3 mr-2">Subscribes</h5>

                    <div class="dropdown ml-auto">
                        <a class="text-muted dropdown-toggle font-size-16" role="button" data-toggle="dropdown" aria-haspopup="true">
                            <i class="mdi mdi-dots-horizontal"></i>
                        </a>

                        <div class="dropdown-menu dropdown-menu-right">
                            <a class="dropdown-item" href="#">Action</a>
                            <a class="dropdown-item" href="#">Another action</a>
                            <a class="dropdown-item" href="#">Something else here</a>
                            <div class="dropdown-divider"></div>
                            <a class="dropdown-item" href="#">Separated link</a>
                        </div>
                    </div>
                </div>

                <div class="d-flex flex-wrap">
                    <div>
                        <p class="text-muted mb-1">Total Subscribe</p>
                        <h4 class="mb-3">10,512</h4>
                        <p class="text-success mb-0"><span>0.6 % <i class="mdi mdi-arrow-top-right ml-1"></i></span></p>
                    </div>
                    <div class="ml-auto align-self-end">
                        <i class="bx bx-group display-4 text-light"></i>
                    </div>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-body p-4">
                <div class="text-center">
                    <div class="avatar-md mx-auto mb-4">
                        <div class="avatar-title bg-light rounded-circle text-primary h1">
                            <i class="mdi mdi-email-open"></i>
                        </div>
                    </div>

                    <div class="row justify-content-center">
                        <div class="col-xl-10">
                            <h4 class="text-primary">Subscribe !</h4>
                            <p class="text-muted font-size-14 mb-4">Subscribe our newletter and get notification to stay update.</p>

                            <div class="input-group bg-light rounded">
                                <input type="email" class="form-control bg-transparent border-0" placeholder="Enter Email address" aria-label="Recipient's username" aria-describedby="button-addon2">
                                <div class="input-group-append">
                                    <button class="btn btn-primary rounded" type="button" id="button-addon2">
                                        <i class="bx bxs-paper-plane"></i>
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- end col -->

</div>


@endsection
