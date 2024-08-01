<!doctype html>
<html lang="en">
  @include('front.components.stylesheets')
  <body>
  @include('front.components.head')
    <div class="container">
      @yield('content')
    </div>
    @include('front.components.scripts')
  </body>
</html>