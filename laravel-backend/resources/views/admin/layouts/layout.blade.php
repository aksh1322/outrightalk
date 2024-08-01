<!doctype html>
<html lang="en">
@include('admin.components.head')
<body data-sidebar="dark">

    <!-- <body data-layout="horizontal" data-topbar="dark"> -->

        <!-- Begin page -->
        <div id="layout-wrapper">
            @include('admin.components.header')
            @include('admin.components.sidemenu')
            @include('admin.components.flash-message')

            <!-- ============================================================== -->
            <!-- Start right Content here -->
            <!-- ============================================================== -->
            <div class="main-content">

                <div class="page-content">
                    <div class="container-fluid">

                        <!-- start page title -->
                        <div class="row">
                            <div class="col-12">
                                <div class="page-title-box d-flex align-items-center justify-content-between">
                                    <h4 class="mb-0 font-size-18 animate__animated animate__heartBeat">{{ $title }}</h4>

                                    <div class="page-title-right">
                                        @include('admin.components.breadcrumb')
                                    </div>

                                </div>
                            </div>
                        </div>
                        <!-- end page title -->
                        <h4 class="media-heading"></h4>
                        <div class="row">
                            <div class="col-lg-12">
                                @if(isset($noCardView) && $noCardView)
                                    @yield('content')
                                @else
                                    <div class="card  animate__animated  animate__fadeInUp">
                                        <div class="card-body">
                                            <div class="row">
                                                @if(isset($title) && isset($header_buttons))
                                                <div class="col-lg-8 col-md-8 col-sm-12 col-xs-12">
                                                    <h4 class="card-title">{{ $title }}</h4>
                                                    @if(isset($data) && method_exists($data, 'currentPage'))
                                                    <p class="card-title-desc">Showing page <code>{{ $data->currentPage() }}</code> of <code>{{ $data->lastPage() }}</code>.
                                                    </p>
                                                    @endif
                                                </div>

                                                <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12 text-right">
                                                    @foreach($header_buttons as $button)
                                                        {!! $button !!}
                                                    @endforeach
                                                    @if(isset($filters) && !empty($filters))
                                                        <button data-toggle="tooltip" data-original-title="Filter Record" class="btn btn-primary waves-effect show-panel" data-id="filter-panel">{!! \Config::get('settings.icon_search') !!}</button>
                                                    @endif
                                                </div>
                                                @endif
                                            </div>


                                            @if(isset($filters) && !empty($filters))
                                            <div class="row clearfix m-t-10" id="filter-panel" <?php echo(\Request::input('filter')) ? 'style="display: block;"' : 'style="display: none;"'; ?>>
                                                <div class="col-lg-12 col-sm-12">
                                                @include('admin.components.filter-form')
                                                </div>
                                            </div>
                                            @endif
                                            @yield('content')

                                        </div>
                                        @yield('card-footer')
                                    </div>
                                </div>
                            @endif

                        </div>

                    </div> <!-- container-fluid -->
                </div>
                <!-- End Page-content -->

                @include('admin.components.footer')

            </div>
            <!-- end main content-->

        </div>
        <!-- END layout-wrapper -->

        <!-- JAVASCRIPT -->
        @include('admin.components.scripts')

    </body>
</html>

