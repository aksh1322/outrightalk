<!doctype html>
<html lang="en">
  @include('admin.components.head')
  <body>
    <div class="account-pages my-5 pt-sm-5">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-8 col-lg-6 col-xl-5">
                    <div class="card overflow-hidden">
                        @yield('content')
                    </div>
                </div>
            </div>
        </div>
    </div>
    @include('admin.components.scripts')
  </body>
</html>
